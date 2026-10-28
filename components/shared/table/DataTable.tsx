import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ColumnDef, createSortedRowModel, flexRender, RowData, rowSortingFeature, SortingState, tableFeatures, useTable } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, MoreHorizontal, Search } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useRef, useState, useTransition } from "react";

interface DataTableActions<TData> {
    onView?: (data: TData) => void;
    onEdit?: (data: TData) => void;
    onDelete?: (data: TData) => void;
}

const features = tableFeatures({
    rowSortingFeature,
    sortedRowModel: createSortedRowModel(),
});

export type DataTableFeatures = typeof features;

interface DataTableSearchProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    debounceMs?: number;
}

const DataTableSearch = ({ value, onChange, placeholder, debounceMs = 400 }: DataTableSearchProps) => {
    const [searchValue, setSearchValue] = useState(value);
    const onChangeRef = useRef(onChange);
    const timeoutRef = useRef<number | null>(null);

    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
        return () => {
            if (timeoutRef.current !== null) {
                window.clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const handleSearchChange = (nextValue: string) => {
        setSearchValue(nextValue);

        if (timeoutRef.current !== null) {
            window.clearTimeout(timeoutRef.current);
        }

        const normalizedValue = nextValue.trim();
        if (normalizedValue === value) {
            timeoutRef.current = null;
            return;
        }

        timeoutRef.current = window.setTimeout(() => {
            onChangeRef.current(normalizedValue);
            timeoutRef.current = null;
        }, debounceMs);
    };

    return (
        <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
                type="search"
                value={searchValue}
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder={placeholder ?? "Search..."}
                aria-label={placeholder ?? "Search table"}
                className="pl-9"
            />
        </div>
    );
};

interface DataTableProps<TData extends RowData> {
    data: TData[];
    columns: ColumnDef<DataTableFeatures, TData>[];
    actions?: DataTableActions<TData>;
    emptyMessage?: string;
    isLoading?: boolean;
    sorting?: {
        state: SortingState;
        onSortingChange: (state: SortingState) => void;
    }
    pagination?: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
        onPageChange: (page: number) => void;
        onPageSizeChange: (pageSize: number) => void;
    }
    search?: {
        value: string;
        onChange: (value: string) => void;
        placeholder?: string;
        debounceMs?: number;
    }
    toolbar?: ReactNode;
}



const DataTable = <TData extends RowData,>({ data, columns, actions, emptyMessage, isLoading, sorting, pagination, search, toolbar }: DataTableProps<TData>) => {
    const [localSorting, setLocalSorting] = useState<SortingState>([]);
    const [isSorting, startTransition] = useTransition();

    const tableColumns: ColumnDef<DataTableFeatures, TData>[] = actions ? [...columns, {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: ({ row }) => {
            const rowData = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={<Button variant="ghost" className="h-8 w-8 p-0" aria-label="Open row actions" />}
                    >
                            <span className="sr-only">
                                Open Menu
                            </span>
                            <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">

                        {
                            actions.onView && (
                                <DropdownMenuItem onClick={() => actions.onView?.(rowData)}>View</DropdownMenuItem>
                            )
                        }

                        {
                            actions.onEdit && (
                                <DropdownMenuItem onClick={() => actions.onEdit?.(rowData)}>Edit</DropdownMenuItem>
                            )
                        }
                        {
                            actions.onDelete && (
                                <DropdownMenuItem onClick={() => actions.onDelete?.(rowData)}>Delete</DropdownMenuItem>
                            )
                        }

                    </DropdownMenuContent>

                </DropdownMenu>
            )
        }
    }] : columns;

    const table = useTable({
        features,
        columns: tableColumns,
        data,
        manualSorting: !!sorting,
        state: {
            sorting: sorting?.state ?? localSorting,
        },
        onSortingChange: (updater) => {
            const currentSortingState = sorting?.state ?? localSorting;
            const nextSortingState = typeof updater === "function" ? updater(currentSortingState) : updater;

            startTransition(() => {
                if (sorting) {
                    sorting.onSortingChange(nextSortingState);
                } else {
                    setLocalSorting(nextSortingState);
                }
            });
        },
    })

    const tableIsLoading = isLoading || isSorting;
    const paginationPages = pagination
        ? Array.from(
            { length: Math.min(5, pagination.totalPages) },
            (_, index) => {
                const firstPage = Math.max(
                    1,
                    Math.min(pagination.page - 2, pagination.totalPages - 4),
                );
                return firstPage + index;
            },
        )
        : [];
    const firstItem = pagination && pagination.total > 0
        ? (pagination.page - 1) * pagination.pageSize + 1
        : 0;
    const lastItem = pagination
        ? Math.min(pagination.page * pagination.pageSize, pagination.total)
        : 0;

    return (
        <div className="relative">

            {
                tableIsLoading && (
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />

                            <span className="text-sm text-muted-foreground">{isSorting ? "Sorting..." : "Loading..."}</span>

                        </div>

                    </div>
                )
            }

            {(search || toolbar) && (
                <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
                    {search && (
                        <DataTableSearch
                            key={search.value}
                            value={search.value}
                            onChange={search.onChange}
                            placeholder={search.placeholder}
                            debounceMs={search.debounceMs}
                        />
                    )}
                    {toolbar}
                </div>
            )}

            {/* table */}
            <div className="rounded-lg border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {
                                            header.isPlaceholder ? null : header.column.getCanSort() ? (
                                                <Button variant={"ghost"} className="h-auto cursor-pointer p-0 font-semibold hover:bg-transparent hover:text-inherit focus-visible:ring-0"
                                                    onClick={header.column.getToggleSortingHandler()}
                                                >
                                                    {
                                                        flexRender(header.column.columnDef.header,
                                                            header.getContext()
                                                        )}

                                                    {
                                                        header.column.getIsSorted() === "asc" ? (<ArrowUp className="ml-1 h-4 w-4" />) : header.column.getIsSorted() === "desc" ? (
                                                            <ArrowDown className="ml-1 h-4 w-4" />
                                                        ) : <ArrowUpDown className="ml-1 h-4 w-4 opacity-50" />
                                                    }

                                                </Button>
                                            ) : (
                                                flexRender(
                                                    header.column.columnDef.header
                                                    ,
                                                    header.getContext()
                                                )
                                            )
                                        }

                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>



                        {
                            table.getRowModel().rows.length ? (

                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id}>
                                        {row.getAllCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                <table.FlexRender cell={cell} />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={tableColumns.length} className="h-24 text-center" >
                                        {
                                            emptyMessage || "No data available"
                                        }
                                    </TableCell>
                                </TableRow>
                            )
                        }
                    </TableBody>
                </Table>
            </div>
            {pagination && (
                <div className="mt-4 flex flex-col gap-4 rounded-lg border bg-card px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-1 text-sm text-muted-foreground sm:flex-row sm:items-center sm:gap-3">
                        <span>
                            Showing <span className="font-medium text-foreground">{firstItem}–{lastItem}</span> of{" "}
                            <span className="font-medium text-foreground">{pagination.total}</span> items
                        </span>
                        <span className="hidden text-border sm:inline" aria-hidden="true">|</span>
                        <span>
                            Page <span className="font-medium text-foreground">{pagination.page}</span> of{" "}
                            <span className="font-medium text-foreground">{pagination.totalPages}</span>
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
                        <label className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="whitespace-nowrap">Rows per page</span>
                            <select
                                aria-label="Rows per page"
                                className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                value={pagination.pageSize}
                                onChange={(event) => pagination.onPageSizeChange(Number(event.target.value))}
                                disabled={tableIsLoading}
                            >
                                {[1, 10, 20, 50, 100].map((pageSize) => (
                                    <option key={pageSize} value={pageSize}>{pageSize}</option>
                                ))}
                            </select>
                        </label>

                        <nav className="flex items-center gap-1" aria-label="Table pagination">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => pagination.onPageChange(pagination.page - 1)}
                                disabled={pagination.page <= 1 || tableIsLoading}
                                aria-label="Go to previous page"
                            >
                                <ChevronLeft />
                                <span className="hidden sm:inline">Previous</span>
                            </Button>

                            {paginationPages.map((pageNumber) => (
                                <Button
                                    key={pageNumber}
                                    variant={pageNumber === pagination.page ? "default" : "outline"}
                                    size="icon"
                                    onClick={() => pagination.onPageChange(pageNumber)}
                                    disabled={tableIsLoading}
                                    aria-label={`Go to page ${pageNumber}`}
                                    aria-current={pageNumber === pagination.page ? "page" : undefined}
                                >
                                    {pageNumber}
                                </Button>
                            ))}

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => pagination.onPageChange(pagination.page + 1)}
                                disabled={pagination.page >= pagination.totalPages || tableIsLoading}
                                aria-label="Go to next page"
                            >
                                <span className="hidden sm:inline">Next</span>
                                <ChevronRight />
                            </Button>
                        </nav>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DataTable
