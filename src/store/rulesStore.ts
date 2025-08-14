import { create } from "zustand";
import { Rule, Weights } from "@/types/rule";

type RulesState = {
  rules: Rule[];
  weights: Weights;
  addRule: (r: Rule) => void;
  updateRule: (id: string, patch: Partial<Rule>) => void;
  removeRule: (id: string) => void;
  setWeights: (w: Weights) => void;
  setRules: (rules: Rule[]) => void;
};

const defaultWeights: Weights = {
  preset: "MaxFulfillment",
  criteria: [
    { key: "clientPriority", weight: 0.4 },
    { key: "requestedFulfillment", weight: 0.3 },
    { key: "fairness", weight: 0.15 },
    { key: "skillMatch", weight: 0.1 },
    { key: "phasePreference", weight: 0.05 },
  ],
};

export const useRulesStore = create<RulesState>((set) => ({
  rules: [],
  weights: defaultWeights,
  addRule: (r) => set((s) => ({ rules: [...s.rules, r] })),
  updateRule: (id, patch) =>
    set((s) => ({
      rules: s.rules.map((r) => (r.id === id ? { ...r, ...patch } as Rule : r)),
    })),
  removeRule: (id) =>
    set((s) => ({ rules: s.rules.filter((r) => r.id !== id) })),
  setWeights: (w) =>
    set({ weights: { ...w, criteria: normalizeWeights(w.criteria) } }),
  setRules: (rules) => set({ rules }),
}));

function normalizeWeights(criteria: { key: string; weight: number }[]) {
  const sum = criteria.reduce((a, c) => a + (c.weight || 0), 0) || 1;
  return criteria.map((c) => ({ ...c, weight: +(c.weight / sum).toFixed(4) }));
}
