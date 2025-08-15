"use client";

import { useCrossValidation } from "@/hooks/useCrossValidation";

// Import as namespaces, then pick default or named exports
import * as UploadPanelMod from "@/components/UploadPanel";
import * as ClientsGridMod from "@/components/ClientsGrid";
import * as WorkersGridMod from "@/components/WorkersGrid";
import * as TasksGridMod from "@/components/TasksGrid";
import * as ValidationSummaryMod from "@/components/ValidationSummary";
import * as RuleBuilderMod from "@/components/rules/RuleBuilder";
import * as WeightsPanelMod from "@/components/weights/WeightsPanel";
import * as ExportPanelMod from "@/components/export/ExportPanel";

// Resolve to components regardless of how they were exported
const UploadPanel =
  (UploadPanelMod as any).default ?? (UploadPanelMod as any).UploadPanel;
const ClientsGrid =
  (ClientsGridMod as any).default ?? (ClientsGridMod as any).ClientsGrid;
const WorkersGrid =
  (WorkersGridMod as any).default ?? (WorkersGridMod as any).WorkersGrid;
const TasksGrid =
  (TasksGridMod as any).default ?? (TasksGridMod as any).TasksGrid;
const ValidationSummary =
  (ValidationSummaryMod as any).default ??
  (ValidationSummaryMod as any).ValidationSummary;
const RuleBuilder =
  (RuleBuilderMod as any).default ?? (RuleBuilderMod as any).RuleBuilder;
const WeightsPanel =
  (WeightsPanelMod as any).default ?? (WeightsPanelMod as any).WeightsPanel;
const ExportPanel =
  (ExportPanelMod as any).default ?? (ExportPanelMod as any).ExportPanel;

export default function HomePage() {
  useCrossValidation();

  return (
    <main className="space-y-6">
      <header className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 via-sky-400 to-fuchsia-400 bg-clip-text text-transparent">
          Data Alchemist
        </h1>
        <p className="text-slate-300 mt-1">
          Import, validate, search, add rules, and export clean datasets.
        </p>
      </header>

      <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5">
        <UploadPanel />
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5">
        <ValidationSummary />
      </section>

      <ExportPanel />

      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight text-slate-100">
            Clients
          </h2>
          <ClientsGrid />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight text-slate-100">
            Workers
          </h2>
          <WorkersGrid />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight text-slate-100">
            Tasks
          </h2>
          <TasksGrid />
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5">
        <RuleBuilder />
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5">
        <WeightsPanel />
      </section>
    </main>
  );
}
