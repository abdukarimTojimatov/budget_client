// src/components/Pagination.jsx
import React from "react";

const Pagination = ({
  currentPage,
  totalPages,
  hasPrevPage,
  hasNextPage,
  onPageChange,
}) => {
  // Generate page numbers array
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5; // Maximum number of page buttons to show

    // If total pages is less than max visible, show all pages
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Otherwise show a subset with current page in the middle when possible
      let startPage = Math.max(
        1,
        currentPage - Math.floor(maxVisiblePages / 2)
      );
      let endPage = startPage + maxVisiblePages - 1;

      if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      // Add ellipsis indicators
      if (startPage > 1) {
        pageNumbers.unshift("...");
        pageNumbers.unshift(1);
      }

      if (endPage < totalPages) {
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  return (
    <div className="flex items-center justify-center space-x-2">
      {/* Previous button */}
      <button
        onClick={() => hasPrevPage && onPageChange(currentPage - 1)}
        disabled={!hasPrevPage}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          hasPrevPage
            ? "bg-blue-800/30 text-white hover:bg-blue-700/40"
            : "bg-gray-700/30 text-gray-400 cursor-not-allowed"
        }`}
      >
        &laquo; Oldingi
      </button>

      {/* Page numbers */}
      <div className="flex space-x-1.5">
        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === "number" && onPageChange(page)}
            disabled={typeof page !== "number"}
            className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
              page === currentPage
                ? "bg-blue-700/60 text-white"
                : typeof page === "number"
                ? "bg-gray-800/50 text-white hover:bg-gray-700/60"
                : "bg-transparent text-white cursor-default"
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      {/* Next button */}
      <button
        onClick={() => hasNextPage && onPageChange(currentPage + 1)}
        disabled={!hasNextPage}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          hasNextPage
            ? "bg-blue-800/30 text-white hover:bg-blue-700/40"
            : "bg-gray-700/30 text-gray-400 cursor-not-allowed"
        }`}
      >
        Keyingi &raquo;
      </button>
    </div>
  );
};

export default Pagination;
