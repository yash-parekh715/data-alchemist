"use client";
import { useMemo, useState } from "react";
import { useDataStore } from "@/store/useDataStore";
import { useRulesStore } from "@/store/rulesStore";
import { exportAll } from "@/lib/export";

export default function ExportPanel() {
  const { clients, workers, tasks, issues } = useDataStore();
  const { rules, weights } = useRulesStore();
  const [busy, setBusy] = useState(false);

  const counts = useMemo(
    () => ({
      errors: issues.filter((i) => i.severity === "error").length,
      warnings: issues.filter((i) => i.severity === "warning").length,
    }),
    [issues]
  );
  const blocked =
    counts.errors > 0 || clients.length + workers.length + tasks.length === 0;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${
            counts.errors
              ? "bg-red-500/20 text-red-200"
              : "bg-emerald-500/20 text-emerald-200"
          }`}
        >
          Errors: {counts.errors}
        </span>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${
            counts.warnings
              ? "bg-amber-500/20 text-amber-100"
              : "bg-white/10 text-slate-200"
          }`}
        >
          Warnings: {counts.warnings}
        </span>
      </div>
      <button
        className="inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
        disabled={blocked || busy}
        title={
          blocked ? "Resolve errors before export" : "Export CSVs + rules.json"
        }
        onClick={async () => {
          setBusy(true);
          try {
            await exportAll({
              clients,
              workers,
              tasks,
              rules,
              weights,
              validationReport: counts,
            });
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Exporting…" : "Export"}
      </button>
    </div>
  );
}
