"use client"
import { ColumnDef, flexRender, getCoreRowModel, Table, useReactTable } from "@tanstack/react-table";
import "@/styles/components/fpTable.css";
import Icon, { ICONS } from "./icon";
import { useMemo } from "react";

export default function FpTable<T> ({
    rows,
    columns,
    customWrapper
}: Readonly<{
    rows: T[],
    columns: ColumnDef<T>[],
    customWrapper?: Table<T>
}>) {
    const tableWrapper = customWrapper ?? useReactTable({
        columns,
        data: rows,
        getCoreRowModel: getCoreRowModel(),
        columnResizeMode: 'onChange',
        defaultColumn: {
            minSize: 50
        }
    });

    const columnSizeVars = useMemo(() => {
        const headers = tableWrapper.getFlatHeaders();
        const colSizes: { [key: string]: number } = {};
        for (let i = 0; i < headers.length; i++) {
            const header = headers[i]!;
            colSizes[`--header-${header.id}-size`] = header.getSize();
            colSizes[`--col-${header.column.id}-size`] = header.column.getSize();
        }
        return colSizes;
    }, [tableWrapper.getState().columnSizingInfo, tableWrapper.getState().columnSizing]);


    return <div className="table-container title rounded-m">
        <div className="table rounded-s" style={{...columnSizeVars, width: tableWrapper.getTotalSize()}}>
            <div className="table-data rounded-s" {...{}}>
                {/**Header groups */}
                {tableWrapper.getHeaderGroups().map((headerGroup) =>
                    <div className="table-header-group" key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                            <div className="table-header average" key={header.id} style={{width: `calc(var(--header-${header?.id}-size) * 1px)`}}>
                                {flexRender(header.column.columnDef.header, header.getContext())}
                                <div className="spacer"></div>
                                {(header.column.columnDef.enableResizing ?? true) &&
                                    <div className={`table-header-resizer ${header.column.getIsResizing() ? "resizing" : ""}`}
                                        onDoubleClick={() => header.column.resetSize()}
                                        onMouseDown={header.getResizeHandler()}
                                        onTouchStart={header.getResizeHandler()}>
                                            <Icon iconName={ICONS.DRAG_HANDLE}/>
                                    </div>
                                }
                            </div>
                        ))}
                    </div>
                )}
                {/**Rows */}
                {tableWrapper.getRowModel().rows.map(row =>
                    <div className="table-row" key={row.id} onClick={() => row.toggleSelected()}>
                        {row.getVisibleCells().map(cell =>
                            <div className="table-cell" key={cell.id} style={{width: `calc(var(--col-${cell.column.id}-size) * 1px)`}}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    </div>
}