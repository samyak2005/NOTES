import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const { login, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      toast.success('Welcome back! 🎉');
      router.push('/');
    } else {
      toast.error(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200 flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-40 left-40 w-60 h-60 bg-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8 animate-bounce-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
            NotesApp
          </h1>
          <p className="text-orange-600 mt-2 font-medium">Your digital workspace</p>
        </div>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 animate-slide-up">
          {/* Toggle Buttons */}
          <div className="flex bg-orange-100 rounded-2xl p-1 mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                isLogin 
                  ? 'bg-white text-orange-600 shadow-lg transform scale-105' 
                  : 'text-orange-500 hover:text-orange-600'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                !isLogin 
                  ? 'bg-white text-orange-600 shadow-lg transform scale-105' 
                  : 'text-orange-500 hover:text-orange-600'
              }`}
            >
              Register
            </button>
          </div>

          {isLogin ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-4 bg-orange-50 border-2 border-orange-200 rounded-2xl focus:border-orange-500 focus:outline-none transition-all duration-300 text-gray-700 placeholder-gray-500"
                    placeholder="Enter your email"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-4 bg-orange-50 border-2 border-orange-200 rounded-2xl focus:border-orange-500 focus:outline-none transition-all duration-300 text-gray-700 placeholder-gray-500"
                    placeholder="Enter your password"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Registration Coming Soon!</h3>
              <p className="text-gray-500">Use the test accounts below to explore the app</p>
            </div>
          )}

          {/* Test Accounts */}
          <div className="mt-8 p-6 bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl border border-orange-200">
            <h3 className="text-sm font-semibold text-orange-800 mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Test Accounts
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2 bg-white/50 rounded-lg">
                <span className="text-orange-700 font-medium">admin@acme.test</span>
                <span className="text-orange-600 bg-orange-200 px-2 py-1 rounded-full">Admin</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white/50 rounded-lg">
                <span className="text-orange-700 font-medium">user@acme.test</span>
                <span className="text-orange-600 bg-orange-200 px-2 py-1 rounded-full">Member</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white/50 rounded-lg">
                <span className="text-orange-700 font-medium">admin@globex.test</span>
                <span className="text-orange-600 bg-orange-200 px-2 py-1 rounded-full">Admin</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white/50 rounded-lg">
                <span className="text-orange-700 font-medium">user@globex.test</span>
                <span className="text-orange-600 bg-orange-200 px-2 py-1 rounded-full">Member</span>
              </div>
              <div className="text-center mt-3 p-2 bg-orange-200 rounded-lg">
                <span className="text-orange-800 font-semibold">Password: password</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-orange-600 animate-fade-in">
          <p className="text-sm">Multi-tenant SaaS Notes Application</p>
        </div>
      </div>
    </div>
  );
}
