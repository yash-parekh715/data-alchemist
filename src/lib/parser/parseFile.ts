import Papa from "papaparse";
import * as XLSX from "xlsx";
import { EntityKind } from "@/types/validation";

const CLIENT_HEADERS = [
  "clientid",
  "clientname",
  "prioritylevel",
  "requestedtaskids",
  "grouptag",
  "attributesjson",
];
const WORKER_HEADERS = [
  "workerid",
  "workername",
  "skills",
  "availableslots",
  "maxloadperphase",
  "workergroup",
  "qualificationlevel",
];
const TASK_HEADERS = [
  "taskid",
  "taskname",
  "category",
  "duration",
  "requiredskills",
  "preferredphases",
  "maxconcurrent",
];

const SYNONYMS: Record<string, string> = {
  // common misspellings / synonyms → canonical
  id: "id",
  client_id: "clientid",
  worker_id: "workerid",
  task_id: "taskid",
  priority: "prioritylevel",
  priority_level: "prioritylevel",
  req_tasks: "requestedtaskids",
  requested_tasks: "requestedtaskids",
  group: "grouptag",
  attrs: "attributesjson",
  available_slots: "availableslots",
  max_load_per_phase: "maxloadperphase",
  preferred_phases: "preferredphases",
  required_skills: "requiredskills",
  max_concurrent: "maxconcurrent",
};

export type HeaderMapping = Record<string, string>; // incoming -> canonical

const canonicalFor = (entity: EntityKind): string[] => {
  switch (entity) {
    case "clients":
      return CLIENT_HEADERS;
    case "workers":
      return WORKER_HEADERS;
    case "tasks":
      return TASK_HEADERS;
  }
};

export const proposeHeaderMapping = (
  headers: string[],
  entity: EntityKind
): HeaderMapping => {
  const canon = new Set(canonicalFor(entity));
  const map: HeaderMapping = {};
  headers.forEach((h) => {
    const key = h.trim().toLowerCase().replace(/\s+|-/g, "");
    const syn = SYNONYMS[key];
    if (syn && canon.has(syn)) {
      map[h] = syn;
    } else if (canon.has(key)) {
      map[h] = key;
    } else {
      // leave unmapped; UI will ask user
      map[h] = "";
    }
  });
  return map;
};

const readCSV = (file: File): Promise<any[]> =>
  new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => resolve(res.data as any[]),
      error: reject,
    });
  });

const readXLSX = async (file: File): Promise<any[]> => {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet, { defval: "" }) as any[];
};

export const loadRows = async (file: File): Promise<any[]> => {
  const ext = file.name.toLowerCase().split(".").pop();
  if (ext === "csv") return readCSV(file);
  if (ext === "xlsx" || ext === "xls") return readXLSX(file);
  throw new Error("Unsupported file type");
};

export const numberParser = (params: any) => {
  const v = Number(params.newValue);
  return Number.isFinite(v) ? v : params.oldValue;
};
export const listParser = (params: any) => {
  const arr = String(params.newValue ?? "")
    .split(/[,\|;]/)
    .map((s) => s.trim())
    .filter(Boolean);
  return arr;
};
export const numberListParser = (params: any) => {
  const arr = String(params.newValue ?? "")
    .replace(/[\[\]]/g, "")
    .split(/[,\|;]/)
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n));
  return arr;
};
export const numberListOrRangeParser = (params: any) => {
  const s = String(params.newValue ?? "").trim();
  const m = s.match(/^(\d+)\s*-\s*(\d+)$/);
  if (m) {
    const a = Number(m[1]);
    const b = Number(m[2]);
    if (Number.isFinite(a) && Number.isFinite(b) && a <= b) {
      return Array.from({ length: b - a + 1 }, (_, i) => a + i);
    }
  }
  return numberListParser(params);
};
