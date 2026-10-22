import { ArrowDownUp } from "lucide-react";
import { cx } from "../../lib/cx.js";

/**
 * A plain table with optional sortable headers and row clicks.
 *
 * columns: { key, header, width, align, sortable, render(row) }
 */
export function DataTable({ columns, rows, getRowKey, onRowClick, sort, onSortChange, minWidth = 640, empty }) {
  if (!rows.length && empty) return empty;

  return (
    <div className="scrollbar-thin overflow-x-auto">
      <table className="w-full text-left text-[13px]" style={{ minWidth }}>
        <thead>
          <tr className="border-b border-line bg-sunken/40">
            {columns.map((col) => {
              const active = sort?.key === col.key;
              return (
                <th
                  key={col.key}
                  scope="col"
                  style={col.width ? { width: col.width } : undefined}
                  className={cx(
                    "px-4 py-2.5 text-[11.5px] font-medium uppercase tracking-wide text-faint",
                    col.align === "right" && "text-right"
                  )}
                  aria-sort={active ? (sort.direction === 1 ? "ascending" : "descending") : "none"}
                >
                  {col.sortable && onSortChange ? (
                    <button
                      type="button"
                      onClick={() =>
                        onSortChange({ key: col.key, direction: active && sort.direction === 1 ? -1 : 1 })
                      }
                      className={cx(
                        "inline-flex items-center gap-1 transition-colors hover:text-ink",
                        active && "text-ink"
                      )}
                    >
                      {col.header}
                      <ArrowDownUp className="h-3 w-3" aria-hidden />
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row, index) => (
            <tr
              key={getRowKey ? getRowKey(row) : index}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cx("transition-colors", onRowClick && "cursor-pointer hover:bg-sunken/50")}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cx("px-4 py-3 align-middle text-muted", col.align === "right" && "text-right")}
                >
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
