import { z } from "zod";
import { Client } from "@/types/client";
import { Worker } from "@/types/worker";
import { Task } from "@/types/task";
import { ValidationIssue } from "@/types/validation";
import {
  parsePhaseListOrRange,
  safeParseJSON,
  toNumberArray,
  toStringArray,
} from "@/lib/normalize";

const clientSchema = z.object({
  ClientID: z.string().min(1),
  ClientName: z.string().min(1),
  PriorityLevel: z.coerce.number().int().min(1).max(5),
  RequestedTaskIDs: z.array(z.string()),
  GroupTag: z.string().optional(),
  AttributesJSON: z.record(z.string(), z.any()).optional(),
});

const workerSchema = z.object({
  WorkerID: z.string().min(1),
  WorkerName: z.string().min(1),
  Skills: z.array(z.string()),
  AvailableSlots: z.array(z.number().int()),
  MaxLoadPerPhase: z.coerce.number().int().min(0),
  WorkerGroup: z.string().optional(),
  QualificationLevel: z.union([z.string(), z.number()]).optional(),
});

const taskSchema = z.object({
  TaskID: z.string().min(1),
  TaskName: z.string().min(1),
  Category: z.string().optional(),
  Duration: z.coerce.number().int().min(1),
  RequiredSkills: z.array(z.string()),
  PreferredPhases: z.array(z.number().int()),
  MaxConcurrent: z.coerce.number().int().min(0),
});

export const normalizeClient = (r: any): Client => ({
  ClientID: String(r.ClientID ?? r.clientid ?? "").trim(),
  ClientName: String(r.ClientName ?? r.clientname ?? "").trim(),
  PriorityLevel: Number(r.PriorityLevel ?? r.prioritylevel ?? 1),
  RequestedTaskIDs: toStringArray(r.RequestedTaskIDs ?? r.requestedtaskids),
  GroupTag: r.GroupTag ?? (r.grouptag || undefined),
  AttributesJSON: safeParseJSON(r.AttributesJSON ?? r.attributesjson),
});

export const normalizeWorker = (r: any): Worker => ({
  WorkerID: String(r.WorkerID ?? r.workerid ?? "").trim(),
  WorkerName: String(r.WorkerName ?? r.workername ?? "").trim(),
  Skills: toStringArray(r.Skills ?? r.skills),
  AvailableSlots: toNumberArray(r.AvailableSlots ?? r.availableslots),
  MaxLoadPerPhase: Number(r.MaxLoadPerPhase ?? r.maxloadperphase ?? 0),
  WorkerGroup: r.WorkerGroup ?? (r.workergroup || undefined),
  QualificationLevel: r.QualificationLevel ?? r.qualificationlevel,
});

export const normalizeTask = (r: any): Task => ({
  TaskID: String(r.TaskID ?? r.taskid ?? "").trim(),
  TaskName: String(r.TaskName ?? r.taskname ?? "").trim(),
  Category: r.Category ?? (r.category || undefined),
  Duration: Number(r.Duration ?? r.duration ?? 1),
  RequiredSkills: toStringArray(r.RequiredSkills ?? r.requiredskills),
  PreferredPhases: parsePhaseListOrRange(
    r.PreferredPhases ?? r.preferredphases
  ),
  MaxConcurrent: Number(r.MaxConcurrent ?? r.maxconcurrent ?? 0),
});

export const validateClientsT0T1 = (rows: Client[]): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  const ids = new Set<string>();
  for (const r of rows) {
    const parsed = clientSchema.safeParse(r);
    if (!parsed.success) {
      parsed.error.issues.forEach((e) =>
        issues.push({
          entity: "clients",
          id: r.ClientID,
          field: String(e.path[0]),
          severity: "error",
          message: e.message,
        })
      );
    }
    if (ids.has(r.ClientID)) {
      issues.push({
        entity: "clients",
        id: r.ClientID,
        field: "ClientID",
        severity: "error",
        message: "Duplicate ClientID",
      });
    }
    ids.add(r.ClientID);
    if (
      (r as any).AttributesJSON === undefined &&
      typeof (r as any).attributesjson === "string" &&
      (r as any).attributesjson.trim()
    ) {
      issues.push({
        entity: "clients",
        id: r.ClientID,
        field: "AttributesJSON",
        severity: "error",
        message: "AttributesJSON is not valid JSON",
      });
    }
  }
  return issues;
};

export const validateWorkersT0T1 = (rows: Worker[]): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  const ids = new Set<string>();
  for (const r of rows) {
    const parsed = workerSchema.safeParse(r);
    if (!parsed.success) {
      parsed.error.issues.forEach((e) =>
        issues.push({
          entity: "workers",
          id: r.WorkerID,
          field: String(e.path[0]),
          severity: "error",
          message: e.message,
        })
      );
    }
    if (ids.has(r.WorkerID)) {
      issues.push({
        entity: "workers",
        id: r.WorkerID,
        field: "WorkerID",
        severity: "error",
        message: "Duplicate WorkerID",
      });
    }
    ids.add(r.WorkerID);
    if (r.AvailableSlots.some((n) => !Number.isInteger(n))) {
      issues.push({
        entity: "workers",
        id: r.WorkerID,
        field: "AvailableSlots",
        severity: "error",
        message: "Malformed AvailableSlots",
      });
    }
    if (r.AvailableSlots.length < r.MaxLoadPerPhase && r.MaxLoadPerPhase > 0) {
      // warning only; stronger feasibility checks in Day 2
      issues.push({
        entity: "workers",
        id: r.WorkerID,
        field: "MaxLoadPerPhase",
        severity: "warning",
        message: "MaxLoadPerPhase exceeds available slots count",
      });
    }
  }
  return issues;
};

export const validateTasksT0T1 = (rows: Task[]): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  const ids = new Set<string>();
  for (const r of rows) {
    const parsed = taskSchema.safeParse(r);
    if (!parsed.success) {
      parsed.error.issues.forEach((e) =>
        issues.push({
          entity: "tasks",
          id: r.TaskID,
          field: String(e.path[0]),
          severity: "error",
          message: e.message,
        })
      );
    }
    if (ids.has(r.TaskID)) {
      issues.push({
        entity: "tasks",
        id: r.TaskID,
        field: "TaskID",
        severity: "error",
        message: "Duplicate TaskID",
      });
    }
    ids.add(r.TaskID);
  }
  return issues;
};
