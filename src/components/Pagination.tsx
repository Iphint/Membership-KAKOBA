import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PaginationMeta } from "@/types";

interface PaginationProps {
  meta: PaginationMeta;
  itemLabel: string;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  meta,
  itemLabel,
  onPageChange,
}) => {
  const start = meta.totalItems === 0 ? 0 : (meta.currentPage - 1) * meta.perPage + 1;
  const end = Math.min(meta.currentPage * meta.perPage, meta.totalItems);

  return (
    <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
      <p className="text-xs text-slate-400">
        Showing {start}-{end} of {meta.totalItems} {itemLabel}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={!meta.hasPrevPage}
          onClick={() => onPageChange(meta.currentPage - 1)}
          className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-xs font-medium text-slate-500">
          Page {meta.currentPage} of {meta.totalPages}
        </span>
        <button
          type="button"
          disabled={!meta.hasNextPage}
          onClick={() => onPageChange(meta.currentPage + 1)}
          className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
