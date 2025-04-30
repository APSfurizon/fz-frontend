import FpTable from "@/components/fpTable";
import { ColumnDef } from "@tanstack/react-table";

export type DebugRowType = {
    name: string,
    description: string,
    age: number
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
        name: 'Alexander',
        description: 'the fake',
        age: 69
    },
    {
        name: 'Mariottide',
        description: 'la bigotta',
        age: 56
    }
]

export default function Home() {
    return (
      <FpTable<DebugRowType> columns={columns} rows={rows}/>
    );
}