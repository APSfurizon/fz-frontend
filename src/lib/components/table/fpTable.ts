import { Row, RowData, Table } from "@tanstack/react-table";

export function getAllRows<T>(wrapper: Table<T>): Row<T>[] {
    return Object.entries(wrapper.getRowModel().rowsById).map(kv => kv[1]);
}

export function getSelectedRows<T>(wrapper: Table<T>): Row<T>[] {
    return Object.entries(wrapper.getSelectedRowModel().rowsById).map(kv => kv[1]);
}