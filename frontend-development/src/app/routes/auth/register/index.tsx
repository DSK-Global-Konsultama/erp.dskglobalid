import { useState } from 'react';
import { toast } from 'sonner';
import { Mail, Lock, User } from 'lucide-react';
import { AuthLayout } from '../components/AuthLayout';

interface RegisterPageProps {
  onNavigateToLogin?: () => void;
}

export function RegisterPage({ onNavigateToLogin }: RegisterPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!acceptTerms) {
      toast.error('Please accept the Terms & Privacy Policy');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    // Simulate registration
    setTimeout(() => {
      toast.success('Account created successfully! Please login.');
      setIsLoading(false);
      onNavigateToLogin?.();
    }, 1000);
  };

  return (
    <AuthLayout>
      {/* Heading */}
      <div className="text-center mb-2 sm:mb-3 md:mb-4 lg:mb-6">
        <h1 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-gray-900 mb-0.5 sm:mb-1">Create Account</h1>
        <p className="text-[9px] sm:text-[10px] md:text-xs lg:text-sm text-gray-600">Sign up to get started.</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-1.5 sm:space-y-2 md:space-y-2.5 lg:space-y-3">
        {/* Name Input */}
        <div>
          <div className="relative">
            <User className="absolute left-2 sm:left-2.5 md:left-2.5 lg:left-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 lg:w-4.5 lg:h-4.5 text-gray-400" />
            <input
              type="text"
              name="name"
              placeholder="Full name"
              value={formData.name}
              onChange={handleChange}
              required
              autoFocus
              className="w-full pl-7 sm:pl-8 md:pl-9 lg:pl-10 pr-2 sm:pr-2.5 md:pr-3 lg:pr-4 py-1.5 sm:py-1.5 md:py-2 lg:py-2.5 text-[10px] sm:text-[11px] md:text-xs lg:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Email Input */}
        <div>
          <div className="relative">
            <Mail className="absolute left-2 sm:left-2.5 md:left-2.5 lg:left-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 lg:w-4.5 lg:h-4.5 text-gray-400" />
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full pl-7 sm:pl-8 md:pl-9 lg:pl-10 pr-2 sm:pr-2.5 md:pr-3 lg:pr-4 py-1.5 sm:py-1.5 md:py-2 lg:py-2.5 text-[10px] sm:text-[11px] md:text-xs lg:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Password Input */}
        <div>
          <div className="relative">
            <Lock className="absolute left-2 sm:left-2.5 md:left-2.5 lg:left-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 lg:w-4.5 lg:h-4.5 text-gray-400" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full pl-7 sm:pl-8 md:pl-9 lg:pl-10 pr-2 sm:pr-2.5 md:pr-3 lg:pr-4 py-1.5 sm:py-1.5 md:py-2 lg:py-2.5 text-[10px] sm:text-[11px] md:text-xs lg:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Confirm Password Input */}
        <div>
          <div className="relative">
            <Lock className="absolute left-2 sm:left-2.5 md:left-2.5 lg:left-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 lg:w-4.5 lg:h-4.5 text-gray-400" />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full pl-7 sm:pl-8 md:pl-9 lg:pl-10 pr-2 sm:pr-2.5 md:pr-3 lg:pr-4 py-1.5 sm:py-1.5 md:py-2 lg:py-2.5 text-[10px] sm:text-[11px] md:text-xs lg:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Password Requirements */}
        <div className="text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs text-gray-600">
          <p className="mb-0.5">Your password needs:</p>
          <div className="space-y-0.5">
            <div className="flex items-center gap-1">
              <div className={`w-1 h-1 rounded-full transition-colors ${formData.password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className={`transition-colors ${formData.password.length >= 8 ? 'text-green-600' : ''}`}>Min 8 characters</span>
            </div>
            <div className="flex items-center gap-1">
              <div className={`w-1 h-1 rounded-full transition-colors ${/\d/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className={`transition-colors ${/\d/.test(formData.password) ? 'text-green-600' : ''}`}>One number</span>
            </div>
          </div>
        </div>

        {/* Terms & Privacy */}
        <div className="flex items-start">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4 mt-0.5 rounded border-gray-300 cursor-pointer accent-black"
            style={{
              accentColor: 'black'
            }}
          />
          <span className="ml-1 sm:ml-1.5 text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs text-gray-700">
            I agree to <button type="button" className="text-black hover:underline transition-all">Terms & Privacy</button>
          </span>
        </div>

        {/* Sign Up Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-1.5 sm:py-1.5 md:py-2 lg:py-2.5 text-[10px] sm:text-[11px] md:text-xs lg:text-sm bg-black text-white font-medium rounded-md hover:bg-gray-800 transition-all transform active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating...' : 'SIGN ME UP!'}
        </button>
      </form>

      {/* Social Login */}
      <div className="mt-2 sm:mt-2.5 md:mt-3 lg:mt-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-[9px] sm:text-[10px] md:text-xs lg:text-sm">
            <span className="px-1.5 sm:px-2 bg-white text-gray-500">Or sign up with</span>
          </div>
        </div>

        <div className="mt-2 sm:mt-2.5 md:mt-3 lg:mt-4">
          <button
            type="button"
            className="w-full flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 md:px-3 lg:px-4 py-1.5 sm:py-1.5 md:py-2 lg:py-2.5 border border-gray-300 rounded-md hover:bg-gray-50 active:bg-gray-100 transition-all"
          >
            <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4" viewBox="0 0 23 23" fill="none">
              <path d="M0 0h10.9091v10.9091H0V0z" fill="#F25022"/>
              <path d="M12.0909 0H23v10.9091H12.0909V0z" fill="#7FBA00"/>
              <path d="M0 12.0909h10.9091V23H0V12.0909z" fill="#00A4EF"/>
              <path d="M12.0909 12.0909H23V23H12.0909V12.0909z" fill="#FFB900"/>
            </svg>
            <span className="text-[10px] sm:text-[11px] md:text-xs lg:text-sm font-medium">Microsoft</span>
          </button>
        </div>
      </div>

      {/* Login Link */}
      <p className="mt-2 sm:mt-3 md:mt-4 lg:mt-6 text-center text-[9px] sm:text-[10px] md:text-xs lg:text-sm text-gray-600">
        Already have an account?{' '}
        <button 
          type="button" 
          onClick={onNavigateToLogin}
          className="font-medium text-black hover:underline transition-all"
        >
          Log in
        </button>
      </p>
    </AuthLayout>
  );
}

