"use client";
import React, { useMemo, useState } from "react";
import {
  loadRows,
  proposeHeaderMapping,
  HeaderMapping,
} from "@/lib/parser/parseFile";
import {
  normalizeClient,
  normalizeTask,
  normalizeWorker,
  validateClientsT0T1,
  validateTasksT0T1,
  validateWorkersT0T1,
} from "@/lib/validators/entityValidators";
import { useDataStore } from "@/store/useDataStore";
import { EntityKind } from "@/types/validation";

const CanonByEntity: Record<EntityKind, string[]> = {
  clients: [
    "ClientID",
    "ClientName",
    "PriorityLevel",
    "RequestedTaskIDs",
    "GroupTag",
    "AttributesJSON",
  ],
  workers: [
    "WorkerID",
    "WorkerName",
    "Skills",
    "AvailableSlots",
    "MaxLoadPerPhase",
    "WorkerGroup",
    "QualificationLevel",
  ],
  tasks: [
    "TaskID",
    "TaskName",
    "Category",
    "Duration",
    "RequiredSkills",
    "PreferredPhases",
    "MaxConcurrent",
  ],
};

export default function UploadPanel() {
  const [entity, setEntity] = useState<EntityKind>("clients");
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<HeaderMapping>({});
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [fullRows, setFullRows] = useState<any[]>([]); // add
  const [needsMapping, setNeedsMapping] = useState(false);

  const canon = useMemo(() => CanonByEntity[entity], [entity]);

  const { setClients, setWorkers, setTasks } = useDataStore();

  const onFile = async (file: File) => {
    const rows = await loadRows(file);
    const headers = Object.keys(rows[0] || {});
    setRawHeaders(headers);
    const proposed = proposeHeaderMapping(headers, entity);
    setMapping(proposed);
    setPreviewRows(rows.slice(0, 5));
    setFullRows(rows);
    const unmapped = Object.values(proposed).filter((v) => !v).length > 0;
    setNeedsMapping(unmapped);
    if (!unmapped) {
      // auto-apply
      apply(rows, proposed);
    }
  };

  const apply = (rows: any[], map: HeaderMapping) => {
    const mapped = rows.map((r) => {
      const obj: any = {};
      Object.entries(r).forEach(([k, v]) => {
        const dest = map[k];
        if (dest) obj[dest] = v;
      });
      return obj;
    });

    if (entity === "clients") {
      const norm = mapped.map(normalizeClient);
      const issues = validateClientsT0T1(norm);
      setClients(norm, issues);
    } else if (entity === "workers") {
      const norm = mapped.map(normalizeWorker);
      const issues = validateWorkersT0T1(norm);
      setWorkers(norm, issues);
    } else {
      const norm = mapped.map(normalizeTask);
      const issues = validateTasksT0T1(norm);
      setTasks(norm, issues);
    }
    setNeedsMapping(false);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onFile(f);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium">Import for:</label>
        <select
          className="border rounded px-2 py-1"
          value={entity}
          onChange={(e) => setEntity(e.target.value as EntityKind)}
        >
          <option value="clients">Clients</option>
          <option value="workers">Workers</option>
          <option value="tasks">Tasks</option>
        </select>
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={onInputChange}
          className="border rounded px-2 py-1"
        />
      </div>

      {needsMapping && (
        <div className="border rounded p-3">
          <div className="font-semibold mb-2">
            Map columns to expected headers
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {rawHeaders.map((h) => (
              <div key={h} className="flex items-center gap-2">
                <span className="text-xs text-gray-600 w-40 truncate">{h}</span>
                <select
                  className="border rounded px-2 py-1 flex-1"
                  value={mapping[h] ?? ""}
                  onChange={(e) =>
                    setMapping((m) => ({ ...m, [h]: e.target.value }))
                  }
                >
                  <option value="">— ignore —</option>
                  {canon.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <button
              className="bg-blue-600 text-white px-3 py-1 rounded"
              onClick={() => apply(fullRows, mapping)}
            >
              Apply Mapping
            </button>
          </div>
          <div className="mt-3 text-xs text-gray-600">
            Preview first 5 rows loaded.
          </div>
        </div>
      )}
    </div>
  );
}
