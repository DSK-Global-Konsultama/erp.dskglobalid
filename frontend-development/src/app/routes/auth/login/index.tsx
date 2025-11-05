import { useState } from 'react';
import { authService, type User } from '../../../../services/authService';
import { toast } from 'sonner';
import { Mail, Lock } from 'lucide-react';
import { AuthLayout } from '../components/AuthLayout';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  onNavigateToRegister?: () => void;
}

export function LoginPage({ onLoginSuccess, onNavigateToRegister }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate loading delay
    setTimeout(() => {
      const user = authService.login({ username, password }, rememberMe);
      
      if (user) {
        const duration = rememberMe ? '7 days' : '30 minutes';
        toast.success(`Selamat datang, ${user.name}! Session: ${duration}`);
        onLoginSuccess(user);
      } else {
        toast.error('Username atau password salah!');
      }
      
      setIsLoading(false);
    }, 500);
  };

  return (
    <AuthLayout>
      {/* Heading */}
      <div className="text-center mb-3 sm:mb-4 md:mb-6 lg:mb-8">
        <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-gray-900 mb-1">Welcome Back!</h1>
        <p className="text-[10px] sm:text-xs md:text-sm text-gray-600">Enter your credentials to continue.</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-2.5 md:space-y-3 lg:space-y-4">
        {/* Email Input */}
        <div>
          <div className="relative">
            <Mail className="absolute left-2 sm:left-2.5 md:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Enter your email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
              className="w-full pl-8 sm:pl-9 md:pl-10 lg:pl-11 pr-2.5 sm:pr-3 md:pr-4 py-1.5 sm:py-2 md:py-2.5 lg:py-3 text-[11px] sm:text-xs md:text-sm lg:text-base border border-gray-300 rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Password Input */}
        <div>
          <div className="relative">
            <Lock className="absolute left-2 sm:left-2.5 md:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-gray-400" />
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-8 sm:pl-9 md:pl-10 lg:pl-11 pr-2.5 sm:pr-3 md:pr-4 py-1.5 sm:py-2 md:py-2.5 lg:py-3 text-[11px] sm:text-xs md:text-sm lg:text-base border border-gray-300 rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between gap-1.5 sm:gap-2">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 rounded border-gray-300 cursor-pointer accent-black"
              style={{
                accentColor: 'black'
              }}
            />
            <span className="ml-1 sm:ml-1.5 md:ml-2 text-[10px] sm:text-xs md:text-sm text-gray-700 whitespace-nowrap">Remember me</span>
          </label>
          <button type="button" className="text-[10px] sm:text-xs md:text-sm text-gray-700 hover:text-black transition-colors whitespace-nowrap">
            Forgot password?
          </button>
        </div>

        {/* Sign In Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-1.5 sm:py-2 md:py-2.5 lg:py-3 text-[11px] sm:text-xs md:text-sm lg:text-base bg-black text-white font-medium rounded-md sm:rounded-lg hover:bg-gray-800 transition-all transform active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Loading...' : 'Sign In'}
        </button>
      </form>

      {/* Social Login */}
      <div className="mt-2.5 sm:mt-3 md:mt-4 lg:mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-[10px] sm:text-xs md:text-sm">
            <span className="px-1.5 sm:px-2 bg-white text-gray-500">Or sign in with</span>
          </div>
        </div>

        <div className="mt-2.5 sm:mt-3 md:mt-4 lg:mt-6">
          <button
            type="button"
            className="w-full flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 lg:py-3 border border-gray-300 rounded-md sm:rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-all"
          >
            <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" viewBox="0 0 23 23" fill="none">
              <path d="M0 0h10.9091v10.9091H0V0z" fill="#F25022"/>
              <path d="M12.0909 0H23v10.9091H12.0909V0z" fill="#7FBA00"/>
              <path d="M0 12.0909h10.9091V23H0V12.0909z" fill="#00A4EF"/>
              <path d="M12.0909 12.0909H23V23H12.0909V12.0909z" fill="#FFB900"/>
            </svg>
            <span className="text-[11px] sm:text-xs md:text-sm lg:text-base font-medium">Microsoft</span>
          </button>
        </div>
      </div>

      {/* Create Account */}
      <p className="mt-3 sm:mt-4 md:mt-6 lg:mt-8 text-center text-[10px] sm:text-xs md:text-sm text-gray-600">
        Don't have an account?{' '}
        <button 
          type="button" 
          onClick={onNavigateToRegister}
          className="font-medium text-black hover:underline transition-all"
        >
          Create an account
        </button>
      </p>
    </AuthLayout>
  );
}

