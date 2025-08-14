/// <reference lib="webworker" />
import { Client } from "@/types/client";
import { Worker as W } from "@/types/worker";
import { Task } from "@/types/task";
import { Rule } from "@/types/rule";
import { ValidationIssue } from "@/types/validation";

type Req = {
  clients: Client[];
  workers: W[];
  tasks: Task[];
  rules: Rule[];
};
type Res = { issues: ValidationIssue[] };

self.onmessage = (e: MessageEvent<Req>) => {
  const { clients, workers, tasks, rules } = e.data;
  const issues: ValidationIssue[] = [];

  const taskById = new Map(tasks.map((t) => [t.TaskID, t]));
  const workerById = new Map(workers.map((w) => [w.WorkerID, w]));

  // Unknown references (clients -> tasks)
  for (const c of clients) {
    for (const tid of c.RequestedTaskIDs) {
      if (!taskById.has(tid)) {
        issues.push({
          entity: "clients",
          id: c.ClientID,
          field: "RequestedTaskIDs",
          severity: "error",
          message: `Unknown TaskID "${tid}" requested by client`,
          code: "XREF_CLIENT_TASK_MISSING",
        } as any);
      }
    }
  }

  // Skill coverage: every RequiredSkill has >=1 worker
  const allWorkerSkills = new Set<string>();
  workers.forEach((w) =>
    w.Skills.forEach((s) => allWorkerSkills.add(s.toLowerCase()))
  );
  for (const t of tasks) {
    for (const s of t.RequiredSkills) {
      if (!allWorkerSkills.has(s.toLowerCase())) {
        issues.push({
          entity: "tasks",
          id: t.TaskID,
          field: "RequiredSkills",
          severity: "error",
          message: `No worker provides required skill "${s}"`,
          code: "SKILL_COVERAGE_MISSING",
        } as any);
      }
    }
  }

  // Overloaded workers: AvailableSlots.length < MaxLoadPerPhase
  for (const w of workers) {
    if (w.MaxLoadPerPhase > w.AvailableSlots.length) {
      issues.push({
        entity: "workers",
        id: w.WorkerID,
        field: "MaxLoadPerPhase",
        severity: "error",
        message: `MaxLoadPerPhase (${w.MaxLoadPerPhase}) exceeds available slots (${w.AvailableSlots.length})`,
        code: "WORKER_OVERLOAD",
      } as any);
    }
  }

  // Phase-slot saturation heuristic
  const capacity: Record<number, number> = {};
  for (const w of workers) {
    for (const p of w.AvailableSlots)
      capacity[p] = (capacity[p] || 0) + w.MaxLoadPerPhase;
  }
  const demand: Record<number, number> = {};
  for (const t of tasks) {
    const phases = t.PreferredPhases.length
      ? t.PreferredPhases
      : [...new Set(workers.flatMap((w) => w.AvailableSlots))];
    const share = t.Duration / Math.max(1, phases.length);
    for (const p of phases) demand[p] = (demand[p] || 0) + share;
  }
  for (const p of Object.keys(demand).map(Number)) {
    if ((demand[p] || 0) > (capacity[p] || 0)) {
      issues.push({
        entity: "tasks",
        severity: "warning",
        message: `Phase ${p} demand (${demand[p].toFixed(
          2
        )}) exceeds capacity (${(capacity[p] || 0).toFixed(2)})`,
        code: "PHASE_SATURATION",
      } as any);
    }
  }

  // Max-concurrency feasibility
  const workerHasSkills = (w: W, req: string[]) =>
    req.every((s) =>
      w.Skills.map((x) => x.toLowerCase()).includes(s.toLowerCase())
    );
  for (const t of tasks) {
    const phases = t.PreferredPhases.length
      ? t.PreferredPhases
      : [...new Set(workers.flatMap((w) => w.AvailableSlots))];
    const qualifiedByPhase = phases.map(
      (p) =>
        workers.filter(
          (w) =>
            w.AvailableSlots.includes(p) && workerHasSkills(w, t.RequiredSkills)
        ).length
    );
    const maxQualified = Math.max(0, ...qualifiedByPhase);
    if (t.MaxConcurrent > maxQualified) {
      issues.push({
        entity: "tasks",
        id: t.TaskID,
        field: "MaxConcurrent",
        severity: "error",
        message: `MaxConcurrent (${t.MaxConcurrent}) exceeds qualified workers (${maxQualified}) across preferred phases`,
        code: "MAX_CONCURRENCY_INFEASIBLE",
      } as any);
    }
  }

  // Rule validations: coRun cycles and phase-window feasibility
  const coRuns = rules.filter((r) => r.type === "coRun") as any[];
  if (coRuns.length) {
    // Build undirected graph to detect cycles; also group co-run tasks
    const adj = new Map<string, Set<string>>();
    const addEdge = (a: string, b: string) => {
      if (!adj.has(a)) adj.set(a, new Set());
      if (!adj.has(b)) adj.set(b, new Set());
      adj.get(a)!.add(b);
      adj.get(b)!.add(a);
    };
    for (const r of coRuns) {
      for (let i = 0; i < r.tasks.length; i++) {
        for (let j = i + 1; j < r.tasks.length; j++)
          addEdge(r.tasks[i], r.tasks[j]);
      }
    }
    // Detect cycles with DFS
    const visited = new Set<string>();
    const dfs = (u: string, p?: string): boolean => {
      visited.add(u);
      for (const v of adj.get(u) || []) {
        if (v === p) continue;
        if (visited.has(v)) return true;
        if (dfs(v, u)) return true;
      }
      return false;
    };
    for (const node of adj.keys()) {
      if (!visited.has(node) && dfs(node)) {
        issues.push({
          entity: "tasks",
          severity: "warning",
          message:
            "Circular co-run group detected; consider merging tasks into one coRun rule",
          code: "CORUN_CYCLE",
        } as any);
        break;
      }
    }
    // Phase-window intersection for each connected coRun set
    const seen = new Set<string>();
    for (const start of adj.keys()) {
      if (seen.has(start)) continue;
      const group: string[] = [];
      const stack = [start];
      seen.add(start);
      while (stack.length) {
        const u = stack.pop()!;
        group.push(u);
        for (const v of adj.get(u) || []) {
          if (!seen.has(v)) {
            seen.add(v);
            stack.push(v);
          }
        }
      }
      const tasksInGroup = group
        .map((id) => taskById.get(id))
        .filter(Boolean) as Task[];
      if (tasksInGroup.length >= 2) {
        const intersection = tasksInGroup
          .map((t) => new Set(t.PreferredPhases))
          .reduce<Set<number>>(
            (acc, s, idx) =>
              idx === 0 ? s : new Set([...acc].filter((x) => s.has(x))),
            new Set()
          );
        const maxDur = Math.max(...tasksInGroup.map((t) => t.Duration));
        if (intersection.size < maxDur) {
          issues.push({
            entity: "tasks",
            severity: "error",
            message: `Co-run group ${group.join(
              ", "
            )} has insufficient common phases (need ≥ ${maxDur})`,
            code: "CORUN_PHASE_WINDOW_CONFLICT",
          } as any);
        }
      }
    }
  }

  const res: Res = { issues };
  (self as any).postMessage(res);
};
