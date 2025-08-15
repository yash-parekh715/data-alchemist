"use client";
import "@/lib/ag-grid-register"; // registers AllCommunityModule
import React, { useMemo, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import type {
  ColDef,
  CellClassParams,
  GetRowIdParams,
} from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { useDataStore } from "@/store/useDataStore";
import { ValidationIssue } from "@/types/validation";

type Props<T> = {
  entity: "clients" | "workers" | "tasks";
  rows: T[];
  columns: ColDef<T>[];
  getId: (r: T) => string;
  onRowsChange?: (rows: T[]) => void;
};

export default function EntityGrid<T extends object>({
  entity,
  rows,
  columns,
  getId,
  onRowsChange,
}: Props<T>) {
  const gridRef = useRef<AgGridReact<T>>(null);
  const issues = useDataStore((s) => s.issues);
  const getRowId = (p: GetRowIdParams<T>) => getId(p.data);

  const cellClassRules = useMemo(
    () => ({
      "cell-error": (p: CellClassParams<T>) =>
        hasIssue(
          issues,
          entity,
          getId(p.data!),
          p.colDef.field as string,
          "error"
        ),
      "cell-warning": (p: CellClassParams<T>) =>
        hasIssue(
          issues,
          entity,
          getId(p.data!),
          p.colDef.field as string,
          "warning"
        ),
    }),
    [issues, entity]
  );

  const cols = useMemo<ColDef<T>[]>(() => {
    return columns.map((c) => ({ editable: true, cellClassRules, ...c }));
  }, [columns, cellClassRules]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-3">
      <div className="ag-theme-alpine w-full h-[420px] xl:h-[520px] rounded-xl overflow-hidden">
        <AgGridReact<T>
          rowData={rows}
          columnDefs={cols}
          getRowId={getRowId}
          defaultColDef={{
            editable: true,
            resizable: true,
            sortable: true,
            filter: true,
          }}
          theme="legacy"
          onCellValueChanged={(e) => {
            if (!onRowsChange) return;
            const id = getId(e.data);
            const next = rows.map((r) => (getId(r) === id ? (e.data as T) : r));
            onRowsChange(next);
          }}
        />
      </div>
    </div>
  );
}

function hasIssue(
  issues: ValidationIssue[],
  entity: string,
  id: string,
  field: string,
  severity: "error" | "warning"
) {
  return issues.some(
    (i) =>
      i.entity === entity &&
      i.id === id &&
      i.field === field &&
      i.severity === severity
  );
}
