"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState({
    totalExpenses: 0,
    totalAmount: 0,
    byCategory: {},
    byPaymentStatus: {},
    recentExpenses: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Decode JWT to get user email
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser({ email: payload.email || 'User' });

      // Fetch all expenses for summary
      const response = await fetch('/api/expenses?limit=1000', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        calculateSummary(data.expenses);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setLoading(false);
    }
  };

  const calculateSummary = (expenses) => {
    const byCategory = {};
    const byPaymentStatus = {};
    let totalAmount = 0;

    expenses.forEach(expense => {
      // Category summary
      if (!byCategory[expense.category]) {
        byCategory[expense.category] = { count: 0, amount: 0 };
      }
      byCategory[expense.category].count++;
      byCategory[expense.category].amount += expense.total_amount;

      // Payment status summary
      if (!byPaymentStatus[expense.payment_status]) {
        byPaymentStatus[expense.payment_status] = { count: 0, amount: 0 };
      }
      byPaymentStatus[expense.payment_status].count++;
      byPaymentStatus[expense.payment_status].amount += expense.total_amount;

      totalAmount += expense.total_amount;
    });

    setSummary({
      totalExpenses: expenses.length,
      totalAmount,
      byCategory,
      byPaymentStatus,
      recentExpenses: expenses.slice(0, 5)
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
          <p className="mt-6 text-white font-semibold text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md shadow-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white drop-shadow-lg">👤 Profile Dashboard</h1>
            <p className="text-sm mt-1 text-white/80 font-medium">Your expense analytics and insights</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-2.5 text-white bg-white/20 rounded-xl hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transform hover:scale-105 transition-all duration-200 font-medium shadow-lg backdrop-blur-sm"
            >
              📊 Dashboard
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
          {/* User Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-white/95 backdrop-blur-md shadow-xl rounded-2xl p-8 border border-white/20">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="text-2xl mr-3">👤</span>
                User Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Email</label>
                  <p className="text-lg font-semibold text-gray-900">{user?.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Total Expenses</label>
                  <p className="text-2xl font-bold text-indigo-600">{summary.totalExpenses}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Total Amount Spent</label>
                  <p className="text-2xl font-bold text-green-600">₹{summary.totalAmount.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Section */}
          <div className="lg:col-span-2">
            <div className="bg-white/95 backdrop-blur-md shadow-xl rounded-2xl p-8 border border-white/20">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="text-2xl mr-3">📊</span>
                Expense Analytics
              </h2>

              {/* Category Breakdown */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">💼 By Category</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(summary.byCategory).map(([category, data]) => (
                    <div key={category} className="bg-gray-50 p-4 rounded-xl">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-700">
                          {category === 'Food' && '🍔 '}
                          {category === 'Travel' && '✈️ '}
                          {category === 'Office' && '🏢 '}
                          {category === 'Other' && '📦 '}
                          {category}
                        </span>
                        <span className="text-sm text-gray-500">{data.count} expenses</span>
                      </div>
                      <p className="text-lg font-bold text-indigo-600">₹{data.amount.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Status Breakdown */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">💳 By Payment Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(summary.byPaymentStatus).map(([status, data]) => (
                    <div key={status} className="bg-gray-50 p-4 rounded-xl">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-700">
                          {status === 'Paid' && '✅ '}
                          {status === 'Pending' && '⏳ '}
                          {status === 'Reimbursable' && '💰 '}
                          {status === 'Recurring' && '🔄 '}
                          {status}
                        </span>
                        <span className="text-sm text-gray-500">{data.count} expenses</span>
                      </div>
                      <p className="text-lg font-bold text-indigo-600">₹{data.amount.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Expenses */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">🕒 Recent Expenses</h3>
                {summary.recentExpenses.length > 0 ? (
                  <div className="space-y-3">
                    {summary.recentExpenses.map((expense) => (
                      <div key={expense.id} className="bg-gray-50 p-4 rounded-xl flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900">{expense.description}</p>
                          <p className="text-sm text-gray-500">
                            {expense.category === 'Food' && '🍔 '}
                            {expense.category === 'Travel' && '✈️ '}
                            {expense.category === 'Office' && '🏢 '}
                            {expense.category === 'Other' && '📦 '}
                            {expense.category} • {new Date(expense.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-indigo-600">₹{expense.total_amount.toFixed(2)}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            expense.payment_status === 'Paid' ? 'bg-green-100 text-green-800' :
                            expense.payment_status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            expense.payment_status === 'Reimbursable' ? 'bg-blue-100 text-blue-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {expense.payment_status === 'Paid' && '✅ '}
                            {expense.payment_status === 'Pending' && '⏳ '}
                            {expense.payment_status === 'Reimbursable' && '💰 '}
                            {expense.payment_status === 'Recurring' && '🔄 '}
                            {expense.payment_status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No expenses yet. Start tracking your expenses!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
