import { useState } from 'react';
import { authService } from '../../../../services/authService';
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      if (isLogin) {
        // Login
        const user = authService.login(
          { username: formData.username, password: formData.password }, 
          rememberMe
        );
        
        if (user) {
          const duration = rememberMe ? '7 days' : '30 minutes';
          toast.success(`Selamat datang, ${user.name}! Session: ${duration}`);
          onLoginSuccess(user);
        } else {
          toast.error('Username atau password salah!');
        }
      } else {
        // Register
        if (!agreePrivacy || !agreeTerms) {
          toast.error('Anda harus menyetujui Kebijakan Privasi dan Syarat & Ketentuan');
          setIsLoading(false);
          return;
        }

        if (registerFormData.password.length < 8) {
          toast.error('Password minimal 8 karakter');
          setIsLoading(false);
          return;
        }
        
        console.log('Register data:', registerFormData);
        toast.success('Akun berhasil dibuat! Silakan login.');
        setIsLogin(true);
        setRegisterFormData({ first_name: '', last_name: '', user_name: '', email: '', password: '' });
        setAgreePrivacy(false);
        setAgreeTerms(false);
      }
      
      setIsLoading(false);
    }, 500);
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

