"use client"
import FpTable from "@/components/table/fpTable";
import { ColumnDef, Table } from "@tanstack/react-table";
import { Row } from "@tanstack/react-table";
import { MouseEvent, useRef, useState } from "react";
import * as tableUtil from "@/lib/components/table/fpTable";

export type DebugRowType = {
    name: string,
    description: string,
    age: number,
    extra?: string
}

const columns: ColumnDef<DebugRowType>[] = [
    {
        header: 'name',
        accessorKey: 'name',
    },
    {
        header: 'description',
        accessorKey: 'description',
    },
    {
        header: 'age',
        accessorKey: 'age',
    }
];

const defaultRows: DebugRowType[] = [
    {
        name: 'Alexander',
        description: 'the great',
        age: 1200
    },
    {
        name: 'Poraccio',
        description: 'er dragaccio',
        age: 69,
        extra: "veramente non ha soldi questo"
    },
    {
        name: 'Mariottide',
        description: 'la bigotta',
        age: 56
    },
    {
        name: 'Cielo celeste',
        description: 'Oggi a disoneste',
        age: 56
    },
    {
        name: 'Ma salve mister',
        description: 'Caffè?',
        age: 56
    }
]

const hasDetails = (row: Row<DebugRowType>) => {
    return !!row.original.extra;
}

const getDetails = (row: Row<DebugRowType>) => {
    return <span>{row.original.extra}</span>
}

export default function Home() {
    const [rows, setRows] = useState(defaultRows);

    const tableRef = useRef<Table<DebugRowType>>();

    const onAddRow = (e: MouseEvent) => {
        const toSet = [{
            name: "new",
            description: "light",
            age: 0
        }, ...rows];
        setRows(toSet);
    }

    const onDelete = (e: MouseEvent) => {
        if (!tableRef.current) return;
        const rows = tableUtil.getAllRows(tableRef.current);
        const idsToDelete = tableUtil.getSelectedRows(tableRef.current).map(row=>row.id);
        const toSet = [...rows].filter(row=>!idsToDelete.includes(row.id)).map(row=>row.original);
        setRows(toSet);
    };

    return (
      <FpTable<DebugRowType> columns={columns} rows={rows} enableRowSelection
        enableSearch showAddButton showDeleteButton enablePagination pageSize={10}
        hasDetails={hasDetails} getDetails={getDetails} onAdd={onAddRow} onDelete={onDelete}
        tableConfigRef={tableRef} enableMultiRowSelection/>
    );
}