"use client";
import { useMemo } from "react";
import { useDataStore } from "@/store/useDataStore";

export default function ValidationSummary() {
  const issues = useDataStore((s) => s.issues);
  const clients = useDataStore((s) => s.clients);
  const setClients = useDataStore((s) => s.setClients);

  const tryFix = (idx: number) => {
    const issue = issues[idx];
    if (issue?.code === "XREF_CLIENT_TASK_MISSING" && issue.id) {
      const match = issue.message.match(/"(.+?)"/);
      const bad = match?.[1];
      if (!bad) return;
      const updated = clients.map((c) =>
        c.ClientID === issue.id
          ? {
              ...c,
              RequestedTaskIDs: c.RequestedTaskIDs.filter((t) => t !== bad),
            }
          : c
      );
      setClients(
        updated,
        issues.filter((_, i) => i !== idx)
      );
    }
  };

  const groups = useMemo(() => {
    const m = new Map<string, { count: number; items: typeof issues }>();
    issues.forEach((i) => {
      const key = `${i.entity}:${i.severity}`;
      if (!m.has(key)) m.set(key, { count: 0, items: [] });
      const g = m.get(key)!;
      g.count++;
      g.items.push(i);
    });
    return Array.from(m.entries());
  }, [issues]);

  if (!issues.length)
    return (
      <div className="text-sm text-green-700">
        No issues detected (Tier 0/1)
      </div>
    );

  return (
    <div className="border rounded p-3">
      <div className="font-semibold mb-2">Validation Summary</div>
      <ul className="list-disc pl-5 space-y-1">
        {groups.map(([k, g]) => (
          <li key={k} className="text-sm">
            {k} — {g.count}
          </li>
        ))}
      </ul>
      <div className="space-y-1">
        {issues.slice(0, 200).map((i, idx) => (
          <div
            key={idx}
            className="text-xs text-gray-700 flex items-center justify-between gap-2"
          >
            <span>
              [{i.entity}] {i.id ? `${i.id}.` : ""}
              {i.field ? `${i.field}: ` : ""}
              {i.message}
            </span>
            {i.code === "XREF_CLIENT_TASK_MISSING" && (
              <button className="text-blue-600" onClick={() => tryFix(idx)}>
                Fix
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="mt-2 max-h-40 overflow-auto">
        {issues.slice(0, 200).map((i, idx) => (
          <div key={idx} className="text-xs text-gray-700">
            [{i.entity}] {i.id ? `${i.id}.` : ""}
            {i.field ? `${i.field}: ` : ""}
            {i.message}
          </div>
        ))}
      </div>
    </div>
  );
}
