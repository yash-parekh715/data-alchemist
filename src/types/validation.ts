export type EntityKind = "clients" | "workers" | "tasks";
export type Severity = "error" | "warning";

export interface ValidationIssue {
  id?: string; // row ID if applicable
  entity: EntityKind;
  field?: string;
  severity: Severity;
  message: string;
  code?: string;
}
