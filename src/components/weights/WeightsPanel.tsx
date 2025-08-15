"use client";
import { useMemo } from "react";
import { useRulesStore } from "@/store/rulesStore";

const PRESETS = {
  MaxFulfillment: {
    clientPriority: 0.4,
    requestedFulfillment: 0.4,
    fairness: 0.1,
    skillMatch: 0.05,
    phasePreference: 0.05,
  },
  FairDistribution: {
    clientPriority: 0.2,
    requestedFulfillment: 0.2,
    fairness: 0.4,
    skillMatch: 0.1,
    phasePreference: 0.1,
  },
  MinWorkload: {
    clientPriority: 0.15,
    requestedFulfillment: 0.25,
    fairness: 0.1,
    skillMatch: 0.2,
    phasePreference: 0.3,
  },
} as const;

export default function WeightsPanel() {
  const { weights, setWeights } = useRulesStore();

  const criteria = useMemo(() => {
    const map: Record<string, number> = {};
    weights.criteria.forEach((c) => (map[c.key] = c.weight));
    return map;
  }, [weights]);

  const total = useMemo(
    () => Object.values(criteria).reduce((a, b) => a + (b ?? 0), 0),
    [criteria]
  );

  const onPreset = (k: keyof typeof PRESETS) => {
    const preset = PRESETS[k];
    setWeights({
      preset: k,
      criteria: Object.entries(preset).map(([key, weight]) => ({
        key,
        weight,
      })),
    });
  };

  const onChange = (key: string, v: number) => {
    const next = weights.criteria.map((c) =>
      c.key === key ? { ...c, weight: v } : c
    );
    setWeights({ preset: undefined, criteria: next });
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-lg font-semibold tracking-tight text-slate-100">
            Prioritization & Weights
          </div>
          <div className="mt-1 text-xs text-slate-300">
            Distribute importance across criteria. Total:{" "}
            <span
              className={`${
                Math.abs(total - 1) < 1e-6
                  ? "text-emerald-300"
                  : "text-amber-300"
              }`}
            >
              {total.toFixed(2)}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(Object.keys(PRESETS) as (keyof typeof PRESETS)[]).map((k) => (
            <button
              key={k}
              onClick={() => onPreset(k)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                weights.preset === k
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow"
                  : "bg-white/10 text-white hover:bg-white/15"
              }`}
              title={`Apply ${k} preset`}
            >
              {k.replace(/([A-Z])/g, " $1").trim()}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {[
          "clientPriority",
          "requestedFulfillment",
          "fairness",
          "skillMatch",
          "phasePreference",
        ].map((k) => (
          <div
            key={k}
            className="rounded-xl border border-white/10 bg-white/5 p-3"
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm font-medium text-slate-100">
                {label(k)}
              </div>
              <div className="text-[10px] text-slate-400">({k})</div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={criteria[k] ?? 0}
                onChange={(e) => onChange(k, Number(e.target.value))}
                className="flex-1 accent-emerald-400"
              />
              <div className="shrink-0 rounded-full bg-white/10 px-2 py-1 text-xs text-white">
                {(((criteria[k] ?? 0) as number) * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function label(k: string) {
  switch (k) {
    case "clientPriority":
      return "Client Priority";
    case "requestedFulfillment":
      return "Requested Tasks Fulfillment";
    case "fairness":
      return "Fairness (load variance)";
    case "skillMatch":
      return "Skill Match Strictness";
    case "phasePreference":
      return "Phase Preference Respect";
    default:
      return k;
  }
}
