// "use client";
// import EntityGrid from "@/components/EntityGrid";
// import { useDataStore } from "@/store/useDataStore";
// import { ColDef } from "ag-grid-community";
// import { Worker } from "@/types/worker";
// import {
//   normalizeWorker,
//   validateWorkersT0T1,
// } from "@/lib/validators/entityValidators";
// import RevalidateButton from "@/components/RevalidatButton";
// import {
//   listParser,
//   numberListParser,
//   numberParser,
// } from "@/lib/parser/parseFile";
// import { useEffect, useState } from "react";
// import NLSearch from "@/components/search/NLSearch";

// function WorkersGrid() {
//   const rows = useDataStore((s) => s.workers);
//   const setWorkers = useDataStore((s) => s.setWorkers);
//   const [view, setView] = useState<Worker[]>(rows);
//   useEffect(() => setView(rows), [rows]);

//   const cols: ColDef<Worker>[] = [
//     { field: "WorkerID" },
//     { field: "WorkerName" },
//     { field: "Skills", valueParser: listParser },
//     { field: "AvailableSlots", valueParser: numberListParser },
//     { field: "MaxLoadPerPhase", valueParser: numberParser },
//     { field: "WorkerGroup" },
//     { field: "QualificationLevel" },
//   ];
//   return (
//     <div>
//       <h2 className="font-semibold mb-2">Workers</h2>
//       <NLSearch entity="workers" rows={rows} onApply={setView} />
//       <EntityGrid<Worker>
//         entity="workers"
//         rows={view}
//         columns={cols}
//         getId={(r) => r.WorkerID}
//       />
//       <RevalidateButton
//         onClick={() =>
//           setWorkers(rows.map(normalizeWorker), validateWorkersT0T1(rows))
//         }
//       />
//     </div>
//   );
// }

// export default WorkersGrid;

"use client";
import EntityGrid from "@/components/EntityGrid";
import { useDataStore } from "@/store/useDataStore";
import { ColDef } from "ag-grid-community";
import { Worker } from "@/types/worker";
import {
  normalizeWorker,
  validateWorkersT0T1,
} from "@/lib/validators/entityValidators";
import RevalidateButton from "@/components/RevalidatButton";
import {
  listParser,
  numberListParser,
  numberParser,
} from "@/lib/parser/parseFile";
import { useEffect, useState } from "react";
import NLSearch from "@/components/search/NLSearch";

function WorkersGrid() {
  const rows = useDataStore((s) => s.workers);
  const setWorkers = useDataStore((s) => s.setWorkers);
  const [view, setView] = useState<Worker[]>(rows);
  useEffect(() => setView(rows), [rows]);

  const cols: ColDef<Worker>[] = [
    { field: "WorkerID" },
    { field: "WorkerName" },
    { field: "Skills", valueParser: listParser },
    { field: "AvailableSlots", valueParser: numberListParser },
    { field: "MaxLoadPerPhase", valueParser: numberParser },
    { field: "WorkerGroup" },
    { field: "QualificationLevel" },
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight text-slate-100">
          Workers
        </h2>
        <div className="shrink-0">
          <RevalidateButton
            onClick={() =>
              setWorkers(rows.map(normalizeWorker), validateWorkersT0T1(rows))
            }
          />
        </div>
      </div>
      <NLSearch entity="workers" rows={rows} onApply={setView} />
      <EntityGrid<Worker>
        entity="workers"
        rows={view}
        columns={cols}
        getId={(r) => r.WorkerID}
      />
    </div>
  );
}

export default WorkersGrid;
