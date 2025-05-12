"use client"
import { Column, ColumnDef, ColumnPinningState, createColumnHelper, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, Row, RowSelectionState, SortingState, Table, TableOptions, useReactTable } from "@tanstack/react-table";
import "@/styles/components/fpTable.css";
import Icon, { ICONS } from "../icon";
import { CSSProperties, Fragment, MutableRefObject, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import JanInput from "../input/janInput";
import { useTranslations } from "next-intl";
import Button from "../input/button";
import { getCountArray } from "@/lib/utils";

const MIN_COLUMN_SIZE = 100;
const DEFAULT_PAGE_SIZE = 30;

export default function FpTable<T> ({
    rows,
    columns,
    initialWrapper,
    tableStyle,
    enableRowSelection=false,
    enableMultiRowSelection=false,
    enableSearch=false,
    showAddButton=false,
    showDeleteButton=false,
    onAdd,
    onDelete,
    enablePagination=false,
    pageSize = DEFAULT_PAGE_SIZE,
    hasDetails,
    getDetails,
    onSelectionChange,
    tableConfigRef,
    tableOptions,
    pinnedColumns,
    sort
}: Readonly<{
    rows: T[],
    columns: ColumnDef<T, any>[],
    initialWrapper?: Table<T>,
    tableStyle?: CSSProperties,
    enableRowSelection?: boolean | ((row: Row<T>) => boolean),
    enableMultiRowSelection?: boolean | ((row: Row<T>) => boolean),
    enableSearch?: boolean,
    showAddButton?: boolean,
    showDeleteButton?: boolean,
    onAdd?: React.MouseEventHandler,
    onDelete?: React.MouseEventHandler,
    enablePagination?: boolean,
    pageSize?: number,
    hasDetails?: (row: Row<T>) => boolean,
    getDetails?: (row: Row<T>) => React.ReactNode,
    onSelectionChange?: (e: RowSelectionState) => void,
    tableConfigRef?: MutableRefObject<Table<T> | undefined>,
    tableOptions?: Partial<TableOptions<T>>,
    pinnedColumns?: ColumnPinningState,
    sort?: SortingState
}>) {
    const columnHelper = createColumnHelper<T>();

    const EXPAND_DETAILS_COLUMN: ColumnDef<T> = useMemo(()=>columnHelper.display({
        id: "details_action",
        enableResizing: false,
        size: 50,
        minSize: 50,
        maxSize: 50,
        cell: props => props.row.getCanExpand() && (
            <div className="table-expand" onClick={props.row.getToggleExpandedHandler()}>
                <Icon className="medium"
                    iconName={props.row.getIsExpanded() ? ICONS.KEYBOARD_ARROW_UP : ICONS.KEYBOARD_ARROW_DOWN}/>
            </div>
        )
    }), []);
    
    const [tableColumns, setTableColumns] = useState(columns);
    const tableRef = useRef<HTMLDivElement>(null);
    const [sorting, setSorting] = useState<SortingState>(sort || []);
    const [globalFilter, setGlobalFilter] = useState<any>([]);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize, //default page size
      });
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [columnPinning, setColumnPinning] = useState<ColumnPinningState>(pinnedColumns || {
        left: [],
        right: [],
    });
    const [data, setData] = useState<T[]>([]);

    const reactTable = useReactTable({
        ...tableOptions,
        columns: tableColumns,
        data,
        columnResizeMode: 'onChange',
        enableRowSelection,
        enableMultiRowSelection,
        defaultColumn: {
            minSize: MIN_COLUMN_SIZE
        },
        state: {
            sorting,
            globalFilter,
            pagination: pagination,
            rowSelection,
            columnPinning,
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
        globalFilterFn: 'includesString',
        onPaginationChange: enablePagination ? setPagination : undefined,
        onRowSelectionChange: setRowSelection,
        getRowCanExpand: hasDetails,
        onColumnPinningChange: setColumnPinning
    });
    const [tableWrapper] = useState(initialWrapper ?? reactTable);

    useImperativeHandle(tableConfigRef, () => tableWrapper);

    const getCommonPinningStyles = (column: Column<T>): CSSProperties => {
        const isPinned = column.getIsPinned()
        const isLastLeftPinnedColumn =
          isPinned === 'left' && column.getIsLastColumn('left')
        const isFirstRightPinnedColumn =
          isPinned === 'right' && column.getIsFirstColumn('right')
      
        return {
          boxShadow: isLastLeftPinnedColumn
            ? '-4px 0 4px -4px gray inset'
            : isFirstRightPinnedColumn
              ? '4px 0 4px -4px gray inset'
              : undefined,
          left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
          right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
          position: isPinned ? 'sticky' : 'relative',
          width: column.getSize(),
          zIndex: isPinned ? 1 : 0,
          opacity: isPinned ? 0.95 : undefined
        }
      }

    const enableToolbar = useMemo(()=>enableSearch || showAddButton || showDeleteButton,
        [enableSearch, showAddButton, showDeleteButton]);

    const t = useTranslations('components');

    /** Column change */
    useEffect(()=>{
        if (tableWrapper.getCanSomeRowsExpand()) {
            const toReturn = [...columns];
            
            toReturn.splice(0, 0, EXPAND_DETAILS_COLUMN);
            setTableColumns(toReturn);
        }
    }, [columns, data]);

    /** Rows change */
    useEffect(()=>{
        tableWrapper.resetRowSelection();
        tableWrapper.resetExpanded();
        setData(rows);
    }, [rows]);

    /**First time table render */
    useEffect(()=>{
        if (!tableRef.current) return;
        const headers = tableWrapper.getFlatHeaders();
        let extra = 0;
        let columnCount = headers.length;
        headers.filter(h=>!h.column.getCanResize()).forEach(h=>{
            columnCount--;
            extra += h.column.getSize()
        })
        const autofillWidth = (tableRef.current.clientWidth - extra) / Math.min(columnCount, 5);
        const sizingStartToSet: Record<string, number> = {};
        for (let  i = 0; i < headers.length; i++) {
            const header = headers[i];
            if (header.column.id === EXPAND_DETAILS_COLUMN.id) continue;
            sizingStartToSet[header.id] = Math.max(autofillWidth, MIN_COLUMN_SIZE);
        }
        tableWrapper.setColumnSizing(sizingStartToSet);
    }, [tableRef.current, tableColumns])

    /* Row selection change */
    useEffect(()=>{
        if (onSelectionChange) onSelectionChange(rowSelection);
    }, [rowSelection])

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

    return <div className="table-container title rounded-m">
        {enableToolbar && <div className="table-toolbar horizontal-list gap-2mm">
            <div className="spacer"></div>
            {enableSearch && <JanInput className="table-search" placeholder={t("table.search.placeholder")}
                onChange={(e)=> tableWrapper.setGlobalFilter(String(e.target.value))}/>}
            {showAddButton && <Button iconName={ICONS.ADD} onClick={onAdd} title={t("table.add.title")}/>}
            {showDeleteButton && <Button iconName={ICONS.DELETE} onClick={onDelete} title={t("table.delete.title")}
                disabled={!tableWrapper.getIsSomeRowsSelected() && !tableWrapper.getIsAllRowsSelected()}/>}
        </div>}
        <div className="table rounded-s gap-2mm" ref={tableRef}
            style={{...columnSizeVars, width: '100%', ...tableStyle}}>
            <div className="table-data rounded-s" style={{width: tableWrapper.getTotalSize()}}>
                {/**Header groups */}
                {tableWrapper.getHeaderGroups().map((headerGroup) =>
                    <div className="table-header-group" key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                            <div key={header.id}
                                className={`table-header average ${header.column.getIsPinned() ? "pinned" : ""}`}
                                style={{
                                    width: `var(--header-${header?.id}-size)`,
                                    ...getCommonPinningStyles(header.column)
                                }}>
                                <div className="header-data" onClick={header.column.getToggleSortingHandler()}>
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                    {header.column.getIsSorted() && <Icon iconName={{
                                        asc: ICONS.ARROW_DROP_UP,
                                        desc: ICONS.ARROW_DROP_DOWN,
                                    }[header.column.getIsSorted() as string]!}/>}
                                    {header.column.getIsPinned() && <a onClick={()=>header.column.pin(false)}>
                                        <Icon className="small" iconName={ICONS.KEEP}/></a>}
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
                {/**No data */}
                {!tableWrapper.getRowModel().rows || tableWrapper.getRowModel().rows.length == 0 && <div className="table-row">
                    <div className="table-cell" style={{width: tableRef.current?.clientWidth, textAlign: 'center',
                        position: 'sticky', left: '0px'}}>
                        <span className="title">{t("table.no_data")}</span>
                    </div>
                </div>}
                {/**Rows */}
                {tableWrapper.getRowModel().rows.map(row =><Fragment key={row.id}>
                    <div className={"table-row "
                        + (row.getIsSelected() || row.getIsSomeSelected() ? "row-selected" : "")
                        + " "
                        + (row.getCanSelect() ? "selectable" : "")} 
                        onClick={row.getToggleSelectedHandler()} onDoubleClick={row.getToggleExpandedHandler()}>
                            {row.getVisibleCells().map(cell =>
                                <div className={`table-cell ${cell.column.getIsPinned() ? "pinned" : ""}`} key={cell.id}
                                    style={{width: `var(--col-${cell.column.id}-size)`, ...getCommonPinningStyles(cell.column)}}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </div>
                            )}
                    </div>
                    {row.getIsExpanded() && getDetails && <div className="row-expanded">
                        {getDetails(row)}
                    </div>}
                </Fragment>
                )}
            </div>
        </div>
        {enablePagination && <div className="table-pages horizontal-list gap-4mm">
            <div className="spacer"></div>
            <Button className="page-change page-arrow" disabled={!tableWrapper.getCanPreviousPage()}
                iconName={ICONS.ARROW_BACK} onClick={tableWrapper.previousPage}></Button>
            {getCountArray(pagination.pageIndex, 5, 0, tableWrapper.getPageCount()).map((i)=><Button key={i}
                className={`page-change ${pagination.pageIndex == i ? "selected" : ""}`} 
                onClick={()=>tableWrapper.setPageIndex(i)}
                disabled={pagination.pageIndex == i}>{i+1}
            </Button>)}
            <Button className="page-change page-arrow" disabled={!tableWrapper.getCanNextPage()}
                iconName={ICONS.ARROW_FORWARD} onClick={tableWrapper.nextPage}></Button>
            <div className="spacer"></div>
        </div>}
    </div>
}