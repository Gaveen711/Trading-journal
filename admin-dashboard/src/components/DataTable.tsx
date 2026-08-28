import type { CSSProperties, ReactNode } from 'react'
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react'
import { EmptyState, LoadingState } from './States'
import { cx } from './utils'

export type SortDirection = 'asc' | 'desc'

export interface DataColumn<T> {
  key: string
  header: ReactNode
  cell: (row: T, index: number) => ReactNode
  align?: 'start' | 'center' | 'end'
  numeric?: boolean
  sortable?: boolean
  width?: CSSProperties['width']
  hideBelow?: 'sm' | 'md' | 'lg'
}

export interface DataTableProps<T> {
  columns: DataColumn<T>[]
  rows: T[]
  getRowKey: (row: T, index: number) => string | number
  caption: string
  loading?: boolean
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: ReactNode
  sortKey?: string
  sortDirection?: SortDirection
  onSort?: (key: string, direction: SortDirection) => void
  className?: string
}

export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  caption,
  loading = false,
  emptyTitle = 'No records found',
  emptyDescription = 'Try adjusting the filters or create the first record.',
  emptyAction,
  sortKey,
  sortDirection = 'asc',
  onSort,
  className,
}: DataTableProps<T>) {
  const sortIcon = (column: DataColumn<T>) => {
    if (sortKey !== column.key) return <ChevronsUpDown aria-hidden="true" />
    return sortDirection === 'asc' ? <ArrowUp aria-hidden="true" /> : <ArrowDown aria-hidden="true" />
  }

  return (
    <div className={cx('admin-table-wrap', className)}>
      <table className="admin-table">
        <caption className="admin-sr-only">{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                style={column.width ? { width: column.width } : undefined}
                className={cx(
                  `admin-table__cell--${column.align || (column.numeric ? 'end' : 'start')}`,
                  column.hideBelow && `admin-table__hide-${column.hideBelow}`,
                )}
                aria-sort={sortKey === column.key ? (sortDirection === 'asc' ? 'ascending' : 'descending') : undefined}
              >
                {column.sortable && onSort ? (
                  <button
                    type="button"
                    className="admin-table__sort"
                    onClick={() => onSort(column.key, sortKey === column.key && sortDirection === 'asc' ? 'desc' : 'asc')}
                  >
                    <span>{column.header}</span>
                    {sortIcon(column)}
                  </button>
                ) : column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {!loading && rows.map((row, rowIndex) => (
            <tr key={getRowKey(row, rowIndex)}>
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cx(
                    `admin-table__cell--${column.align || (column.numeric ? 'end' : 'start')}`,
                    column.numeric && 'admin-table__numeric',
                    column.hideBelow && `admin-table__hide-${column.hideBelow}`,
                  )}
                >
                  {column.cell(row, rowIndex)}
                </td>
              ))}
            </tr>
          ))}
          {!loading && rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="admin-table__state-cell">
                <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} compact />
              </td>
            </tr>
          )}
          {loading && (
            <tr>
              <td colSpan={columns.length} className="admin-table__state-cell">
                <LoadingState label={`Loading ${caption.toLowerCase()}`} rows={4} compact />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

