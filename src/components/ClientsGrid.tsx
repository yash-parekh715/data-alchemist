// "use client";
// import EntityGrid from "@/components/EntityGrid";
// import { useDataStore } from "@/store/useDataStore";
// import { ColDef } from "ag-grid-community";
// import { Client } from "@/types/client";
// import {
//   normalizeClient,
//   validateClientsT0T1,
// } from "@/lib/validators/entityValidators";
// import { numberParser, listParser } from "@/lib/parser/parseFile";
// import RevalidateButton from "@/components/RevalidatButton";
// import { useEffect, useState } from "react";
// import NLSearch from "@/components/search/NLSearch";

// function ClientsGrid() {
//   const rows = useDataStore((s) => s.clients);
//   const setClients = useDataStore((s) => s.setClients);
//   const [view, setView] = useState<Client[]>(rows);
//   useEffect(() => setView(rows), [rows]);

//   const cols: ColDef<Client>[] = [
//     { field: "ClientID" },
//     { field: "ClientName" },
//     { field: "PriorityLevel", valueParser: numberParser },
//     { field: "RequestedTaskIDs", valueParser: listParser },
//     { field: "GroupTag" },
//     { field: "AttributesJSON", editable: false }, // editing JSON safely is Day 2+
//   ];
//   return (
//     <div>
//       <h2 className="font-semibold mb-2">Clients</h2>
//       <NLSearch entity="clients" rows={rows} onApply={setView} />
//       <EntityGrid<Client>
//         entity="clients"
//         rows={view}
//         columns={cols}
//         getId={(r) => r.ClientID}
//       />
//       <RevalidateButton
//         onClick={() =>
//           setClients(rows.map(normalizeClient), validateClientsT0T1(rows))
//         }
//       />
//     </div>
//   );
// }

// export default ClientsGrid;

"use client";
import EntityGrid from "@/components/EntityGrid";
import { useDataStore } from "@/store/useDataStore";
import { ColDef } from "ag-grid-community";
import { Client } from "@/types/client";
import {
  normalizeClient,
  validateClientsT0T1,
} from "@/lib/validators/entityValidators";
import { numberParser, listParser } from "@/lib/parser/parseFile";
import RevalidateButton from "@/components/RevalidatButton";
import { useEffect, useState } from "react";
import NLSearch from "@/components/search/NLSearch";

function ClientsGrid() {
  const rows = useDataStore((s) => s.clients);
  const setClients = useDataStore((s) => s.setClients);
  const [view, setView] = useState<Client[]>(rows);
  useEffect(() => setView(rows), [rows]);

  const cols: ColDef<Client>[] = [
    { field: "ClientID" },
    { field: "ClientName" },
    { field: "PriorityLevel", valueParser: numberParser },
    { field: "RequestedTaskIDs", valueParser: listParser },
    { field: "GroupTag" },
    { field: "AttributesJSON", editable: false },
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight text-slate-100">
          Clients
        </h2>
        <div className="shrink-0">
          <RevalidateButton
            onClick={() =>
              setClients(rows.map(normalizeClient), validateClientsT0T1(rows))
            }
          />
        </div>
      </div>
      <NLSearch entity="clients" rows={rows} onApply={setView} />
      <EntityGrid<Client>
        entity="clients"
        rows={view}
        columns={cols}
        getId={(r) => r.ClientID}
      />
    </div>
  );
}

export default ClientsGrid;
