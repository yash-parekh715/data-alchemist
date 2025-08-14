// "use client";
// import { useState } from "react";
// import { evaluateDSL, Entity } from "@/lib/dsl";

// type Props<T> = { entity: Entity; rows: T[]; onApply: (filtered: T[]) => void };

// export default function NLSearch<T extends Record<string, any>>({
//   entity,
//   rows,
//   onApply,
// }: Props<T>) {
//   const [q, setQ] = useState("");
//   const [dsl, setDsl] = useState("");
//   const [busy, setBusy] = useState(false);

//   const run = async () => {
//     const text = q.trim();
//     if (!text) return onApply(rows);
//     setBusy(true);
//     try {
//       const res = await fetch("/api/ai", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ task: "nlToDsl", text, schema: { entity } }),
//       });
//       const data = await res.json();
//       const d = String(data?.dsl || "").trim();
//       setDsl(d);
//       onApply(evaluateDSL(entity, d || text, rows));
//     } catch {
//       setDsl(text);
//       onApply(evaluateDSL(entity, text, rows));
//     } finally {
//       setBusy(false);
//     }
//   };

//   return (
//     <div className="flex gap-2 items-center mb-2">
//       <input
//         className="border rounded px-2 py-1 flex-1"
//         placeholder="e.g., task.duration > 1 AND includes(task.preferredPhases, 2)"
//         value={q}
//         onChange={(e) => setQ(e.target.value)}
//       />
//       <button
//         className="border rounded px-2 py-1"
//         onClick={run}
//         disabled={busy}
//       >
//         {busy ? "…" : "Run"}
//       </button>
//       {dsl && (
//         <code className="text-xs bg-gray-100 px-2 py-1 rounded">
//           DSL: {dsl}
//         </code>
//       )}
//     </div>
//   );
// }

// "use client";
// import { useState } from "react";
// import { evaluateDSL, Entity } from "@/lib/dsl";

// type Props<T> = { entity: Entity; rows: T[]; onApply: (filtered: T[]) => void };

// export default function NLSearch<T extends Record<string, any>>({
//   entity,
//   rows,
//   onApply,
// }: Props<T>) {
//   const [q, setQ] = useState("");
//   const [dsl, setDsl] = useState("");
//   const [busy, setBusy] = useState(false);

//   const run = async () => {
//     const text = q.trim();
//     if (!text) return onApply(rows);
//     setBusy(true);
//     try {
//       const res = await fetch("/api/ai", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ task: "nlToDsl", text, schema: { entity } }),
//       });
//       const data = await res.json();
//       const d = String(data?.dsl || "").trim();
//       setDsl(d);
//       onApply(evaluateDSL(entity, d || text, rows));
//     } catch {
//       setDsl(text);
//       onApply(evaluateDSL(entity, text, rows));
//     } finally {
//       setBusy(false);
//     }
//   };

//   return (
//     <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur p-3">
//       <div className="flex items-center gap-2">
//         <input
//           className="w-full rounded-xl border border-white/10 bg-white/10 text-white placeholder-white/50 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400/50"
//           placeholder="Ask or type DSL, e.g. task.duration > 1 AND includes(task.preferredPhases, 2)"
//           value={q}
//           onChange={(e) => setQ(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && run()}
//         />
//         <button
//           className="inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:opacity-90 disabled:opacity-60"
//           onClick={run}
//           disabled={busy}
//         >
//           {busy ? "Thinking…" : "Search"}
//         </button>
//         {dsl && (
//           <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-xs text-white">
//             DSL: {dsl}
//           </span>
//         )}
//       </div>
//     </div>
//   );
// }

"use client";
import { useState } from "react";
import { evaluateDSL, Entity } from "@/lib/dsl";

type Props<T> = { entity: Entity; rows: T[]; onApply: (filtered: T[]) => void };

export default function NLSearch<T extends Record<string, any>>({
  entity,
  rows,
  onApply,
}: Props<T>) {
  const [q, setQ] = useState("");
  const [dsl, setDsl] = useState("");
  const [busy, setBusy] = useState(false);

  const run = async () => {
    const text = q.trim();
    if (!text) return onApply(rows);
    setBusy(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: "nlToDsl", text, schema: { entity } }),
      });
      const data = await res.json();
      const d = String(data?.dsl || "").trim();
      setDsl(d);
      onApply(evaluateDSL(entity, d || text, rows));
    } catch {
      setDsl(text);
      onApply(evaluateDSL(entity, text, rows));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur p-3">
      <div className="flex items-center gap-2">
        <input
          className="w-full rounded-lg border border-white/15 bg-white/10 text-white placeholder-white/60 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400/60"
          placeholder="Ask or type DSL, e.g. task.duration > 1 AND includes(task.preferredPhases, 2)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && run()}
        />
        <button
          className="inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
          onClick={run}
          disabled={busy}
        >
          {busy ? "Thinking…" : "Search"}
        </button>
      </div>
      {dsl && (
        <div className="mt-2 text-xs text-white/80">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1">
            DSL: {dsl}
          </span>
        </div>
      )}
    </div>
  );
}
