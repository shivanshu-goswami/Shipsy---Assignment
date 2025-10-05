// PaginationControls.jsx - Reusable pagination component
"use client";

export default function PaginationControls({ 
  pagination, 
  currentPage, 
  onPageChange 
}) {
  if (!pagination || pagination.totalPages <= 1) {
    return null;
  }

  const {
    totalExpenses,
    totalPages,
    limit,
    hasNextPage,
    hasPrevPage
  } = pagination;

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Smart pagination for many pages
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, currentPage + 2);
      
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) pages.push('...');
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="bg-white/95 backdrop-blur-md shadow-lg rounded-2xl p-6 border border-white/20 mt-6">
      <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
        {/* Pagination Info */}
        <div className="text-sm font-semibold text-gray-700 bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-2 rounded-xl">
          <span className="flex items-center">
            📄 Showing page{' '}
            <span className="mx-1 px-2 py-1 bg-indigo-100 text-indigo-700 rounded-lg">
              {currentPage}
            </span>
            of{' '}
            <span className="mx-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-lg">
              {totalPages}
            </span>
            ({' '}
            <span className="mx-1 px-2 py-1 bg-pink-100 text-pink-700 rounded-lg">
              {totalExpenses}
            </span>{' '}
            total expenses)
          </span>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center space-x-2">
          {/* Previous Button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!hasPrevPage}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center ${
              hasPrevPage
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 transform hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
            }`}
          >
            ⬅️ Previous
          </button>

          {/* Page Numbers */}
          <div className="flex items-center space-x-1">
            {pageNumbers.map((pageNum, index) => (
              <div key={index}>
                {pageNum === '...' ? (
                  <span className="px-3 py-2 text-gray-400">...</span>
                ) : (
                  <button
                    onClick={() => onPageChange(pageNum)}
                    className={`px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                      pageNum === currentPage
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                    }`}
                  >
                    {pageNum}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Next Button */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasNextPage}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center ${
              hasNextPage
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
            }`}
          >
            Next ➡️
          </button>
        </div>
      </div>

      {/* Quick Jump Controls */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
        {/* Items per page selector */}
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-600">
            📋 Items per page:
          </label>
          <select
            value={limit}
            onChange={(e) => {
              // Reset to page 1 when changing limit
              onPageChange(1, parseInt(e.target.value));
            }}
            className="px-3 py-1 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>

        {/* Quick Jump */}
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-600">
            🎯 Jump to page:
          </label>
          <input
            type="number"
            min="1"
            max={totalPages}
            placeholder={currentPage.toString()}
            className="w-16 px-2 py-1 rounded-lg border border-gray-300 text-sm text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                const page = parseInt(e.target.value);
                if (page >= 1 && page <= totalPages) {
                  onPageChange(page);
                  e.target.value = '';
                }
              }
            }}
          />
        </div>

        {/* First/Last buttons for many pages */}
        {totalPages > 10 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ⏮️ First
            </button>
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ⏭️ Last
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
