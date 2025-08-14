"use client";
import EntityGrid from "@/components/EntityGrid";
import { useDataStore } from "@/store/useDataStore";
import { ColDef } from "ag-grid-community";
import { Task } from "@/types/task";
import {
  normalizeTask,
  validateTasksT0T1,
} from "@/lib/validators/entityValidators";
import {
  numberParser,
  listParser,
  numberListOrRangeParser,
} from "@/lib/parser/parseFile";
import RevalidateButton from "@/components/RevalidatButton";
import { useEffect, useState } from "react";
import NLSearch from "@/components/search/NLSearch";

function TasksGrid() {
  const rows = useDataStore((s) => s.tasks);
  const setTasks = useDataStore((s) => s.setTasks);
  const [view, setView] = useState<Task[]>(rows);
  useEffect(() => setView(rows), [rows]);

  const cols: ColDef<Task>[] = [
    { field: "TaskID" },
    { field: "TaskName" },
    { field: "Category" },
    { field: "Duration", valueParser: numberParser },
    { field: "RequiredSkills", valueParser: listParser },
    { field: "PreferredPhases", valueParser: numberListOrRangeParser },
    { field: "MaxConcurrent", valueParser: numberParser },
  ];
  return (
    // <div>
    //   <h2 className="font-semibold mb-2">Tasks</h2>
    //   <NLSearch entity="tasks" rows={rows} onApply={setView} />
    //   <EntityGrid<Task>
    //     entity="tasks"
    //     rows={view}
    //     columns={cols}
    //     getId={(r) => r.TaskID}
    //   />
    //   <RevalidateButton
    //     onClick={() =>
    //       setTasks(rows.map(normalizeTask), validateTasksT0T1(rows))
    //     }
    //   />
    // </div>
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight text-slate-100">
          Tasks
        </h2>
        <div className="shrink-0">
          <RevalidateButton
            onClick={() =>
              setTasks(rows.map(normalizeTask), validateTasksT0T1(rows))
            }
          />
        </div>
      </div>
      <NLSearch entity="tasks" rows={rows} onApply={setView} />
      <EntityGrid<Task>
        entity="tasks"
        rows={view}
        columns={cols}
        getId={(r) => r.TaskID}
      />
    </div>
  );
}

export default TasksGrid;
