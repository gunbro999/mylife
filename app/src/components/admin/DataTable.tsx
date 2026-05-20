'use client';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: string;
  emptyText?: string;
  onRowClick?: (item: T) => void;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyField,
  emptyText = '暂无数据',
  onRowClick,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm text-text-tertiary">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-xs font-medium text-text-tertiary"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={String(item[keyField])}
              onClick={() => onRowClick?.(item)}
              className={cn(
                'border-b border-border/50 transition-colors',
                onRowClick && 'cursor-pointer hover:bg-bg-secondary'
              )}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn('px-4 py-3 text-sm text-text-primary', col.className)}
                >
                  {col.render ? col.render(item) : String(item[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ');
}
