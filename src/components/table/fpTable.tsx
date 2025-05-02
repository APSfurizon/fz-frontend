"use client"
import { ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, Row, SortingState, Table, useReactTable } from "@tanstack/react-table";
import "@/styles/components/fpTable.css";
import Icon, { ICONS } from "../icon";
import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import JanInput from "../input/janInput";
import { useTranslations } from "next-intl";
import Button from "../input/button";
import { getCountArray } from "@/lib/utils";

const MIN_COLUMN_SIZE = 20;
const DEFAULT_PAGE_SIZE = 30;

export default function FpTable<T> ({
    rows,
    columns,
    customWrapper,
    tableStyle,
    enableRowSelection=false,
    enableMultiRowSelection=false,
    enableSearch=false,
    showAddButton=false,
    showDeleteButton=false,
    onAdd,
    onDelete,
    enablePagination=false,
    pageSize = DEFAULT_PAGE_SIZE
}: Readonly<{
    rows: T[],
    columns: ColumnDef<T>[],
    customWrapper?: Table<T>,
    tableStyle?: CSSProperties,
    enableRowSelection?: boolean | ((row: Row<T>) => boolean),
    enableMultiRowSelection?: boolean | ((row: Row<T>) => boolean),
    enableSearch?: boolean,
    showAddButton?: boolean,
    showDeleteButton?: boolean,
    onAdd?: React.MouseEventHandler,
    onDelete?: React.MouseEventHandler,
    enablePagination?: boolean,
    pageSize?: number
}>) {
    const tableRef = useRef<HTMLDivElement>(null);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState<any>([]);
    const [pagination, setPagination] = useState({
        pageIndex: 0, //initial page index
        pageSize: pageSize, //default page size
      });
    const tableWrapper = customWrapper ?? useReactTable({
        columns,
        data: rows,
        columnResizeMode: 'onChange',
        enableRowSelection,
        enableMultiRowSelection,
        defaultColumn: {
            minSize: MIN_COLUMN_SIZE
        },
        state: {
            sorting,
            globalFilter,
            pagination: enablePagination ? pagination : undefined
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
        globalFilterFn: 'includesString',
        onPaginationChange: setPagination 
    });

    const t = useTranslations('components');

    /**First time render */
    useEffect(()=>{
        if (!tableRef.current) return;
        const headers = tableWrapper.getFlatHeaders();
        const autofillWidth = tableRef.current.clientWidth / headers.length;
        let sizingStartToSet: Record<string, number> = {};
        for (let  i = 0; i < headers.length; i++) {
            const header = headers[i];
            sizingStartToSet[header.id] = Math.max(autofillWidth, MIN_COLUMN_SIZE);
        }
        tableWrapper.setColumnSizing(sizingStartToSet);
    }, [tableRef.current])

    useEffect(() => {
            setPagination(prev => ({...prev, pageSize: pageSize}));
    }, [pageSize]);

    const columnSizeVars = useMemo(() => {
        const headers = tableWrapper.getFlatHeaders();
        const colSizes: { [key: string]: string } = {};
        for (let i = 0; i < headers.length; i++) {
            const header = headers[i]!;
            const headerSize = header.getSize();
            const columnSize = header.column.getSize();
            colSizes[`--header-${header.id}-size`] = headerSize == 25 ? 'auto' : `${headerSize}px`;
            colSizes[`--col-${header.column.id}-size`] = columnSize == 25 ? 'auto' : `${columnSize}px`;
        }
        return colSizes;
    }, [tableWrapper.getState().columnSizingInfo, tableWrapper.getState().columnSizing]);

    const enableToolbar = useMemo(()=>enableSearch || showAddButton || showDeleteButton, [enableSearch, showAddButton, showDeleteButton]);

    return <div className="table-container title rounded-m">
        {enableToolbar && <div className="table-toolbar horizontal-list gap-2mm">
            <div className="spacer"></div>
            {enableSearch && <JanInput className="table-search" placeholder={t("table.search.placeholder")}
                onChange={(e)=> tableWrapper.setGlobalFilter(String(e.target.value))}/>}
            {showAddButton && <Button iconName={ICONS.ADD} onClick={onAdd} title={t("table.add.title")}/>}
            {showDeleteButton && <Button iconName={ICONS.DELETE} onClick={onDelete} title={t("table.delete.title")}/>}
        </div>}
        <div className="table rounded-s gap-2mm" style={{...columnSizeVars, width: '100%', ...tableStyle}} ref={tableRef}>
            <div className="table-data rounded-s" style={{width: tableWrapper.getTotalSize()}}>
                {/**Header groups */}
                {tableWrapper.getHeaderGroups().map((headerGroup) =>
                    <div className="table-header-group" key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                            <div className="table-header average" key={header.id} style={{width: `var(--header-${header?.id}-size)`}}>
                                <div className="header-data" onClick={header.column.getToggleSortingHandler()}>
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                    {header.column.getIsSorted() && <Icon iconName={{
                                        asc: ICONS.ARROW_DROP_UP,
                                        desc: ICONS.ARROW_DROP_DOWN,
                                    }[header.column.getIsSorted() as string]!}/>}
                                    
                                </div>
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
                    <div className={"table-row "
                        + (row.getIsSelected() || row.getIsSomeSelected() ? "row-selected" : "")
                        + " "
                        + (row.getCanSelect() ? "selectable" : "")} 
                        key={row.id} onClick={row.getToggleSelectedHandler()}>
                            {row.getVisibleCells().map(cell =>
                                <div className="table-cell" key={cell.id} style={{width: `var(--col-${cell.column.id}-size)`}}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </div>
                            )}
                    </div>
                )}
            </div>
            {enablePagination && <div className="table-pages horizontal-list gap-4mm">
                <div className="spacer"></div>
                <Button className="page-change" disabled={!tableWrapper.getCanPreviousPage()}
                    iconName={ICONS.ARROW_BACK} onClick={tableWrapper.previousPage}></Button>
                {getCountArray(tableWrapper.getPageCount(), true).map((i)=><>
                    <Button className={`page-change ${pagination.pageIndex == i ? "selected" : ""}`} 
                        key={`page-${i}`} onClick={()=>tableWrapper.setPageIndex(i)}
                        disabled={pagination.pageIndex == i}>{i+1}</Button>
                </>)}
                <Button className="page-change" disabled={!tableWrapper.getCanNextPage()}
                    iconName={ICONS.ARROW_FORWARD} onClick={tableWrapper.nextPage}></Button>
                <div className="spacer"></div>
            </div>}
        </div>
    </div>
}