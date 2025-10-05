"use client";
// Import useState from 'react' and the useRouter hook from 'next/navigation'.
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Create and export a default function for the LoginPage component.
export default function LoginPage() {
  // Use the useRouter hook to get the router object for redirection.
  const router = useRouter();
  
  // Create state variables for email, password, and any error messages.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Create an async function to handle form submission.
  const handleSubmit = async (e) => {
    // Inside the handler, prevent the default form submission.
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Make a POST request to '/api/auth/login' with the email and password.
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      // If the response is successful, get the token from the response body.
      if (response.ok) {
        // Save the token to localStorage.
        localStorage.setItem('token', data.token);
        
        // Redirect the user to the '/dashboard' page using router.push().
        router.push('/dashboard');
      } else {
        // If the response fails, set an error message in the state.
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Render a form with controlled inputs for email and password, a submit button, and a space to display error messages.
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 py-12 px-4 sm:px-6 lg:px-8 animate-fadeIn">
      <div className="max-w-md w-full space-y-8 animate-scaleIn">
        <div className="text-center">
          <h2 className="mt-6 text-5xl font-extrabold text-white drop-shadow-lg">
            💰 Expensify
          </h2>
          <p className="mt-3 text-xl text-white/90 font-medium">Sign in to your account</p>
        </div>
        <div className="backdrop-blur-md bg-white/95 rounded-2xl shadow-2xl p-10 border border-white/20">
          <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md space-y-4">
            <div>
              <label htmlFor="email-address" className="block text-sm font-semibold text-gray-700 mb-2">
                📧 Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-4 py-3 border-2 border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 sm:text-sm bg-white/80 hover:bg-white transition-all duration-200"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                🔒 Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none relative block w-full px-4 py-3 border-2 border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 sm:text-sm bg-white/80 hover:bg-white transition-all duration-200"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 p-4 animate-slideIn">
              <div className="flex items-center">
                <span className="text-2xl mr-3">⚠️</span>
                <h3 className="text-sm font-semibold text-red-800">{error}</h3>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 shadow-xl hover:shadow-2xl"
            >
              {loading ? '⏳ Signing in...' : '🔓 Sign in'}
            </button>
          </div>

          <div className="text-center">
            <a
              href="/register"
              className="font-semibold text-indigo-600 hover:text-purple-600 hover:underline transition-colors duration-200"
            >
              🆕 Don't have an account? Register here
            </a>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
