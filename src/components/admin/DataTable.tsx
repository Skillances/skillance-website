import React from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import EmptyState from './EmptyState';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  className?: string;
  render: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (item: T) => void;
  getRowClassName?: (item: T) => string | undefined;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  page?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number) => void;
}

function DataTable<T>({
  columns,
  data,
  isLoading = false,
  emptyTitle = 'No data found',
  emptyDescription,
  onRowClick,
  getRowClassName,
  sortKey,
  sortDirection,
  onSort,
  page = 1,
  pageSize = 20,
  total = 0,
  onPageChange,
}: DataTableProps<T>) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const showPagination = total > pageSize;

  const tableWrapperClass = "border border-neutral-100 dark:border-neutral-700 rounded-2xl overflow-hidden bg-white dark:bg-neutral-800/80 shadow-sm dark:shadow-[0_1px_0_0_rgba(255,255,255,0.06)]";
  const headerRowClass = "border-neutral-100 dark:border-neutral-700 hover:bg-transparent";
  const headCellClass = "text-neutral-400 dark:text-neutral-500 text-[10px] uppercase tracking-[0.2em] font-medium h-11 px-4";
  const bodyRowClass = cn(
    "border-neutral-50 dark:border-neutral-700/50 transition-colors",
    onRowClick && "cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700/50"
  );
  const cellClass = "text-neutral-600 dark:text-neutral-300 text-sm px-4 py-3";
  const sortIconClass = "h-3 w-3 text-black dark:text-white";
  const sortIconMutedClass = "h-3 w-3 opacity-30 text-black dark:text-white";

  if (isLoading) {
    return (
      <div className={tableWrapperClass}>
        <Table>
          <TableHeader>
            <TableRow className={headerRowClass}>
              {columns.map((col) => (
                <TableHead key={col.key} className={headCellClass}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i} className="border-neutral-50 dark:border-neutral-700/50">
                {columns.map((col) => (
                  <TableCell key={col.key} className="px-4 py-3">
                    <Skeleton className="h-4 w-full max-w-[120px] bg-neutral-100 dark:bg-neutral-700 rounded" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={tableWrapperClass}>
        <EmptyState title={emptyTitle} description={emptyDescription} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className={tableWrapperClass}>
        <Table>
          <TableHeader>
            <TableRow className={headerRowClass}>
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={cn(
                    headCellClass,
                    col.sortable && "cursor-pointer select-none hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors",
                    col.className
                  )}
                  onClick={col.sortable && onSort ? () => onSort(col.key) : undefined}
                >
                  <span className="flex items-center gap-1.5">
                    {col.header}
                    {col.sortable && (
                      sortKey === col.key
                        ? sortDirection === "asc"
                          ? <ArrowUp className={sortIconClass} />
                          : <ArrowDown className={sortIconClass} />
                        : <ArrowUpDown className={sortIconMutedClass} />
                    )}
                  </span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow
                key={index}
                className={cn(bodyRowClass, getRowClassName?.(item))}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
              >
                {columns.map((col) => (
                  <TableCell key={col.key} className={cn(cellClass, col.className)}>
                    {col.render(item)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {showPagination && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            Showing <span className="text-neutral-600 dark:text-neutral-300">{((page - 1) * pageSize) + 1}&#8211;{Math.min(page * pageSize, total)}</span> of <span className="text-neutral-600 dark:text-neutral-300">{total}</span>
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(page - 1)}
              disabled={page <= 1}
              className="h-8 w-8 p-0 bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-600 text-neutral-400 dark:text-neutral-500 hover:text-black dark:hover:text-white hover:border-neutral-300 dark:hover:border-neutral-500 rounded-lg disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs text-neutral-400 dark:text-neutral-500 min-w-[50px] text-center tabular-nums">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(page + 1)}
              disabled={page >= totalPages}
              className="h-8 w-8 p-0 bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-600 text-neutral-400 dark:text-neutral-500 hover:text-black dark:hover:text-white hover:border-neutral-300 dark:hover:border-neutral-500 rounded-lg disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
