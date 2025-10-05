"use client";
// Import useState, useEffect, and useCallback from 'react'.
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// Create and export a default function for the DashboardPage component.
export default function DashboardPage() {
  const router = useRouter();
  
  // Create state variables for: a list of expenses, a loading state, the current expense being edited, and form data.
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentExpense, setCurrentExpense] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
    base_amount: '',
    tax_rate: '',
    category: 'Food',
    payment_status: 'Pending',
    isConfirmed: false
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Add filter, search, and sorting states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  // Create a useCallback function to fetch expenses from the API.
  const fetchExpenses = useCallback(async () => {
    try {
      // It should get the token from localStorage and set it in the Authorization header.
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/login');
        return;
      }

      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        sortBy,
        sortOrder
      });

      if (searchQuery) params.append('search', searchQuery);
      if (filterCategory) params.append('category', filterCategory);
      if (filterPaymentStatus) params.append('payment_status', filterPaymentStatus);

      // It should make a GET request to '/api/expenses'.
      const response = await fetch(`/api/expenses?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // On success, it should update the expenses state and set loading to false.
        setExpenses(data.expenses || []);
        setPagination(data.pagination);
        setLoading(false);
      } else if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        router.push('/login');
      } else {
        setError('Failed to fetch expenses');
        setLoading(false);
      }
    } catch (err) {
      setError('An error occurred while fetching expenses');
      setLoading(false);
    }
  }, [router, currentPage, searchQuery, filterCategory, filterPaymentStatus, sortBy, sortOrder]);

  // Use useEffect to call the fetchExpenses function when the component first mounts.
  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Create a handler function for form submission (to create or update an expense).
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Check if confirmation checkbox is checked
    if (!formData.isConfirmed) {
      setError('⚠️ Please check the confirmation box to proceed with expense submission');
      // Scroll to the checkbox
      const confirmCheckbox = document.getElementById('isConfirmed');
      if (confirmCheckbox) {
        confirmCheckbox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        confirmCheckbox.focus();
      }
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/login');
        return;
      }

      let response;

      // If an expense is being edited, it should make a PUT request to /api/expenses/[id].
      if (currentExpense) {
        response = await fetch(`/api/expenses/${currentExpense.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });
      } else {
        // Otherwise, it should make a POST request to '/api/expenses'.
        response = await fetch('/api/expenses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });
      }

      if (response.ok) {
        setSuccessMessage(currentExpense ? 'Expense updated successfully!' : 'Expense created successfully!');
        // After the request, it should refresh the expenses list and reset the form.
        await fetchExpenses();
        resetForm();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save expense');
      }
    } catch (err) {
      setError('An error occurred while saving the expense');
    }
  };

  // Create a handler function for deleting an expense.
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/login');
        return;
      }

      // It should make a DELETE request to /api/expenses/[id].
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok || response.status === 204) {
        setSuccessMessage('Expense deleted successfully!');
        // After deleting, it should call fetchExpenses again.
        await fetchExpenses();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete expense');
      }
    } catch (err) {
      setError('An error occurred while deleting the expense');
    }
  };

  // Create a handler function to populate the form when an 'Edit' button is clicked.
  const handleEdit = (expense) => {
    setCurrentExpense(expense);
    setFormData({
      description: expense.description,
      base_amount: expense.base_amount.toString(),
      tax_rate: expense.tax_rate.toString(),
      category: expense.category,
      payment_status: expense.payment_status,
      isConfirmed: false
    });
    setError('');
    setSuccessMessage('');
  };

  const resetForm = () => {
    setCurrentExpense(null);
    setFormData({
      description: '',
      base_amount: '',
      tax_rate: '',
      category: 'Food',
      payment_status: 'Pending',
      isConfirmed: false
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  // Render the main component UI.
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 animate-fadeIn">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md shadow-xl border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white drop-shadow-lg">💰 Expense Dashboard</h1>
            <p className="text-sm mt-1 text-white/80 font-medium">Manage and track your expenses effortlessly</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => router.push('/profile')}
              className="px-6 py-2.5 text-white bg-white/20 rounded-xl hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transform hover:scale-105 transition-all duration-200 font-medium shadow-lg backdrop-blur-sm"
            >
              📊 Profile
            </button>
            <button
              onClick={handleLogout}
              className="px-6 py-2.5 text-white bg-red-500/80 rounded-xl hover:bg-red-600/80 focus:outline-none focus:ring-2 focus:ring-red-300 transform hover:scale-105 transition-all duration-200 font-medium shadow-lg backdrop-blur-sm"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-1 animate-slideIn">
            <div className="bg-white/95 backdrop-blur-md shadow-xl rounded-2xl p-8 border border-white/20">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="text-2xl mr-3">{currentExpense ? '✏️' : '➕'}</span>
                {currentExpense ? 'Edit Expense' : 'Create New Expense'}
              </h2>
              
              {/* Include a form for creating/editing expenses. */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    📝 Description
                  </label>
                  <input
                    type="text"
                    id="description"
                    required
                    className="mt-1 block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 sm:text-sm px-4 py-3 text-gray-900 bg-white/80 hover:bg-white transition-all duration-200"
                    placeholder="Enter expense description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="base_amount" className="block text-sm font-semibold text-gray-700 mb-2">
                    💵 Base Amount (₹)
                  </label>
                  <input
                    type="number"
                    id="base_amount"
                    step="0.01"
                    required
                    className="mt-1 block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 sm:text-sm px-4 py-3 text-gray-900 bg-white/80 hover:bg-white transition-all duration-200"
                    placeholder="1000.00"
                    value={formData.base_amount}
                    onChange={(e) => setFormData({ ...formData, base_amount: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="tax_rate" className="block text-sm font-semibold text-gray-700 mb-2">
                    📊 Tax Rate (e.g., 0.18 for 18%)
                  </label>
                  <input
                    type="number"
                    id="tax_rate"
                    step="0.01"
                    min="0"
                    max="1"
                    required
                    className="mt-1 block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 sm:text-sm px-4 py-3 text-gray-900 bg-white/80 hover:bg-white transition-all duration-200"
                    placeholder="0.18"
                    value={formData.tax_rate}
                    onChange={(e) => setFormData({ ...formData, tax_rate: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
                    🏷️ Category
                  </label>
                  <select
                    id="category"
                    required
                    className="mt-1 block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 sm:text-sm px-4 py-3 text-gray-900 bg-white/80 hover:bg-white cursor-pointer transition-all duration-200"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Food">🍔 Food</option>
                    <option value="Travel">✈️ Travel</option>
                    <option value="Office">🏢 Office</option>
                    <option value="Other">📦 Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="payment_status" className="block text-sm font-semibold text-gray-700 mb-2">
                    💳 Payment Status
                  </label>
                  <select
                    id="payment_status"
                    required
                    className="mt-1 block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 sm:text-sm px-4 py-3 text-gray-900 bg-white/80 hover:bg-white cursor-pointer transition-all duration-200"
                    value={formData.payment_status}
                    onChange={(e) => setFormData({ ...formData, payment_status: e.target.value })}
                  >
                    <option value="Paid">✅ Paid</option>
                    <option value="Pending">⏳ Pending</option>
                    <option value="Reimbursable">💰 Reimbursable</option>
                    <option value="Recurring">🔄 Recurring</option>
                  </select>
                </div>

                {/* Confirmation Checkbox */}
                <div className="flex items-center p-4 rounded-xl border-2 transition-all duration-200" style={{borderColor: formData.isConfirmed ? '#6366f1' : '#E0E0E0', backgroundColor: formData.isConfirmed ? 'rgba(99, 102, 241, 0.1)' : 'rgba(0, 0, 0, 0.02)'}}>
                  <input
                    type="checkbox"
                    id="isConfirmed"
                    className="h-5 w-5 rounded-lg cursor-pointer transition-all duration-200"
                    style={{accentColor: '#6366f1'}}
                    checked={formData.isConfirmed}
                    onChange={(e) => setFormData({ ...formData, isConfirmed: e.target.checked })}
                  />
                  <label htmlFor="isConfirmed" className="ml-3 block text-sm font-semibold cursor-pointer" style={{color: formData.isConfirmed ? '#6366f1' : '#666666'}}>
                    ✅ Confirm expense details before submission
                  </label>
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 transform hover:scale-105 transition-all duration-200 font-semibold shadow-lg"
                  >
                    {currentExpense ? '💾 Update' : '➕ Create'} Expense
                  </button>
                  {currentExpense && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transform hover:scale-105 transition-all duration-200 font-semibold shadow-lg"
                    >
                      ❌ Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Expenses List Section */}
          <div className="lg:col-span-2 animate-scaleIn">
            <div className="bg-white/95 backdrop-blur-md shadow-xl rounded-2xl p-8 border border-white/20">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="text-2xl mr-3">📊</span>
                Your Expenses
              </h2>

              {/* Search and Filter Controls */}
              <div className="mb-6 space-y-4">
                <div>
                  <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                    🔍 Search Description
                  </label>
                  <input
                    type="text"
                    id="search"
                    placeholder="Search by description..."
                    className="w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-100 sm:text-sm px-4 py-3 text-gray-900 bg-white/80 hover:bg-white transition-all duration-200"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">🏷️ Category</label>
                    <select
                      className="w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-100 sm:text-sm px-4 py-3 text-gray-900 bg-white/80 hover:bg-white cursor-pointer transition-all duration-200"
                      value={filterCategory}
                      onChange={(e) => {
                        setFilterCategory(e.target.value);
                        setCurrentPage(1);
                      }}
                    >
                      <option value="">All Categories</option>
                      <option value="Food">🍔 Food</option>
                      <option value="Travel">✈️ Travel</option>
                      <option value="Office">🏢 Office</option>
                      <option value="Other">📦 Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">💳 Payment Status</label>
                    <select
                      className="w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-100 sm:text-sm px-4 py-3 text-gray-900 bg-white/80 hover:bg-white cursor-pointer transition-all duration-200"
                      value={filterPaymentStatus}
                      onChange={(e) => {
                        setFilterPaymentStatus(e.target.value);
                        setCurrentPage(1);
                      }}
                    >
                      <option value="">All Status</option>
                      <option value="Paid">✅ Paid</option>
                      <option value="Pending">⏳ Pending</option>
                      <option value="Reimbursable">💰 Reimbursable</option>
                      <option value="Recurring">🔄 Recurring</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">🔄 Sort By</label>
                    <select
                      className="w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-100 sm:text-sm px-4 py-3 text-gray-900 bg-white/80 hover:bg-white cursor-pointer transition-all duration-200"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="createdAt">📅 Date</option>
                      <option value="base_amount">💵 Amount</option>
                      <option value="description">📝 Description</option>
                      <option value="category">🏷️ Category</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">🔽 Order</label>
                    <select
                      className="w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-100 sm:text-sm px-4 py-3 text-gray-900 bg-white/80 hover:bg-white cursor-pointer transition-all duration-200"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                    >
                      <option value="desc">⬇️ Descending</option>
                      <option value="asc">⬆️ Ascending</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Display success and error messages */}
              {error && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-xl shadow-lg animate-slideIn">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">⚠️</span>
                    <span className="font-semibold">{error}</span>
                  </div>
                </div>
              )}

              {successMessage && (
                <div className="mb-6 bg-green-50 border-l-4 border-green-500 text-green-700 px-6 py-4 rounded-xl shadow-lg animate-slideIn">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">✅</span>
                    <span className="font-semibold">{successMessage}</span>
                  </div>
                </div>
              )}

              {/* Display a "Loading..." message based on the loading state. */}
              {loading ? (
                <div className="text-center py-16 animate-fadeIn">
                  <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
                  <p className="mt-6 text-gray-700 font-semibold text-lg">Loading your expenses...</p>
                </div>
              ) : expenses.length === 0 ? (
                <div className="text-center py-16 animate-scaleIn">
                  <p className="text-7xl mb-6">📭</p>
                  <p className="text-gray-600 text-xl font-semibold">No expenses yet.</p>
                  <p className="text-gray-400 mt-3 text-base">Create your first expense to get started!</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl shadow-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tax Rate</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {expenses.map((expense) => (
                        <tr key={expense.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{expense.description}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {expense.category === 'Food' && '🍔 '}
                              {expense.category === 'Travel' && '✈️ '}
                              {expense.category === 'Office' && '🏢 '}
                              {expense.category === 'Other' && '📦 '}
                              {expense.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₹{expense.base_amount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {(expense.tax_rate * 100).toFixed(0)}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                            ₹{expense.total_amount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {expense.payment_status === 'Paid' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">✅ Paid</span>
                            )}
                            {expense.payment_status === 'Pending' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">⏳ Pending</span>
                            )}
                            {expense.payment_status === 'Reimbursable' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">💰 Reimbursable</span>
                            )}
                            {expense.payment_status === 'Recurring' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">🔄 Recurring</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => handleEdit(expense)}
                              className="text-indigo-600 hover:text-indigo-900 bg-indigo-100 hover:bg-indigo-200 px-3 py-1 rounded-lg transition-all duration-200"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleDelete(expense.id)}
                              className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-lg transition-all duration-200"
                            >
                              🗑️ Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination Controls */}
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalExpenses} total expenses)
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={!pagination.hasPrevPage}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        pagination.hasPrevPage
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      ⬅️ Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      disabled={!pagination.hasNextPage}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        pagination.hasNextPage
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Next ➡️
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
