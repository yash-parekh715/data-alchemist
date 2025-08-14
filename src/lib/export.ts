import { Client } from "@/types/client";
import { Worker } from "@/types/worker";
import { Task } from "@/types/task";
import { Rule, Weights } from "@/types/rule";

const csvEscape = (v: unknown) => {
  if (v == null) return "";
  const s = String(v);
  const safe = /^[=+\-@]/.test(s) ? "'" + s : s; // neutralize CSV injection
  return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

const toCSV = (headers: string[], rows: Record<string, unknown>[]) => {
  const lines = [headers.map(csvEscape).join(",")];
  for (const r of rows)
    lines.push(headers.map((h) => csvEscape(r[h])).join(","));
  return lines.join("\n");
};

async function sha256(text: string): Promise<string> {
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function download(filename: string, content: string, type = "text/plain") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function exportAll(params: {
  clients: Client[];
  workers: Worker[];
  tasks: Task[];
  rules: Rule[];
  weights: Weights;
  validationReport: { errors: number; warnings: number };
}) {
  const { clients, workers, tasks, rules, weights, validationReport } = params;

  const clientsRows = [...clients]
    .sort((a, b) => a.ClientID.localeCompare(b.ClientID))
    .map((c) => ({
      ClientID: c.ClientID,
      ClientName: c.ClientName,
      PriorityLevel: c.PriorityLevel,
      RequestedTaskIDs: c.RequestedTaskIDs.join(","),
      GroupTag: c.GroupTag ?? "",
      AttributesJSON: c.AttributesJSON ? JSON.stringify(c.AttributesJSON) : "",
    }));

  const workersRows = [...workers]
    .sort((a, b) => a.WorkerID.localeCompare(b.WorkerID))
    .map((w) => ({
      WorkerID: w.WorkerID,
      WorkerName: w.WorkerName,
      Skills: w.Skills.join(","),
      AvailableSlots: w.AvailableSlots.join(","),
      MaxLoadPerPhase: w.MaxLoadPerPhase,
      WorkerGroup: w.WorkerGroup ?? "",
      QualificationLevel: w.QualificationLevel ?? "",
    }));

  const tasksRows = [...tasks]
    .sort((a, b) => a.TaskID.localeCompare(b.TaskID))
    .map((t) => ({
      TaskID: t.TaskID,
      TaskName: t.TaskName,
      Category: t.Category ?? "",
      Duration: t.Duration,
      RequiredSkills: t.RequiredSkills.join(","),
      PreferredPhases: t.PreferredPhases.join(","),
      MaxConcurrent: t.MaxConcurrent,
    }));

  const clientsCSV = toCSV(
    [
      "ClientID",
      "ClientName",
      "PriorityLevel",
      "RequestedTaskIDs",
      "GroupTag",
      "AttributesJSON",
    ],
    clientsRows
  );
  const workersCSV = toCSV(
    [
      "WorkerID",
      "WorkerName",
      "Skills",
      "AvailableSlots",
      "MaxLoadPerPhase",
      "WorkerGroup",
      "QualificationLevel",
    ],
    workersRows
  );
  const tasksCSV = toCSV(
    [
      "TaskID",
      "TaskName",
      "Category",
      "Duration",
      "RequiredSkills",
      "PreferredPhases",
      "MaxConcurrent",
    ],
    tasksRows
  );

  const hashes = {
    clients: await sha256(clientsCSV),
    workers: await sha256(workersCSV),
    tasks: await sha256(tasksCSV),
  };

  const metadata = {
    version: "1.0.0",
    createdAt: new Date().toISOString(),
    dataHashes: hashes,
    validationReport,
  };

  const rulesJson = JSON.stringify({ rules, weights, metadata }, null, 2);

  download("clients.csv", clientsCSV, "text/csv");
  download("workers.csv", workersCSV, "text/csv");
  download("tasks.csv", tasksCSV, "text/csv");
  download("rules.json", rulesJson, "application/json");
}
