export type Entity = "clients" | "workers" | "tasks";

const num = (s: string) => Number(s.trim());
const str = (s: string) => s.trim().replace(/^"(.+)"$|^'(.+)'$/, "$1$2");

export function evaluateDSL<T extends Record<string, any>>(
  entity: Entity,
  dsl: string,
  rows: T[]
): T[] {
  if (!dsl.trim()) return rows;
  const clauses = splitByTopLevel(dsl);
  return rows.filter((row) => evalClauses(entity, row, clauses));
}

type Clause = { op: "AND" | "OR"; expr: string };

function splitByTopLevel(dsl: string): Clause[] {
  const tokens = dsl.split(/\s+(AND|OR)\s+/i);
  const parts: Clause[] = [];
  let op: "AND" | "OR" = "AND";
  for (let i = 0; i < tokens.length; i++) {
    if (i % 2 === 0) {
      const expr = tokens[i].trim();
      if (expr) parts.push({ op, expr });
    } else {
      op = tokens[i].toUpperCase() as "AND" | "OR";
    }
  }
  return parts;
}

function evalClauses(
  entity: Entity,
  row: Record<string, any>,
  clauses: Clause[]
): boolean {
  let acc = true;
  for (const { op, expr } of clauses) {
    const ok = evalExpr(entity, row, expr);
    acc = op === "AND" ? acc && ok : acc || ok;
  }
  return acc;
}

function evalExpr(
  entity: Entity,
  row: Record<string, any>,
  expr: string
): boolean {
  // includes(field, value)
  const inc = expr.match(/^includes\(\s*([a-z0-9\.\_]+)\s*,\s*(.+)\)$/i);
  if (inc) {
    const path = inc[1].toLowerCase();
    const raw = inc[2];
    const v = /^[0-9]+$/.test(raw) ? num(raw) : str(raw);
    const arr = getPath(entity, row, path);
    if (!Array.isArray(arr)) return false;
    if (typeof v === "number") {
      const normalized = arr.map((x) => Number(x));
      return normalized.includes(v);
    } else {
      const normalized = arr.map((x) => String(x).toLowerCase());
      return normalized.includes(String(v).toLowerCase());
    }
  }

  // comparisons: field >|<|>=|<=|== number
  const cmp = expr.match(/^([a-z0-9\.\_]+)\s*(>=|<=|==|>|<)\s*([0-9]+)$/i);
  if (cmp) {
    const lhs = Number(getPath(entity, row, cmp[1].toLowerCase()));
    const op = cmp[2];
    const rhs = num(cmp[3]);
    if (!Number.isFinite(lhs)) return false;
    switch (op) {
      case ">":
        return lhs > rhs;
      case "<":
        return lhs < rhs;
      case ">=":
        return lhs >= rhs;
      case "<=":
        return lhs <= rhs;
      case "==":
        return lhs === rhs;
    }
  }
  return false;
}

function getPath(entity: Entity, row: Record<string, any>, path: string): any {
  const map: Record<Entity, Record<string, string>> = {
    clients: {
      "client.prioritylevel": "PriorityLevel",
      "client.requestedtaskids": "RequestedTaskIDs",
    },
    workers: {
      "worker.skills": "Skills",
      "worker.availableslots": "AvailableSlots",
      "worker.maxloadperphase": "MaxLoadPerPhase",
    },
    tasks: {
      "task.duration": "Duration",
      "task.requiredskills": "RequiredSkills",
      "task.preferredphases": "PreferredPhases",
      "task.maxconcurrent": "MaxConcurrent",
    },
  };
  const key = map[entity][path] ?? path.split(".").pop() ?? path;
  return (row as any)[key];
}
