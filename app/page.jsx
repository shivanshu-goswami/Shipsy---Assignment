"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full">
        <div className="text-center text-white mb-8">
          <h1 className="text-5xl font-bold mb-4">Expensify</h1>
          <p className="text-xl mb-8">Track and manage your expenses with ease</p>
        </div>

        <div className="bg-white rounded-lg shadow-2xl p-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Features</h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-gray-700">Track expenses by category</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-gray-700">Automatic tax calculations</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-gray-700">Reimbursement tracking</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-gray-700">Secure authentication</span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Get Started</h2>
              <p className="text-gray-600 mb-6">
                Manage your expenses efficiently with our easy-to-use platform.
              </p>
              
              <div className="space-y-3">
                <Link
                  href="/login"
                  className="block w-full bg-indigo-600 text-white text-center py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Login to Your Account
                </Link>
                
                <Link
                  href="/register"
                  className="block w-full bg-white text-indigo-600 text-center py-3 px-6 rounded-lg border-2 border-indigo-600 hover:bg-indigo-50 transition-colors font-medium"
                >
                  Create New Account
                </Link>
              </div>

              <p className="text-sm text-gray-500 text-center mt-4">
                Categories: Food • Travel • Office • Other
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-white text-sm">
          <p>© 2025 Expensify. Built with Next.js, Prisma & PostgreSQL</p>
        </div>
      </div>
    </div>
  );
}
