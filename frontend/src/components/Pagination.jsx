import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, prev, next, jump }) => {
  if (totalPages <= 1) return null;

  // Logic to show limited page numbers (e.g., 1, 2, 3 ... 10)
  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => jump(1)}
          className={`w-8 h-8 flex items-center justify-center rounded-md text-xs font-medium transition-colors ${
            currentPage === 1
              ? 'bg-cosmic-primary text-white'
              : 'text-cosmic-muted hover:bg-cosmic-card-hover hover:text-cosmic-text'
          }`}
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(<span key="ellipsis-start" className="text-cosmic-muted text-xs">...</span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => jump(i)}
          className={`w-8 h-8 flex items-center justify-center rounded-md text-xs font-medium transition-colors ${
            currentPage === i
              ? 'bg-cosmic-primary text-white shadow-md'
              : 'text-cosmic-muted hover:bg-cosmic-card-hover hover:text-cosmic-text'
          }`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="ellipsis-end" className="text-cosmic-muted text-xs">...</span>);
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => jump(totalPages)}
          className={`w-8 h-8 flex items-center justify-center rounded-md text-xs font-medium transition-colors ${
            currentPage === totalPages
              ? 'bg-cosmic-primary text-white shadow-md'
              : 'text-cosmic-muted hover:bg-cosmic-card-hover hover:text-cosmic-text'
          }`}
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-between mt-4 px-2">
      <div className="text-xs text-cosmic-muted font-medium">
        Page <span className="text-cosmic-text">{currentPage}</span> of <span className="text-cosmic-text">{totalPages}</span>
      </div>
      <div className="flex items-center space-x-1">
        <button
          onClick={prev}
          disabled={currentPage === 1}
          className="w-8 h-8 flex items-center justify-center rounded-md text-cosmic-muted hover:bg-cosmic-card-hover hover:text-cosmic-text disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        {renderPageNumbers()}
        <button
          onClick={next}
          disabled={currentPage === totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-md text-cosmic-muted hover:bg-cosmic-card-hover hover:text-cosmic-text disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
