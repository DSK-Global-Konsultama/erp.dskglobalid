import { useState } from 'react';
import { authService } from '../../../../services/authService';
import { pendingUsersService } from '../../../../services/pendingUsersService';
import { toast } from 'sonner';
import type { AuthFormData, RegisterFormData } from '../types/auth.types';

export function useAuthForm(onLoginSuccess: (user: any) => void) {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  const [formData, setFormData] = useState<AuthFormData>({
    name: '',
    username: '',
    password: '',
  });

  const [registerFormData, setRegisterFormData] = useState<RegisterFormData>({
    first_name: '',
    last_name: '',
    user_name: '',
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterFormData({
      ...registerFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        // Login ke backend
        const user = await authService.login(
          { username: formData.username, password: formData.password },
          rememberMe
        );

        const duration = rememberMe ? '7 hari' : '30 menit';
        toast.success(`Selamat datang, ${user.name}! Session: ${duration}`);
        onLoginSuccess(user);
        return;
      }

      // Register (masih dummy/pending list)
      if (!agreePrivacy || !agreeTerms) {
        toast.error('Anda harus menyetujui Kebijakan Privasi dan Syarat & Ketentuan');
        return;
      }

      if (registerFormData.password.length < 8) {
        toast.error('Password minimal 8 karakter');
        return;
      }

      // Check if username or email already exists
      if (pendingUsersService.checkExists(registerFormData.user_name, registerFormData.email)) {
        toast.error('Username atau email sudah terdaftar!');
        return;
      }
      
      // Add to pending users (will be assigned role by IT)
      const fullName = `${registerFormData.first_name} ${registerFormData.last_name}`.trim();
      pendingUsersService.addPendingUser({
        username: registerFormData.user_name,
        firstName: registerFormData.first_name,
        lastName: registerFormData.last_name,
        name: fullName,
        email: registerFormData.email,
        password: registerFormData.password, // In real app, this should be hashed
      });
      
      toast.success('Registrasi berhasil! Akun Anda sedang menunggu approval dari IT untuk assign role.');
      setIsLogin(true);
      setRegisterFormData({ first_name: '', last_name: '', user_name: '', email: '', password: '' });
      setAgreePrivacy(false);
      setAgreeTerms(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan saat login';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setFormData({ name: '', username: '', password: '' });
    setRegisterFormData({ first_name: '', last_name: '', user_name: '', email: '', password: '' });
    setAgreePrivacy(false);
    setAgreeTerms(false);
  };

  return {
    isLogin,
    isLoading,
    rememberMe,
    formData,
    registerFormData,
    agreePrivacy,
    agreeTerms,
    handleChange,
    handleRegisterChange,
    handleSubmit,
    toggleAuthMode,
    setRememberMe,
    setAgreePrivacy,
    setAgreeTerms,
  };
}

