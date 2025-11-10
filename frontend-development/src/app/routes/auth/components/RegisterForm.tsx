import { motion } from 'framer-motion';
import { Input } from '../../../../components/ui/input';
import { Button } from '../../../../components/ui/button';
import { Label } from '../../../../components/ui/label';
import { Lock, Mail, User } from 'lucide-react';
import type { RegisterFormProps } from '../types/auth.types';

interface ExtendedRegisterFormProps extends Omit<RegisterFormProps, 'formData'> {
  formData: {
    first_name: string;
    last_name: string;
    user_name: string;
    email: string;
    password: string;
  };
  agreePrivacy: boolean;
  agreeTerms: boolean;
  onPrivacyChange: (checked: boolean) => void;
  onTermsChange: (checked: boolean) => void;
}

export function RegisterForm({ 
  formData, 
  isLoading, 
  onFormChange,
  onSubmit,
  agreePrivacy,
  agreeTerms,
  onPrivacyChange,
  onTermsChange,
}: ExtendedRegisterFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-2 sm:space-y-3 md:space-y-4">
      {/* Grid: Nama Depan & Nama Belakang */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="space-y-1 sm:space-y-1.5"
        >
          <Label htmlFor="first_name" className="text-[10px] sm:text-xs md:text-sm" style={{ color: '#1e1e1e' }}>
            Nama Depan
          </Label>
          <div className="relative group">
            <User
              className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors"
              size={14}
            />
            <Input
              id="first_name"
              name="first_name"
              type="text"
              placeholder="Masukkan nama depan"
              value={formData.first_name}
              onChange={onFormChange}
              required
              autoFocus
              className="pl-7 sm:pl-8 md:pl-9 h-8 sm:h-9 md:h-10 text-[10px] sm:text-xs md:text-sm border-gray-200 rounded-md transition-all bg-gray-50/50"
              style={{
                borderColor: '#e5e5e5',
              }}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4 }}
          className="space-y-1 sm:space-y-1.5"
        >
          <Label htmlFor="last_name" className="text-[10px] sm:text-xs md:text-sm" style={{ color: '#1e1e1e' }}>
            Nama Belakang
          </Label>
          <div className="relative group">
            <User
              className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors"
              size={14}
            />
            <Input
              id="last_name"
              name="last_name"
              type="text"
              placeholder="Masukkan nama belakang"
              value={formData.last_name}
              onChange={onFormChange}
              required
              className="pl-7 sm:pl-8 md:pl-9 h-8 sm:h-9 md:h-10 text-[10px] sm:text-xs md:text-sm border-gray-200 rounded-md transition-all bg-gray-50/50"
              style={{
                borderColor: '#e5e5e5',
              }}
            />
          </div>
        </motion.div>
      </div>

      {/* Nama Pengguna */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="space-y-1 sm:space-y-1.5"
      >
        <Label htmlFor="user_name" className="text-[10px] sm:text-xs md:text-sm" style={{ color: '#1e1e1e' }}>
          Nama Pengguna
        </Label>
        <div className="relative group">
          <User
            className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors"
            size={14}
          />
          <Input
            id="user_name"
            name="user_name"
            type="text"
            placeholder="Masukkan nama pengguna"
            value={formData.user_name}
            onChange={onFormChange}
            required
            className="pl-7 sm:pl-8 md:pl-9 h-8 sm:h-9 md:h-10 text-[10px] sm:text-xs md:text-sm border-gray-200 rounded-md transition-all bg-gray-50/50 focus:bg-white"
            style={{
              borderColor: '#e5e5e5',
            }}
          />
        </div>
      </motion.div>

      {/* Email */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.4 }}
        className="space-y-1 sm:space-y-1.5"
      >
        <Label htmlFor="email" className="text-[10px] sm:text-xs md:text-sm" style={{ color: '#1e1e1e' }}>
          Email
        </Label>
        <div className="relative group">
          <Mail
            className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors"
            size={14}
          />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Masukkan email"
            value={formData.email}
            onChange={onFormChange}
            required
            className="pl-7 sm:pl-8 md:pl-9 h-8 sm:h-9 md:h-10 text-[10px] sm:text-xs md:text-sm border-gray-200 rounded-md transition-all bg-gray-50/50 focus:bg-white"
            style={{
              borderColor: '#e5e5e5',
            }}
          />
        </div>
      </motion.div>

      {/* Password */}
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
            placeholder="Masukkan kata sandi"
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

      {/* Checkboxes */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.65, duration: 0.4 }}
        className="space-y-2"
      >
        <div className="flex items-start">
          <input
            type="checkbox"
            checked={agreePrivacy}
            onChange={(e) => onPrivacyChange(e.target.checked)}
            className="w-3 h-3 sm:w-3.5 sm:h-3.5 mt-0.5 rounded border-gray-300 transition-all cursor-pointer"
            style={{ accentColor: '#b91c1c' }}
          />
          <label className="pl-2 text-[10px] sm:text-xs md:text-sm text-gray-700 cursor-pointer" onClick={() => onPrivacyChange(!agreePrivacy)}>
            Saya setuju dengan{' '}
            <a
              href="/privacy-policy"
              className="font-medium hover:underline cursor-pointer"
              style={{ color: '#b91c1c' }}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              Kebijakan Privasi
            </a>
          </label>
        </div>

        <div className="flex items-start">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => onTermsChange(e.target.checked)}
            className="w-3 h-3 sm:w-3.5 sm:h-3.5 mt-0.5 rounded border-gray-300 transition-all cursor-pointer"
            style={{ accentColor: '#b91c1c' }}
          />
          <label className="pl-2 text-[10px] sm:text-xs md:text-sm text-gray-700 cursor-pointer" onClick={() => onTermsChange(!agreeTerms)}>
            Saya setuju dengan{' '}
            <a
              href="/terms-and-conditions"
              className="font-medium hover:underline cursor-pointer"
              style={{ color: '#b91c1c' }}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              Syarat dan Ketentuan
            </a>
          </label>
        </div>

        {(!agreePrivacy || !agreeTerms) && (
          <p className="text-red-500 text-[9px] sm:text-[10px] md:text-xs">
            * Anda harus menyetujui Kebijakan Privasi dan Syarat & Ketentuan
          </p>
        )}
      </motion.div>

      {/* Submit Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.4 }}
        className="pt-1 sm:pt-2 md:pt-3"
      >
        <Button
          type="submit"
          disabled={isLoading || !agreePrivacy || !agreeTerms}
          className="w-full h-8 sm:h-9 md:h-10 text-[10px] sm:text-xs md:text-sm text-white rounded-md relative overflow-hidden group transition-all duration-300"
          style={{ 
            background: 'linear-gradient(135deg, #991b1b 0%, #b91c1c 50%, #dc2626 100%)',
            boxShadow: '0 4px 20px rgba(185, 28, 28, 0.3)',
          }}
        >
          <span className="relative z-10">
            {isLoading ? 'Loading...' : 'Daftar'}
          </span>
        </Button>
      </motion.div>
    </form>
  );
}
