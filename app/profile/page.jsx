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
    recentExpenses: [],
    monthlyTrend: []
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
      // By category
      byCategory[expense.category] = (byCategory[expense.category] || 0) + expense.total_amount;
      
      // By payment status
      const status = expense.payment_status || (expense.is_reimbursed ? 'Paid' : 'Pending');
      byPaymentStatus[status] = (byPaymentStatus[status] || 0) + expense.total_amount;
      
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

  const getCategoryIcon = (category) => {
    const icons = {
      'Food': '🍔',
      'Travel': '✈️',
      'Office': '🏢',
      'Other': '📦'
    };
    return icons[category] || '📦';
  };

  const getStatusColor = (status) => {
    const colors = {
      'Paid': { bg: 'linear-gradient(135deg, #A8E6CF 0%, #7DD3C0 100%)', text: '#0D5C4F' },
      'Pending': { bg: 'linear-gradient(135deg, #FFE5B4 0%, #FFD700 100%)', text: '#8B6F00' },
      'Reimbursable': { bg: 'linear-gradient(135deg, #BBDEFB 0%, #90CAF9 100%)', text: '#0D47A1' },
      'Recurring': { bg: 'linear-gradient(135deg, #E1BEE7 0%, #BA68C8 100%)', text: '#4A148C' }
    };
    return colors[status] || colors['Pending'];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 50%, #90CAF9 100%)'}}>
        <div className="text-2xl font-bold" style={{color: '#1565C0'}}>Loading Profile...</div>
      </div>
    );
  }

  const categoryData = Object.entries(summary.byCategory);
  const statusData = Object.entries(summary.byPaymentStatus);
  const maxCategoryValue = Math.max(...categoryData.map(([, v]) => v), 1);
  const maxStatusValue = Math.max(...statusData.map(([, v]) => v), 1);

  return (
    <div className="min-h-screen animate-gradient-xy relative overflow-hidden" style={{background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 50%, #90CAF9 100%)'}}>
      {/* Animated background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob" style={{backgroundColor: '#BBDEFB'}}></div>
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000" style={{backgroundColor: '#B3E5FC'}}></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000" style={{backgroundColor: '#C5CAE9'}}></div>

      {/* Content */}
      <div className="relative z-10 min-h-screen backdrop-blur-sm bg-white/5">
        {/* Header */}
        <header className="backdrop-blur-xl shadow-xl border-b border-white/40 sticky top-0 z-50" style={{backgroundColor: 'rgba(144, 202, 249, 0.25)'}}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
            <div className="animate-slideIn">
              <h1 className="text-3xl font-bold drop-shadow-sm" style={{color: '#1565C0'}}>📊 Profile Overview</h1>
              <p className="text-sm mt-1 font-medium" style={{color: '#1976D2'}}>Your expense analytics and insights</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-2.5 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 transform hover:scale-105 transition-all duration-200 font-medium shadow-lg"
                style={{background: 'linear-gradient(135deg, #42A5F5 0%, #1976D2 100%)'}}
              >
                📋 Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="px-6 py-2.5 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 transform hover:scale-105 transition-all duration-200 font-medium shadow-lg"
                style={{background: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)'}}
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* User Info Card */}
          <div className="mb-8 animate-fadeIn">
            <div className="backdrop-blur-xl bg-white/95 shadow-lg rounded-2xl p-8 border transition-all duration-300" style={{borderColor: 'rgba(144, 202, 249, 0.5)'}}>
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl" style={{background: 'linear-gradient(135deg, #42A5F5 0%, #1976D2 100%)'}}>
                  👤
                </div>
                <div>
                  <h2 className="text-2xl font-bold" style={{color: '#1565C0'}}>{user?.email}</h2>
                  <p className="text-gray-600">Member since {new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Expenses */}
            <div className="backdrop-blur-xl bg-white/95 shadow-lg rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl animate-scaleIn" style={{borderColor: 'rgba(144, 202, 249, 0.5)'}}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                  <p className="text-3xl font-bold mt-2" style={{color: '#1565C0'}}>{summary.totalExpenses}</p>
                </div>
                <div className="text-5xl">📝</div>
              </div>
            </div>

            {/* Total Amount */}
            <div className="backdrop-blur-xl bg-white/95 shadow-lg rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl animate-scaleIn animation-delay-2000" style={{borderColor: 'rgba(144, 202, 249, 0.5)'}}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Amount</p>
                  <p className="text-3xl font-bold mt-2" style={{color: '#1565C0'}}>₹{summary.totalAmount.toFixed(2)}</p>
                </div>
                <div className="text-5xl">💰</div>
              </div>
            </div>

            {/* Average per Expense */}
            <div className="backdrop-blur-xl bg-white/95 shadow-lg rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl animate-scaleIn animation-delay-4000" style={{borderColor: 'rgba(144, 202, 249, 0.5)'}}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Expense</p>
                  <p className="text-3xl font-bold mt-2" style={{color: '#1565C0'}}>
                    ₹{summary.totalExpenses > 0 ? (summary.totalAmount / summary.totalExpenses).toFixed(2) : '0.00'}
                  </p>
                </div>
                <div className="text-5xl">📊</div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Category Breakdown Chart */}
            <div className="backdrop-blur-xl bg-white/95 shadow-lg rounded-2xl p-8 border transition-all duration-300 hover:shadow-xl animate-fadeIn" style={{borderColor: 'rgba(144, 202, 249, 0.5)'}}>
              <h3 className="text-xl font-bold mb-6" style={{color: '#1565C0'}}>
                📊 Expenses by Category
              </h3>
              <div className="space-y-4">
                {categoryData.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No expenses yet</p>
                ) : (
                  categoryData.map(([category, amount]) => (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-700">
                          {getCategoryIcon(category)} {category}
                        </span>
                        <span className="font-bold" style={{color: '#1565C0'}}>
                          ₹{amount.toFixed(2)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div
                          className="h-4 rounded-full transition-all duration-500"
                          style={{
                            width: `${(amount / maxCategoryValue) * 100}%`,
                            background: 'linear-gradient(90deg, #42A5F5 0%, #1976D2 100%)'
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500">
                        {((amount / summary.totalAmount) * 100).toFixed(1)}% of total
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Payment Status Chart */}
            <div className="backdrop-blur-xl bg-white/95 shadow-lg rounded-2xl p-8 border transition-all duration-300 hover:shadow-xl animate-fadeIn" style={{borderColor: 'rgba(144, 202, 249, 0.5)'}}>
              <h3 className="text-xl font-bold mb-6" style={{color: '#1565C0'}}>
                💳 Payment Status Overview
              </h3>
              <div className="space-y-4">
                {statusData.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No expenses yet</p>
                ) : (
                  statusData.map(([status, amount]) => {
                    const colors = getStatusColor(status);
                    return (
                      <div key={status} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-700">{status}</span>
                          <span className="font-bold" style={{color: colors.text}}>
                            ₹{amount.toFixed(2)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                          <div
                            className="h-4 rounded-full transition-all duration-500"
                            style={{
                              width: `${(amount / maxStatusValue) * 100}%`,
                              background: colors.bg
                            }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500">
                          {((amount / summary.totalAmount) * 100).toFixed(1)}% of total
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Recent Expenses */}
          <div className="backdrop-blur-xl bg-white/95 shadow-lg rounded-2xl p-8 border transition-all duration-300 hover:shadow-xl animate-fadeIn" style={{borderColor: 'rgba(144, 202, 249, 0.5)'}}>
            <h3 className="text-xl font-bold mb-6" style={{color: '#1565C0'}}>
              🕒 Recent Expenses
            </h3>
            {summary.recentExpenses.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No expenses yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="border-b-2" style={{borderColor: '#90CAF9'}}>
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-bold" style={{color: '#0D47A1'}}>Description</th>
                      <th className="px-4 py-3 text-left text-sm font-bold" style={{color: '#0D47A1'}}>Category</th>
                      <th className="px-4 py-3 text-left text-sm font-bold" style={{color: '#0D47A1'}}>Amount</th>
                      <th className="px-4 py-3 text-left text-sm font-bold" style={{color: '#0D47A1'}}>Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {summary.recentExpenses.map((expense) => {
                      const status = expense.payment_status || (expense.is_reimbursed ? 'Paid' : 'Pending');
                      const colors = getStatusColor(status);
                      return (
                        <tr key={expense.id} className="hover:bg-blue-50/50 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{expense.description}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold" style={{background: 'rgba(187, 222, 251, 0.5)', color: '#0D47A1'}}>
                              {getCategoryIcon(expense.category)} {expense.category}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-bold" style={{color: '#1565C0'}}>
                            ₹{expense.total_amount.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold" style={{background: colors.bg, color: colors.text}}>
                              {status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
