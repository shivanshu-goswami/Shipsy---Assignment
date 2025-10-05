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
    <div className="min-h-screen animate-gradient-xy relative overflow-hidden" style={{background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 50%, #90CAF9 100%)'}}>
      {/* Animated background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob" style={{backgroundColor: '#BBDEFB'}}></div>
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000" style={{backgroundColor: '#B3E5FC'}}></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000" style={{backgroundColor: '#C5CAE9'}}></div>
      
      {/* Content wrapper with backdrop */}
      <div className="relative z-10 min-h-screen backdrop-blur-sm bg-white/5 animate-fadeIn">
      {/* Header */}
      <header className="backdrop-blur-xl shadow-xl border-b border-white/40 sticky top-0 z-50" style={{backgroundColor: 'rgba(144, 202, 249, 0.25)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div className="animate-slideIn">
            <h1 className="text-3xl font-bold drop-shadow-sm" style={{color: '#1565C0'}}>💰 Expense Dashboard</h1>
            <p className="text-sm mt-1 font-medium" style={{color: '#1976D2'}}>Manage and track your expenses effortlessly</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => router.push('/profile')}
              className="px-6 py-2.5 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 transform hover:scale-105 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              style={{background: 'linear-gradient(135deg, #42A5F5 0%, #1976D2 100%)'}}
            >
              📊 Profile
            </button>
            <button
              onClick={handleLogout}
              className="px-6 py-2.5 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 transform hover:scale-105 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              style={{background: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)'}}
              onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)'}
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
            <div className="backdrop-blur-xl bg-white/95 shadow-lg rounded-2xl p-8 border transition-all duration-300 hover:shadow-xl" style={{borderColor: 'rgba(144, 202, 249, 0.5)'}}>
              <h2 className="text-xl font-bold bg-gradient-to-r from-teal-700 to-cyan-700 bg-clip-text text-transparent mb-6 flex items-center drop-shadow">
                <span className="text-2xl mr-3">{currentExpense ? '✏️' : '➕'}</span>
                {currentExpense ? 'Edit Expense' : 'Create New Expense'}
              </h2>
              
              {/* Include a form for creating/editing expenses. */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
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
                    <option value="Recurring">🔄 Recurring (Subscription)</option>
                  </select>
                </div>

                {/* Confirmation Checkbox */}
                <div className="flex items-center p-4 rounded-xl border-2 transition-all duration-200" style={{borderColor: formData.isConfirmed ? '#90CAF9' : '#E0E0E0', backgroundColor: formData.isConfirmed ? 'rgba(187, 222, 251, 0.1)' : 'rgba(0, 0, 0, 0.02)'}}>
                  <input
                    type="checkbox"
                    id="isConfirmed"
                    className="h-5 w-5 rounded-lg cursor-pointer transition-all duration-200"
                    style={{accentColor: '#1976D2'}}
                    checked={formData.isConfirmed}
                    onChange={(e) => setFormData({ ...formData, isConfirmed: e.target.checked })}
                  />
                  <label htmlFor="isConfirmed" className="ml-3 block text-sm font-semibold cursor-pointer" style={{color: formData.isConfirmed ? '#1565C0' : '#666666'}}>
                    ✅ Click here to confirm expense details before submission
                  </label>
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 transform hover:scale-105 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                  >
                    {currentExpense ? '💾 Update' : '➕ Create'} Expense
                  </button>
                  {currentExpense && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-xl hover:from-gray-500 hover:to-gray-600 transform hover:scale-105 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
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
            <div className="backdrop-blur-xl bg-white/95 shadow-lg rounded-2xl p-8 border transition-all duration-300 hover:shadow-xl" style={{borderColor: 'rgba(144, 202, 249, 0.5)'}}>
              <h2 className="text-xl font-bold bg-gradient-to-r from-teal-700 to-cyan-700 bg-clip-text text-transparent mb-6 flex items-center drop-shadow">
                <span className="text-2xl mr-3">📊</span>
                Your Expenses
              </h2>

              {/* Search, Filter, and Sort Controls */}
              <div className="mb-6 space-y-4">
                {/* Search Bar */}
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
                      setCurrentPage(1); // Reset to first page when searching
                    }}
                  />
                </div>

                {/* Filters and Sort Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Category Filter */}
                  <div>
                    <label htmlFor="filterCategory" className="block text-sm font-semibold text-gray-700 mb-2">
                      🏷️ Category
                    </label>
                    <select
                      id="filterCategory"
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

                  {/* Payment Status Filter */}
                  <div>
                    <label htmlFor="filterPaymentStatus" className="block text-sm font-semibold text-gray-700 mb-2">
                      💳 Payment Status
                    </label>
                    <select
                      id="filterPaymentStatus"
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
                      <option value="Recurring">🔄 Recurring (Subscription)</option>
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
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="createdAt">📅 Date</option>
                      <option value="base_amount">💵 Base Amount</option>
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
                <div className="mb-6 bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-xl shadow-lg animate-slideIn">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">⚠️</span>
                    <span className="font-semibold">{error}</span>
                  </div>
                </div>
              )}

              {successMessage && (
                <div className="mb-6 bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500 text-green-700 px-6 py-4 rounded-xl shadow-lg animate-slideIn">
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
                // Map over the expenses array to render a list or table.
                <div className="overflow-x-auto overflow-y-auto max-h-[600px] rounded-2xl shadow-lg animate-fadeIn" style={{border: '1px solid rgba(144, 202, 249, 0.6)'}}>
                  <table className="min-w-full divide-y divide-blue-100">
                    <thead className="sticky top-0 z-10" style={{background: 'linear-gradient(90deg, #BBDEFB 0%, #90CAF9 50%, #BBDEFB 100%)'}}>
                      <tr>
                        <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider" style={{color: '#0D47A1'}}>
                          📝 Description
                        </th>
                        <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider" style={{color: '#0D47A1'}}>
                          🏷️ Category
                        </th>
                        <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider" style={{color: '#0D47A1'}}>
                          💵 Base Amount
                        </th>
                        <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider" style={{color: '#0D47A1'}}>
                          📊 Tax Rate
                        </th>
                        <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider" style={{color: '#0D47A1'}}>
                          💰 Total Amount
                        </th>
                        <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider" style={{color: '#0D47A1'}}>
                          💳 Payment Status
                        </th>
                        <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider" style={{color: '#0D47A1'}}>
                          ⚙️ Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white/95 backdrop-blur-sm divide-y divide-blue-50">{/* For each expense, display its details (description, total_amount). */}
                      {expenses.map((expense) => (
                        <tr key={expense.id} className="transition-all duration-200 hover:bg-blue-50/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">{expense.description}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm" style={{background: 'linear-gradient(135deg, #BBDEFB 0%, #90CAF9 100%)', color: '#0D47A1'}}>
                              {expense.category === 'Food' && '🍔 '}
                              {expense.category === 'Travel' && '✈️ '}
                              {expense.category === 'Office' && '🏢 '}
                              {expense.category === 'Other' && '📦 '}
                              {expense.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                            ₹{expense.base_amount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className="font-medium">{(expense.tax_rate * 100).toFixed(0)}%</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className="font-bold text-indigo-600 text-base">
                              ₹{expense.total_amount.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {expense.payment_status === 'Paid' && (
                              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-green-100 to-green-200 text-green-800 shadow-sm">
                                ✅ Paid
                              </span>
                            )}
                            {expense.payment_status === 'Pending' && (
                              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 shadow-sm">
                                ⏳ Pending
                              </span>
                            )}
                            {expense.payment_status === 'Reimbursable' && (
                              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 shadow-sm">
                                💰 Reimbursable
                              </span>
                            )}
                            {expense.payment_status === 'Recurring' && (
                              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 shadow-sm">
                                🔄 Recurring
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            {/* Include 'Edit' and 'Delete' buttons for each expense. */}
                            <button
                              onClick={() => handleEdit(expense)}
                              className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200 font-semibold text-xs shadow-md hover:shadow-lg"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleDelete(expense.id)}
                              className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all duration-200 font-semibold text-xs shadow-md hover:shadow-lg"
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
              {pagination && (
                <div className="mt-8 flex items-center justify-between border-t-2 border-purple-100 pt-6 animate-fadeIn">
                  <div className="text-sm font-semibold text-gray-700 bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-2 rounded-xl">
                    📄 Showing page <span className="text-indigo-600">{pagination.currentPage}</span> of{' '}
                    <span className="text-purple-600">{pagination.totalPages}</span>
                    {' '}(<span className="text-pink-600">{pagination.totalExpenses}</span> total expenses)
                  </div>
                  {pagination.totalPages > 1 && (
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={!pagination.hasPrevPage}
                        className={`px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                          pagination.hasPrevPage
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 transform hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                        }`}
                      >
                        ⬅️ Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        disabled={!pagination.hasNextPage}
                        className={`px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                          pagination.hasNextPage
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                        }`}
                      >
                        Next ➡️
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      </div>
    </div>
  );
}
