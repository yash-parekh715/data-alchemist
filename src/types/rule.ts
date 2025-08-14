export type RuleType =
  | "coRun"
  | "slotRestriction"
  | "loadLimit"
  | "phaseWindow"
  | "patternMatch"
  | "precedenceOverride";

export type CoRunRule = {
  id: string;
  type: "coRun";
  tasks: string[]; // TaskIDs
  priority?: number;
  enabled?: boolean;
};

export type SlotRestrictionRule = {
  id: string;
  type: "slotRestriction";
  groupKind: "ClientGroup" | "WorkerGroup";
  groupTag: string;
  minCommonSlots: number;
  enabled?: boolean;
};

export type LoadLimitRule = {
  id: string;
  type: "loadLimit";
  workerGroup: string;
  maxSlotsPerPhase: number;
  enabled?: boolean;
};

export type PhaseWindowRule = {
  id: string;
  type: "phaseWindow";
  taskId: string;
  phases: number[];
  enabled?: boolean;
};

export type PatternMatchRule = {
  id: string;
  type: "patternMatch";
  regex: string;
  template: "includeTasks" | "excludeTasks"; // example templates
  params?: Record<string, string>;
  enabled?: boolean;
};

export type PrecedenceOverrideRule = {
  id: string;
  type: "precedenceOverride";
  scope: "global" | "specific";
  specificTaskIds?: string[];
  priority: number; // higher = stronger override
  enabled?: boolean;
};

export type Rule =
  | CoRunRule
  | SlotRestrictionRule
  | LoadLimitRule
  | PhaseWindowRule
  | PatternMatchRule
  | PrecedenceOverrideRule;

export type Weights = {
  preset?: "MaxFulfillment" | "FairDistribution" | "MinWorkload";
  criteria: { key: string; weight: number }[]; // 0..1
};
