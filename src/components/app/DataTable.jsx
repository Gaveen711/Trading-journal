import { Fragment } from 'react';
import { ChevronDownIcon, ChevronRightIcon } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from '../ui/table';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { cn } from '../../lib/utils';

const CELL_BASE = 'h-11 md:h-8 px-3 py-0 align-middle';

function hideClass(column) {
  if (column.hideBelow === 'md') return 'hidden md:table-cell';
  if (column.hideBelow === 'lg') return 'hidden lg:table-cell';
  return null;
}

function isEnd(column) {
  return column.numeric || column.align === 'end';
}

/**
 * DataTable — a real `<table>` at Console density. One density (32px rows
 * on desktop, 44px under 768px), always-sticky header, no zebra striping.
 *
 * @param {object} props
 * @param {Array<{
 *   id: string,
 *   header: React.ReactNode,
 *   cell: (row: any, index: number) => React.ReactNode,
 *   align?: 'start'|'end',
 *   numeric?: boolean,          // .figure + text-right; implies align 'end'
 *   width?: string,
 *   hideBelow?: 'md'|'lg',      // hidden md:table-cell / hidden lg:table-cell on th+td
 *   sortable?: boolean
 * }>} props.columns
 * @param {any[]} props.rows
 * @param {(row: any, index: number) => string} props.getRowId   REQUIRED.
 * @param {string} props.caption                                 REQUIRED. Visually hidden <caption>.
 * @param {React.ReactNode} [props.empty]                        Rendered in one cell spanning all columns.
 * @param {boolean} [props.loading=false]
 * @param {number} [props.skeletonRows=5]
 * @param {(row: any) => void} [props.onRowActivate]             Lands on a focusable element in the row — never on the <tr>.
 * @param {(row: any) => React.ReactNode} [props.renderExpanded]
 * @param {string|null} [props.expandedRowId]
 * @param {(id: string|null) => void} [props.onExpandedRowIdChange]
 * @param {{columnId: string, direction: 'asc'|'desc'}|null} [props.sort]
 * @param {(next: {columnId: string, direction: 'asc'|'desc'}) => void} [props.onSortChange]
 * @param {string} [props.className]
 */
export function DataTable({
  columns,
  rows,
  getRowId,
  caption,
  empty,
  loading = false,
  skeletonRows = 5,
  onRowActivate,
  renderExpanded,
  expandedRowId = null,
  onExpandedRowIdChange,
  sort = null,
  onSortChange,
  className,
}) {
  const hasExpander = typeof renderExpanded === 'function';
  const colCount = columns.length + (hasExpander ? 1 : 0);

  const nextSort = (columnId) => {
    const current = sort && sort.columnId === columnId ? sort.direction : null;
    return { columnId, direction: current === 'asc' ? 'desc' : 'asc' };
  };

  return (
    <Table className={cn('text-xs', className)}>
      <TableCaption className="sr-only">{caption}</TableCaption>
      <TableHeader className="sticky top-0 z-10 bg-muted [&_tr]:border-b-border">
        <TableRow className="hover:bg-muted">
          {hasExpander && (
            <TableHead className="h-7 w-8 px-3 text-xs font-medium text-muted-foreground">
              <span className="sr-only">Row details</span>
            </TableHead>
          )}
          {columns.map((column) => {
            const sorted = sort != null && sort.columnId === column.id;
            return (
              <TableHead
                key={column.id}
                style={column.width ? { width: column.width } : undefined}
                aria-sort={
                  sorted ? (sort.direction === 'asc' ? 'ascending' : 'descending') : undefined
                }
                className={cn(
                  'h-7 px-3 text-left text-xs font-medium text-muted-foreground',
                  isEnd(column) && 'text-right',
                  hideClass(column)
                )}
              >
                {column.sortable ? (
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
                    onClick={() => onSortChange?.(nextSort(column.id))}
                  >
                    {column.header}
                    {sorted && (
                      // Arrows, not carets: ▲/▼ belong exclusively to trade
                      // direction in this system.
                      <span aria-hidden="true">{sort.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                ) : (
                  column.header
                )}
              </TableHead>
            );
          })}
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading &&
          Array.from({ length: skeletonRows }, (_, index) => (
            <TableRow key={`skeleton-${index}`} className="hover:bg-transparent">
              {hasExpander && <TableCell className={cn(CELL_BASE, 'w-8')} />}
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  className={cn(CELL_BASE, hideClass(column))}
                >
                  <Skeleton className="h-3 w-full max-w-24" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        {!loading && rows.length === 0 && empty != null && (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={colCount} className="p-0">
              {empty}
            </TableCell>
          </TableRow>
        )}
        {!loading &&
          rows.map((row, index) => {
            const rowId = getRowId(row, index);
            const expanded = hasExpander && expandedRowId === rowId;
            const detailId = `${rowId}-detail`;
            return (
              <Fragment key={rowId}>
                <TableRow className={onRowActivate ? 'hover:bg-muted' : 'hover:bg-transparent'}>
                  {hasExpander && (
                    <TableCell className={cn(CELL_BASE, 'w-8')}>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        aria-expanded={expanded}
                        aria-controls={expanded ? detailId : undefined}
                        aria-label={expanded ? 'Hide row details' : 'Show row details'}
                        onClick={() => onExpandedRowIdChange?.(expanded ? null : rowId)}
                      >
                        {expanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
                      </Button>
                    </TableCell>
                  )}
                  {columns.map((column, columnIndex) => {
                    const content = column.cell(row, index);
                    const inner = column.numeric ? (
                      <span className="figure">{content}</span>
                    ) : (
                      content
                    );
                    const body =
                      onRowActivate && columnIndex === 0 ? (
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 text-left"
                          onClick={() => onRowActivate(row)}
                        >
                          {inner}
                        </button>
                      ) : (
                        inner
                      );
                    return (
                      <TableCell
                        key={column.id}
                        className={cn(CELL_BASE, isEnd(column) && 'text-right', hideClass(column))}
                      >
                        {body}
                      </TableCell>
                    );
                  })}
                </TableRow>
                {expanded && (
                  <TableRow id={detailId} className="hover:bg-transparent">
                    <TableCell colSpan={colCount} className="p-0">
                      {renderExpanded(row)}
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            );
          })}
      </TableBody>
    </Table>
  );
}
