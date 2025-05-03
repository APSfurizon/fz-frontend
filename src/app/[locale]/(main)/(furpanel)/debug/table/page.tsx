"use client"
import FpTable from "@/components/table/fpTable";
import { ColumnDef } from "@tanstack/react-table";
import { Row } from "@tanstack/react-table";

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

const rows: DebugRowType[] = [
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
    return (
      <FpTable<DebugRowType> columns={columns} rows={rows} enableRowSelection enableSearch showAddButton showDeleteButton enablePagination pageSize={3} hasDetails={hasDetails} getDetails={getDetails}/>
    );
}