import { motion } from 'framer-motion';
import { Input } from '../../../../components/ui/input';
import { Button } from '../../../../components/ui/button';
import { Label } from '../../../../components/ui/label';
import { Lock, Mail } from 'lucide-react';
import type { LoginFormProps } from '../types/auth.types';

export function LoginForm({ 
  formData, 
  isLoading, 
  rememberMe, 
  onFormChange, 
  onRememberMeChange, 
  onSubmit 
}: LoginFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-2 sm:space-y-3 md:space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="space-y-1 sm:space-y-1.5"
      >
        <Label htmlFor="username" className="text-[10px] sm:text-xs md:text-sm" style={{ color: '#1e1e1e' }}>
          Username atau Email
        </Label>
        <div className="relative group">
          <Mail
            className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors"
            size={14}
          />
          <Input
            id="username"
            name="username"
            type="text"
            placeholder="Masukkan username atau email"
            value={formData.username}
            onChange={onFormChange}
            required
            autoFocus
            className="pl-7 sm:pl-8 md:pl-9 h-8 sm:h-9 md:h-10 text-[10px] sm:text-xs md:text-sm border-gray-200 rounded-md transition-all bg-gray-50/50 focus:bg-white"
            style={{
              borderColor: '#e5e5e5',
            }}
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="space-y-1 sm:space-y-1.5"
      >
        <Label htmlFor="password" className="text-[10px] sm:text-xs md:text-sm" style={{ color: '#1e1e1e' }}>
          Password
        </Label>
        <div className="relative group">
          <Lock
            className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors"
            size={14}
          />
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Masukkan password"
            value={formData.password}
            onChange={onFormChange}
            required
            className="pl-7 sm:pl-8 md:pl-9 h-8 sm:h-9 md:h-10 text-[10px] sm:text-xs md:text-sm border-gray-200 rounded-md transition-all bg-gray-50/50 focus:bg-white"
            style={{
              borderColor: '#e5e5e5',
            }}
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <label className="flex items-center gap-1 sm:gap-1.5 cursor-pointer group">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => onRememberMeChange(e.target.checked)}
            className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded border-gray-300 transition-all"
            style={{ accentColor: '#b91c1c' }}
          />
          <span className="text-gray-600 group-hover:text-gray-900 transition-colors text-[10px] sm:text-xs md:text-sm">
            Ingat saya
          </span>
        </label>
        <a 
          href="#" 
          className="text-gray-600 transition-colors relative group text-[10px] sm:text-xs md:text-sm cursor-pointer"
          style={{
            color: '#6b7280',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#b91c1c'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
        >
          Lupa password?
        </a>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.4 }}
        className="pt-1 sm:pt-2 md:pt-3"
      >
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-8 sm:h-9 md:h-10 text-[10px] sm:text-xs md:text-sm text-white rounded-md relative overflow-hidden group transition-all duration-300"
          style={{ 
            background: 'linear-gradient(135deg, #991b1b 0%, #b91c1c 50%, #dc2626 100%)',
            boxShadow: '0 4px 20px rgba(185, 28, 28, 0.3)',
          }}
        >
          <span className="relative z-10">
            {isLoading ? 'Loading...' : 'Masuk ke Sistem'}
          </span>
        </Button>
      </motion.div>
      {import.meta.env.DEV && (
        <p className="text-[10px] text-gray-400 mt-2 text-center">
          Demo PM: diana@dskglobal.com / demo123
        </p>
      )}
    </form>
  );
}

