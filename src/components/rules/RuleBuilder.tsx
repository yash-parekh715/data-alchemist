// "use client";
// import { useMemo, useState } from "react";
// import { useRulesStore } from "@/store/rulesStore";
// import { useDataStore } from "@/store/useDataStore";
// import { Rule } from "@/types/rule";

// export default function RuleBuilder() {
//   const { rules, addRule, removeRule } = useRulesStore();
//   const tasks = useDataStore((s) => s.tasks);
//   const [type, setType] = useState<Rule["type"]>("coRun");
//   const [form, setForm] = useState<any>({});

//   const preview: Rule | null = useMemo(() => {
//     const id = crypto.randomUUID();
//     try {
//       switch (type) {
//         case "coRun":
//           return { id, type, tasks: (form.tasks || "").split(/[,\s]+/).filter(Boolean) };
//         case "loadLimit":
//           return { id, type, workerGroup: form.workerGroup || "", maxSlotsPerPhase: Number(form.maxSlotsPerPhase || 0) };
//         case "phaseWindow":
//           return { id, type, taskId: form.taskId || "", phases: parseNums(form.phases) };
//         default:
//           return null;
//       }
//     } catch {
//       return null;
//     }
//   }, [type, form]);

//   const status = useMemo(() => validateRule(preview, tasks), [preview, tasks]);

//   return (
//     <div className="border rounded p-3 space-y-3">
//       <div className="font-semibold">Rule Builder</div>
//       <div className="flex flex-col md:flex-row gap-3">
//         <select className="border rounded px-2 py-1" value={type} onChange={(e) => setType(e.target.value as any)}>
//           <option value="coRun">Co‑run</option>
//           <option value="loadLimit">Load‑limit</option>
//           <option value="phaseWindow">Phase‑window</option>
//         </select>
//         {type === "coRun" && (
//           <input className="border rounded px-2 py-1 flex-1" placeholder="TaskIDs (e.g., T1 T2 T3)" onChange={(e) => setForm({ ...form, tasks: e.target.value })} />
//         )}
//         {type === "loadLimit" && (
//           <>
//             <input className="border rounded px-2 py-1" placeholder="WorkerGroup" onChange={(e) => setForm({ ...form, workerGroup: e.target.value })} />
//             <input className="border rounded px-2 py-1" placeholder="maxSlotsPerPhase" onChange={(e) => setForm({ ...form, maxSlotsPerPhase: e.target.value })} />
//           </>
//         )}
//         {type === "phaseWindow" && (
//           <>
//             <input className="border rounded px-2 py-1" placeholder="TaskID" onChange={(e) => setForm({ ...form, taskId: e.target.value })} />
//             <input className="border rounded px-2 py-1" placeholder="Phases (e.g., 1,2,3 or 2-4)" onChange={(e) => setForm({ ...form, phases: e.target.value })} />
//           </>
//         )}
//         <button
//           className="bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50"
//           disabled={!preview || status.severity === "error"}
//           onClick={() => preview && addRule(preview)}
//         >
//           Add Rule
//         </button>
//       </div>

//       <div className="text-sm">
//         Preview: <code className="bg-gray-100 px-2 py-1 rounded">{JSON.stringify(preview)}</code>
//         <span className={`ml-2 ${status.severity === "error" ? "text-red-600" : status.severity === "warning" ? "text-amber-600" : "text-green-600"}`}>
//           {status.message}
//         </span>
//       </div>

//       <div className="mt-3">
//         <div className="font-medium mb-1">Current Rules</div>
//         {rules.length === 0 && <div className="text-sm text-gray-600">No rules yet.</div>}
//         <ul className="space-y-1">
//           {rules.map((r) => (
//             <li key={r.id} className="text-sm flex items-center justify-between border rounded px-2 py-1">
//               <code className="bg-gray-100 px-2 py-0.5 rounded">{r.type}</code>
//               <span className="truncate flex-1 mx-2">{summarize(r)}</span>
//               <button className="text-red-600 text-xs" onClick={() => removeRule(r.id)}>Remove</button>
//             </li>
//           ))}
//         </ul>
//       </div>
//     </div>
//   );
// }

// function summarize(r: Rule) {
//   switch (r.type) {
//     case "coRun": return `tasks: ${(r as any).tasks.join(", ")}`;
//     case "loadLimit": return `group ${(r as any).workerGroup}, max ${(r as any).maxSlotsPerPhase}/phase`;
//     case "phaseWindow": return `task ${(r as any).taskId} → phases ${(r as any).phases.join(",")}`;
//     default: return "";
//   }
// }

// function parseNums(s: string): number[] {
//   if (!s) return [];
//   const m = s.match(/^(\d+)\s*-\s*(\d+)$/);
//   if (m) {
//     const a = +m[1], b = +m[2];
//     if (a <= b) return Array.from({ length: b - a + 1 }, (_, i) => a + i);
//   }
//   return s.replace(/[\[\]]/g, "").split(/[,\s]+/).map((x) => +x).filter((n) => Number.isFinite(n));
// }

// function validateRule(r: Rule | null, tasks: { TaskID: string; Duration: number; PreferredPhases: number[] }[]) {
//   if (!r) return { severity: "warning", message: "Incomplete" };
//   if (r.type === "coRun") {
//     const ids = new Set((r as any).tasks);
//     if (ids.size < (r as any).tasks.length) return { severity: "error", message: "Duplicate TaskID in coRun" };
//     const missing = (r as any).tasks.filter((id: string) => !tasks.find((t) => t.TaskID === id));
//     if (missing.length) return { severity: "error", message: `Missing tasks: ${missing.join(", ")}` };
//     const group = (r as any).tasks.map((id: string) => tasks.find((t) => t.TaskID === id)!);
//     const intersection = group
//       .map((t) => new Set(t.PreferredPhases))
//       .reduce<Set<number>>((acc, s, idx) => (idx === 0 ? s : new Set([...acc].filter((x) => s.has(x)))), new Set());
//     const maxDur = Math.max(...group.map((t) => t.Duration));
//     if (intersection.size < maxDur) return { severity: "error", message: "Insufficient common phases for coRun" };
//     return { severity: "success", message: "Valid" };
//   }
//   if (r.type === "phaseWindow") {
//     const t = tasks.find((t) => t.TaskID === (r as any).taskId);
//     if (!t) return { severity: "error", message: "Task not found" };
//     if (!(r as any).phases.length) return { severity: "error", message: "Phases required" };
//     return { severity: "success", message: "Valid" };
//   }
//   if (r.type === "loadLimit") {
//     const v = (r as any).maxSlotsPerPhase;
//     if (!Number.isFinite(v) || v < 0) return { severity: "error", message: "Invalid maxSlotsPerPhase" };
//     return { severity: "success", message: "Valid" };
//   }
//   return { severity: "warning", message: "Unsupported in Day 2 MVP" };
// }

//latest code
// "use client";
// import { useMemo, useState } from "react";
// import { useRulesStore } from "@/store/rulesStore";
// import { useDataStore } from "@/store/useDataStore";
// import { Rule } from "@/types/rule";

// export default function RuleBuilder() {
//   const { rules, addRule, removeRule } = useRulesStore();
//   const tasks = useDataStore((s) => s.tasks);
//   const [type, setType] = useState<Rule["type"]>("coRun");
//   const [form, setForm] = useState<any>({});

//   const preview: Rule | null = useMemo(() => {
//     const id = crypto.randomUUID();
//     try {
//       switch (type) {
//         case "coRun":
//           return {
//             id,
//             type,
//             tasks: (form.tasks || "").split(/[,\s]+/).filter(Boolean),
//           };
//         case "loadLimit":
//           return {
//             id,
//             type,
//             workerGroup: form.workerGroup || "",
//             maxSlotsPerPhase: Number(form.maxSlotsPerPhase || 0),
//           };
//         case "phaseWindow":
//           return {
//             id,
//             type,
//             taskId: form.taskId || "",
//             phases: parseNums(form.phases),
//           };
//         default:
//           return null;
//       }
//     } catch {
//       return null;
//     }
//   }, [type, form]);

//   const status = useMemo(() => validateRule(preview, tasks), [preview, tasks]);

//   return (
//     <div className="border rounded p-3 space-y-3">
//       <div className="font-semibold">Rule Builder</div>
//       <div className="flex flex-col md:flex-row gap-3">
//         <select
//           className="border rounded px-2 py-1"
//           value={type}
//           onChange={(e) => setType(e.target.value as any)}
//         >
//           <option value="coRun">Co‑run</option>
//           <option value="loadLimit">Load‑limit</option>
//           <option value="phaseWindow">Phase‑window</option>
//         </select>
//         {type === "coRun" && (
//           <input
//             className="border rounded px-2 py-1 flex-1"
//             placeholder="TaskIDs (e.g., T1 T2 T3)"
//             onChange={(e) => setForm({ ...form, tasks: e.target.value })}
//           />
//         )}
//         {type === "loadLimit" && (
//           <>
//             <input
//               className="border rounded px-2 py-1"
//               placeholder="WorkerGroup"
//               onChange={(e) =>
//                 setForm({ ...form, workerGroup: e.target.value })
//               }
//             />
//             <input
//               className="border rounded px-2 py-1"
//               placeholder="maxSlotsPerPhase"
//               onChange={(e) =>
//                 setForm({ ...form, maxSlotsPerPhase: e.target.value })
//               }
//             />
//           </>
//         )}
//         {type === "phaseWindow" && (
//           <>
//             <input
//               className="border rounded px-2 py-1"
//               placeholder="TaskID"
//               onChange={(e) => setForm({ ...form, taskId: e.target.value })}
//             />
//             <input
//               className="border rounded px-2 py-1"
//               placeholder="Phases (e.g., 1,2,3 or 2-4)"
//               onChange={(e) => setForm({ ...form, phases: e.target.value })}
//             />
//           </>
//         )}
//         <button
//           className="bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50"
//           disabled={!preview || status.severity === "error"}
//           onClick={() => preview && addRule(preview)}
//         >
//           Add Rule
//         </button>
//       </div>

//       <div className="text-sm">
//         Preview:{" "}
//         <code className="bg-gray-100 px-2 py-1 rounded">
//           {JSON.stringify(preview)}
//         </code>
//         <span
//           className={`ml-2 ${
//             status.severity === "error"
//               ? "text-red-600"
//               : status.severity === "warning"
//               ? "text-amber-600"
//               : "text-green-600"
//           }`}
//         >
//           {status.message}
//         </span>
//       </div>

//       <div className="mt-3">
//         <div className="font-medium mb-1">Current Rules</div>
//         {rules.length === 0 && (
//           <div className="text-sm text-gray-600">No rules yet.</div>
//         )}
//         <ul className="space-y-1">
//           {rules.map((r) => (
//             <li
//               key={r.id}
//               className="text-sm flex items-center justify-between border rounded px-2 py-1"
//             >
//               <code className="bg-gray-100 px-2 py-0.5 rounded">{r.type}</code>
//               <span className="truncate flex-1 mx-2">{summarize(r)}</span>
//               <button
//                 className="text-red-600 text-xs"
//                 onClick={() => removeRule(r.id)}
//               >
//                 Remove
//               </button>
//             </li>
//           ))}
//         </ul>
//       </div>
//     </div>
//   );
// }

// function summarize(r: Rule) {
//   switch (r.type) {
//     case "coRun":
//       return `tasks: ${(r as any).tasks.join(", ")}`;
//     case "loadLimit":
//       return `group ${(r as any).workerGroup}, max ${
//         (r as any).maxSlotsPerPhase
//       }/phase`;
//     case "phaseWindow":
//       return `task ${(r as any).taskId} → phases ${(r as any).phases.join(
//         ","
//       )}`;
//     default:
//       return "";
//   }
// }

// function parseNums(s: string): number[] {
//   if (!s) return [];
//   const m = s.match(/^(\d+)\s*-\s*(\d+)$/);
//   if (m) {
//     const a = +m[1],
//       b = +m[2];
//     if (a <= b) return Array.from({ length: b - a + 1 }, (_, i) => a + i);
//   }
//   return s
//     .replace(/[\[\]]/g, "")
//     .split(/[,\s]+/)
//     .map((x) => +x)
//     .filter((n) => Number.isFinite(n));
// }

// function validateRule(
//   r: Rule | null,
//   tasks: { TaskID: string; Duration: number; PreferredPhases: number[] }[]
// ) {
//   if (!r) return { severity: "warning", message: "Incomplete" };
//   if (r.type === "coRun") {
//     const ids = new Set((r as any).tasks);
//     if (ids.size < (r as any).tasks.length)
//       return { severity: "error", message: "Duplicate TaskID in coRun" };
//     const missing = (r as any).tasks.filter(
//       (id: string) => !tasks.find((t) => t.TaskID === id)
//     );
//     if (missing.length)
//       return {
//         severity: "error",
//         message: `Missing tasks: ${missing.join(", ")}`,
//       };
//     const group = (r as any).tasks.map(
//       (id: string) => tasks.find((t) => t.TaskID === id)!
//     );
//     interface TaskWithPhases {
//       PreferredPhases: number[];
//     }

//     const intersection: Set<number> = group
//       .map((t: TaskWithPhases) => new Set<number>(t.PreferredPhases))
//       .reduce(
//         (acc: Set<number>, s: Set<number>, idx: number): Set<number> =>
//           idx === 0
//             ? s
//             : new Set<number>([...acc].filter((x: number) => s.has(x))),
//         new Set<number>()
//       );
//     interface TaskWithDuration {
//       Duration: number;
//     }
//     const maxDur: number = Math.max(
//       ...group.map((t: TaskWithDuration) => t.Duration)
//     );
//     if (intersection.size < maxDur)
//       return {
//         severity: "error",
//         message: "Insufficient common phases for coRun",
//       };
//     return { severity: "success", message: "Valid" };
//   }
//   if (r.type === "phaseWindow") {
//     const t = tasks.find((t) => t.TaskID === (r as any).taskId);
//     if (!t) return { severity: "error", message: "Task not found" };
//     if (!(r as any).phases.length)
//       return { severity: "error", message: "Phases required" };
//     return { severity: "success", message: "Valid" };
//   }
//   if (r.type === "loadLimit") {
//     const v = (r as any).maxSlotsPerPhase;
//     if (!Number.isFinite(v) || v < 0)
//       return { severity: "error", message: "Invalid maxSlotsPerPhase" };
//     return { severity: "success", message: "Valid" };
//   }
//   return { severity: "warning", message: "Unsupported in Day 2 MVP" };
// }

"use client";
import { useMemo, useState } from "react";
import { useRulesStore } from "@/store/rulesStore";
import { useDataStore } from "@/store/useDataStore";
import { Rule } from "@/types/rule";

type DraftRule = Omit<Rule, "id">;

export default function RuleBuilder() {
  const { rules, addRule, removeRule } = useRulesStore();
  const tasks = useDataStore((s) => s.tasks);
  const [type, setType] = useState<Rule["type"]>("coRun");
  const [form, setForm] = useState<any>({});
  const [nl, setNl] = useState("");
  const [aiMsg, setAiMsg] = useState<string | null>(null);

  // Build a deterministic preview (no id)
  const preview: DraftRule | null = useMemo(() => {
    try {
      switch (type) {
        case "coRun":
          return {
            type,
            tasks: (form.tasks || "").split(/[,\s]+/).filter(Boolean),
          } as DraftRule;
        case "loadLimit":
          return {
            type,
            workerGroup: form.workerGroup || "",
            maxSlotsPerPhase: Number(form.maxSlotsPerPhase || 0),
          } as DraftRule;
        case "phaseWindow":
          return {
            type,
            taskId: form.taskId || "",
            phases: parseNums(form.phases),
          } as DraftRule;
        default:
          return null;
      }
    } catch {
      return null;
    }
  }, [type, form]);

  const status = useMemo(
    () => validateRule(preview as any, tasks),
    [preview, tasks]
  );

  const onAdd = () => {
    if (!preview || status.severity === "error") return;
    addRule({ id: crypto.randomUUID(), ...(preview as any) });
  };

  const onSuggest = async () => {
    setAiMsg(null);
    const text = nl.trim();
    if (!text) return setAiMsg("Enter a rule description.");
    try {
      const schema = {
        union: [
          "coRun",
          "slotRestriction",
          "loadLimit",
          "phaseWindow",
          "patternMatch",
          "precedenceOverride",
        ],
      };
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: "nlToRule", text, schema }),
      });
      const data = await res.json();
      const r = data?.rule as DraftRule | undefined;
      if (!r || !r.type) return setAiMsg("Could not parse a rule.");
      const v = validateRule(r as any, tasks);
      if (v.severity === "error") return setAiMsg(`Invalid: ${v.message}`);
      addRule({ id: crypto.randomUUID(), ...(r as any) });
      setAiMsg("Added.");
      setNl("");
    } catch {
      setAiMsg("AI error. Try refining the description.");
    }
  };

  return (
    // <div className="border rounded p-3 space-y-3">
    //   <div className="font-semibold">Rule Builder</div>

    //   {/* NL -> Rule */}
    //   <div className="flex gap-2">
    //     <input
    //       className="border rounded px-2 py-1 flex-1"
    //       placeholder='Describe a rule (e.g., "Co-run T1 and T2")'
    //       value={nl}
    //       onChange={(e) => setNl(e.target.value)}
    //     />
    //     <button
    //       className="bg-purple-600 text-white px-3 py-1 rounded"
    //       onClick={onSuggest}
    //     >
    //       Suggest from text
    //     </button>
    //   </div>
    //   {aiMsg && <div className="text-xs text-gray-600">{aiMsg}</div>}

    //   <div className="flex flex-col md:flex-row gap-3">
    //     <select
    //       className="border rounded px-2 py-1"
    //       value={type}
    //       onChange={(e) => setType(e.target.value as any)}
    //     >
    //       <option value="coRun">Co‑run</option>
    //       <option value="loadLimit">Load‑limit</option>
    //       <option value="phaseWindow">Phase‑window</option>
    //     </select>
    //     {type === "coRun" && (
    //       <input
    //         className="border rounded px-2 py-1 flex-1"
    //         placeholder="TaskIDs (e.g., T1 T2 T3)"
    //         onChange={(e) => setForm({ ...form, tasks: e.target.value })}
    //       />
    //     )}
    //     {type === "loadLimit" && (
    //       <>
    //         <input
    //           className="border rounded px-2 py-1"
    //           placeholder="WorkerGroup"
    //           onChange={(e) =>
    //             setForm({ ...form, workerGroup: e.target.value })
    //           }
    //         />
    //         <input
    //           className="border rounded px-2 py-1"
    //           placeholder="maxSlotsPerPhase"
    //           onChange={(e) =>
    //             setForm({ ...form, maxSlotsPerPhase: e.target.value })
    //           }
    //         />
    //       </>
    //     )}
    //     {type === "phaseWindow" && (
    //       <>
    //         <input
    //           className="border rounded px-2 py-1"
    //           placeholder="TaskID"
    //           onChange={(e) => setForm({ ...form, taskId: e.target.value })}
    //         />
    //         <input
    //           className="border rounded px-2 py-1"
    //           placeholder="Phases (e.g., 1,2,3 or 2-4)"
    //           onChange={(e) => setForm({ ...form, phases: e.target.value })}
    //         />
    //       </>
    //     )}
    //     <button
    //       className="bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50"
    //       disabled={!preview || status.severity === "error"}
    //       onClick={onAdd}
    //     >
    //       Add Rule
    //     </button>
    //   </div>

    //   <div className="text-sm">
    //     Preview:{" "}
    //     <code className="bg-gray-100 px-2 py-1 rounded">
    //       {JSON.stringify(preview)}
    //     </code>
    //     <span
    //       className={`ml-2 ${
    //         status.severity === "error"
    //           ? "text-red-600"
    //           : status.severity === "warning"
    //           ? "text-amber-600"
    //           : "text-green-600"
    //       }`}
    //     >
    //       {status.message}
    //     </span>
    //   </div>

    //   <div className="mt-3">
    //     <div className="font-medium mb-1">Current Rules</div>
    //     {rules.length === 0 && (
    //       <div className="text-sm text-gray-600">No rules yet.</div>
    //     )}
    //     <ul className="space-y-1">
    //       {rules.map((r) => (
    //         <li
    //           key={r.id}
    //           className="text-sm flex items-center justify-between border rounded px-2 py-1"
    //         >
    //           <code className="bg-gray-100 px-2 py-0.5 rounded">{r.type}</code>
    //           <span className="truncate flex-1 mx-2">{summarize(r)}</span>
    //           <button
    //             className="text-red-600 text-xs"
    //             onClick={() => removeRule(r.id)}
    //           >
    //             Remove
    //           </button>
    //         </li>
    //       ))}
    //     </ul>
    //   </div>
    // </div>
    <div className="space-y-3">
      <div className="text-lg font-semibold tracking-tight text-slate-100 mb-1">
        Rule Builder
      </div>

      {/* NL -> Rule */}
      <div className="flex gap-2">
        <input
          className="w-full rounded-lg border border-white/15 bg-white/10 text-white placeholder-white/60 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400/60"
          placeholder='Describe a rule (e.g., "Co-run T1 and T2")'
          value={nl}
          onChange={(e) => setNl(e.target.value)}
        />
        <button
          className="rounded-lg px-3 py-2 text-sm font-semibold bg-gradient-to-r from-fuchsia-500 to-sky-500 text-white hover:opacity-90 active:scale-[0.98]"
          onClick={onSuggest}
        >
          Suggest from text
        </button>
      </div>
      {aiMsg && <div className="text-xs text-slate-300">{aiMsg}</div>}

      {/* Manual builder */}
      <div className="flex flex-col md:flex-row gap-2">
        <select
          className="rounded-lg border border-white/15 bg-white/10 text-white px-3 py-2 outline-none"
          value={type}
          onChange={(e) => setType(e.target.value as any)}
        >
          <option value="coRun">Co‑run</option>
          <option value="loadLimit">Load‑limit</option>
          <option value="phaseWindow">Phase‑window</option>
        </select>
        {type === "coRun" && (
          <input
            className="rounded-lg border border-white/15 bg-white/10 text-white px-3 py-2 outline-none flex-1"
            placeholder="TaskIDs (e.g., T1 T2 T3)"
            onChange={(e) => setForm({ ...form, tasks: e.target.value })}
          />
        )}
        {type === "loadLimit" && (
          <>
            <input
              className="rounded-lg border border-white/15 bg-white/10 text-white px-3 py-2 outline-none"
              placeholder="WorkerGroup"
              onChange={(e) =>
                setForm({ ...form, workerGroup: e.target.value })
              }
            />
            <input
              className="rounded-lg border border-white/15 bg-white/10 text-white px-3 py-2 outline-none"
              placeholder="maxSlotsPerPhase"
              onChange={(e) =>
                setForm({ ...form, maxSlotsPerPhase: e.target.value })
              }
            />
          </>
        )}
        {type === "phaseWindow" && (
          <>
            <input
              className="rounded-lg border border-white/15 bg-white/10 text-white px-3 py-2 outline-none"
              placeholder="TaskID"
              onChange={(e) => setForm({ ...form, taskId: e.target.value })}
            />
            <input
              className="rounded-lg border border-white/15 bg-white/10 text-white px-3 py-2 outline-none"
              placeholder="Phases (e.g., 1,2,3 or 2-4)"
              onChange={(e) => setForm({ ...form, phases: e.target.value })}
            />
          </>
        )}
        <button
          className="rounded-lg px-3 py-2 text-sm font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          disabled={!preview || status.severity === "error"}
          onClick={onAdd}
        >
          Add Rule
        </button>
      </div>

      <div className="text-sm">
        <span className="text-slate-300">Preview: </span>
        <code className="rounded-md bg-white/10 px-2 py-1">
          {JSON.stringify(preview)}
        </code>
        <span
          className={`ml-2 ${
            status.severity === "error"
              ? "text-red-400"
              : status.severity === "warning"
              ? "text-amber-300"
              : "text-emerald-300"
          }`}
        >
          {status.message}
        </span>
      </div>

      <div>
        <div className="font-medium text-slate-200 mb-1">Current Rules</div>
        <ul className="space-y-1">
          {rules.map((r) => (
            <li
              key={r.id}
              className="text-sm flex items-center justify-between rounded border border-white/10 bg-white/5 px-2 py-1"
            >
              <code className="rounded bg-white/10 px-2 py-0.5">{r.type}</code>
              <span className="truncate flex-1 mx-2">{summarize(r)}</span>
              <button
                className="text-red-300 text-xs hover:text-red-200"
                onClick={() => removeRule(r.id)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function summarize(r: Rule) {
  switch (r.type) {
    case "coRun":
      return `tasks: ${(r as any).tasks.join(", ")}`;
    case "loadLimit":
      return `group ${(r as any).workerGroup}, max ${
        (r as any).maxSlotsPerPhase
      }/phase`;
    case "phaseWindow":
      return `task ${(r as any).taskId} → phases ${(r as any).phases.join(
        ","
      )}`;
    default:
      return "";
  }
}

function parseNums(s: string): number[] {
  if (!s) return [];
  const m = s.match(/^(\d+)\s*-\s*(\d+)$/);
  if (m) {
    const a = +m[1],
      b = +m[2];
    if (a <= b) return Array.from({ length: b - a + 1 }, (_, i) => a + i);
  }
  return s
    .replace(/[\[\]]/g, "")
    .split(/[,\s]+/)
    .map((x) => +x)
    .filter((n) => Number.isFinite(n));
}

function validateRule(
  r: DraftRule | null,
  tasks: { TaskID: string; Duration: number; PreferredPhases: number[] }[]
) {
  if (!r) return { severity: "warning", message: "Incomplete" };
  if (r.type === "coRun") {
    const ids = new Set((r as any).tasks);
    if (ids.size < (r as any).tasks.length)
      return { severity: "error", message: "Duplicate TaskID in coRun" };
    const missing = (r as any).tasks.filter(
      (id: string) => !tasks.find((t) => t.TaskID === id)
    );
    if (missing.length)
      return {
        severity: "error",
        message: `Missing tasks: ${missing.join(", ")}`,
      };
    const group = ((r as any).tasks as string[]).map(
      (id: string) => tasks.find((t) => t.TaskID === id)!
    );
    interface TaskWithPhases {
      PreferredPhases: number[];
    }

    const intersection: Set<number> = group
      .map((t: TaskWithPhases) => new Set<number>(t.PreferredPhases))
      .reduce<Set<number>>(
        (acc: Set<number>, s: Set<number>, idx: number) =>
          idx === 0
            ? s
            : new Set<number>([...acc].filter((x: number) => s.has(x))),
        new Set<number>()
      );
    const maxDur = Math.max(...group.map((t) => t.Duration));
    if (intersection.size < maxDur)
      return {
        severity: "error",
        message: "Insufficient common phases for coRun",
      };
    return { severity: "success", message: "Valid" };
  }
  if (r.type === "phaseWindow") {
    const t = tasks.find((t) => t.TaskID === (r as any).taskId);
    if (!t) return { severity: "error", message: "Task not found" };
    if (!(r as any).phases.length)
      return { severity: "error", message: "Phases required" };
    return { severity: "success", message: "Valid" };
  }
  if (r.type === "loadLimit") {
    const v = (r as any).maxSlotsPerPhase;
    if (!Number.isFinite(v) || v < 0)
      return { severity: "error", message: "Invalid maxSlotsPerPhase" };
    return { severity: "success", message: "Valid" };
  }
  return { severity: "warning", message: "Unsupported in Day 2 MVP" };
}
