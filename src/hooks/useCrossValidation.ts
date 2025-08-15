"use client";
import { useEffect, useRef } from "react";
import { useDataStore } from "@/store/useDataStore";
import { useRulesStore } from "@/store/rulesStore";

export function useCrossValidation() {
  const clients = useDataStore((s) => s.clients);
  const workers = useDataStore((s) => s.workers);
  const tasks = useDataStore((s) => s.tasks);
  const setIssues = useDataStore((s) => s.setIssues);
  const rules = useRulesStore((s) => s.rules);

  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const w = new Worker(
      new URL("@/workers/crossValidation.worker.ts", import.meta.url),
      { type: "module" }
    );
    workerRef.current = w;
    return () => {
      w.terminate();
      workerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const w = workerRef.current;
    if (!w) return;
    let cancelled = false;
    w.onmessage = (e: MessageEvent<{ issues: any[] }>) => {
      if (!cancelled) setIssues(e.data.issues);
    };
    w.postMessage({ clients, workers, tasks, rules });
    return () => {
      cancelled = true;
    };
  }, [clients, workers, tasks, rules, setIssues]);
}
