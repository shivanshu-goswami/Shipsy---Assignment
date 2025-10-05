// ExpenseFilters.jsx - Reusable filtering component
"use client";
import { useState, useEffect } from 'react';

export default function ExpenseFilters({ 
  onFiltersChange, 
  initialFilters = {} 
}) {
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    payment_status: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    ...initialFilters
  });

  // Notify parent component when filters change
  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      category: '',
      payment_status: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
    setFilters(clearedFilters);
  };

  return (
    <div className="bg-white/95 backdrop-blur-md shadow-lg rounded-2xl p-6 border border-white/20 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <span className="text-xl mr-2">🔍</span>
          Filter & Search Expenses
        </h3>
        <button
          onClick={clearFilters}
          className="px-4 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200"
        >
          🗑️ Clear All
        </button>
      </div>

      <div className="space-y-4">
        {/* Search Bar */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            📝 Search Description
          </label>
          <input
            type="text"
            id="search"
            placeholder="Search by description..."
            className="w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-100 sm:text-sm px-4 py-3 text-gray-900 bg-white/80 hover:bg-white transition-all duration-200"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>

        {/* Filter Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Category Filter */}
          <div>
            <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
              🏷️ Category
            </label>
            <select
              id="category"
              className="w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-100 sm:text-sm px-4 py-3 text-gray-900 bg-white/80 hover:bg-white cursor-pointer transition-all duration-200"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Food">🍔 Food</option>
              <option value="Travel">✈️ Travel</option>
              <option value="Office">🏢 Office</option>
              <option value="Other">📦 Other</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div>
            <label htmlFor="payment_status" className="block text-sm font-semibold text-gray-700 mb-2">
              💳 Payment Status
            </label>
            <select
              id="payment_status"
              className="w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-100 sm:text-sm px-4 py-3 text-gray-900 bg-white/80 hover:bg-white cursor-pointer transition-all duration-200"
              value={filters.payment_status}
              onChange={(e) => handleFilterChange('payment_status', e.target.value)}
            >
              <option value="">All Status</option>
              <option value="Paid">✅ Paid</option>
              <option value="Pending">⏳ Pending</option>
              <option value="Reimbursable">💰 Reimbursable</option>
              <option value="Recurring">🔄 Recurring</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label htmlFor="sortBy" className="block text-sm font-semibold text-gray-700 mb-2">
              🔄 Sort By
            </label>
            <select
              id="sortBy"
              className="w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-100 sm:text-sm px-4 py-3 text-gray-900 bg-white/80 hover:bg-white cursor-pointer transition-all duration-200"
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            >
              <option value="createdAt">📅 Date Created</option>
              <option value="base_amount">💵 Base Amount</option>
              <option value="total_amount">💰 Total Amount</option>
              <option value="description">📝 Description</option>
              <option value="category">🏷️ Category</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label htmlFor="sortOrder" className="block text-sm font-semibold text-gray-700 mb-2">
              🔽 Order
            </label>
            <select
              id="sortOrder"
              className="w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-100 sm:text-sm px-4 py-3 text-gray-900 bg-white/80 hover:bg-white cursor-pointer transition-all duration-200"
              value={filters.sortOrder}
              onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
            >
              <option value="desc">⬇️ Descending (Newest/Highest First)</option>
              <option value="asc">⬆️ Ascending (Oldest/Lowest First)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      <div className="mt-4 flex flex-wrap gap-2">
        {filters.search && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            🔍 Search: "{filters.search}"
            <button
              onClick={() => handleFilterChange('search', '')}
              className="ml-1 text-blue-600 hover:text-blue-800"
            >
              ×
            </button>
          </span>
        )}
        {filters.category && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            🏷️ {filters.category}
            <button
              onClick={() => handleFilterChange('category', '')}
              className="ml-1 text-green-600 hover:text-green-800"
            >
              ×
            </button>
          </span>
        )}
        {filters.payment_status && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            💳 {filters.payment_status}
            <button
              onClick={() => handleFilterChange('payment_status', '')}
              className="ml-1 text-purple-600 hover:text-purple-800"
            >
              ×
            </button>
          </span>
        )}
      </div>
    </div>
  );
}
