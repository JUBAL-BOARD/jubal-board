import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react";

interface Props {
  currentPage: number;
  totalPages: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (val: number) => void;
}

const PageBtn: React.FC<{
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  children: React.ReactNode;
}> = ({ onClick, disabled, active, children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-7 h-7 lg:w-8 lg:h-8 rounded-md text-[12px] lg:text-[13px] flex items-center justify-center transition-colors
      ${active
        ? "bg-[#E85D3A] text-white font-bold border-none"
        : "bg-[#000145] text-white border border-gray-200"
      }
      ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
  >
    {children}
  </button>
);

const Pagination: React.FC<Props> = ({
  currentPage, totalPages, perPage,
  onPageChange, onPerPageChange,
}) => {
  const visiblePages = [1, 2, 3];

  return (
    <div className="flex flex-col lg:flex-row items-center gap-3 lg:gap-0 lg:justify-between mt-6 bg-[#fafafa] px-4 py-3">

      {/* Per page */}
      <div className="flex items-center gap-2 text-[12px] lg:text-[13px] text-gray-500">
        <span>Showing per page</span>
        <select
          value={perPage}
          onChange={(e) => onPerPageChange(Number(e.target.value))}
          className="border border-gray-200 rounded-md bg-[#000145] text-white px-2.5 py-1.5 text-[12px] lg:text-[13px] cursor-pointer outline-none"
        >
          {[10, 20, 50].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>

      {/* Page Controls */}
      <div className="flex items-center gap-1">

        {/* First */}
        <PageBtn onClick={() => onPageChange(1)} disabled={currentPage === 1}>
          <ChevronsLeft size={14} />
        </PageBtn>

        {/* Prev */}
        <PageBtn onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
          <ChevronLeft size={14} />
        </PageBtn>

        {/* Visible Pages */}
        {visiblePages.map((p) => (
          <PageBtn key={p} onClick={() => onPageChange(p)} active={currentPage === p}>
            {p}
          </PageBtn>
        ))}

        <span className="text-[13px] text-black px-1">...</span>

        {/* Last Page Number */}
        <PageBtn onClick={() => onPageChange(totalPages)} active={currentPage === totalPages}>
          {totalPages}
        </PageBtn>

        {/* Next */}
        <PageBtn onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
          <ChevronRight size={14} />
        </PageBtn>

        {/* Last */}
        <PageBtn onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages}>
          <ChevronsRight size={14} />
        </PageBtn>

      </div>
    </div>
  );
};

export default Pagination;