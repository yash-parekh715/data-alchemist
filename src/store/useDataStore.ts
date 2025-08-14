import { create } from "zustand";
import { Client } from "@/types/client";
import { Worker } from "@/types/worker";
import { Task } from "@/types/task";
import { ValidationIssue } from "@/types/validation";

type DataState = {
  clients: Client[];
  workers: Worker[];
  tasks: Task[];
  issues: ValidationIssue[];
  setClients: (rows: Client[], issues: ValidationIssue[]) => void;
  setWorkers: (rows: Worker[], issues: ValidationIssue[]) => void;
  setTasks: (rows: Task[], issues: ValidationIssue[]) => void;
  patchClient: (id: string, patch: Partial<Client>) => void;
  // patchWorker: (id: string, patch: Partial[Worker]) => void;
  patchWorker: (id: string, patch: Partial<Worker>) => void;
  patchTask: (id: string, patch: Partial<Task>) => void;
  setIssues: (issues: ValidationIssue[]) => void;
};

export const useDataStore = create<DataState>((set, get) => ({
  clients: [],
  workers: [],
  tasks: [],
  issues: [],
  setClients: (rows, newIssues) =>
    set({
      clients: rows,
      issues: mergeIssues(get().issues, newIssues, "clients"),
    }),
  setWorkers: (rows, newIssues) =>
    set({
      workers: rows,
      issues: mergeIssues(get().issues, newIssues, "workers"),
    }),
  setTasks: (rows, newIssues) =>
    set({ tasks: rows, issues: mergeIssues(get().issues, newIssues, "tasks") }),
  patchClient: (id, patch) =>
    set({
      clients: get().clients.map((r) =>
        r.ClientID === id ? { ...r, ...patch } : r
      ),
    }),
  patchWorker: (id, patch) =>
    set({
      workers: get().workers.map((r) =>
        r.WorkerID === id ? { ...r, ...patch } : r
      ),
    }),
  patchTask: (id, patch) =>
    set({
      tasks: get().tasks.map((r) => (r.TaskID === id ? { ...r, ...patch } : r)),
    }),
  setIssues: (issues) => set({ issues }),
}));

function mergeIssues(
  existing: ValidationIssue[],
  incoming: ValidationIssue[],
  entity: "clients" | "workers" | "tasks"
) {
  const filtered = existing.filter((i) => i.entity !== entity);
  return [...filtered, ...incoming];
}
