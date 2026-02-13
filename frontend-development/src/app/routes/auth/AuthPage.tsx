import { motion } from 'framer-motion';
import { useAuthForm } from './hooks/useAuthForm';
import { AuthBackground } from './components/AuthBackground';
import { InfoPanel } from './components/InfoPanel';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import type { AuthPageProps } from './types/auth.types';
import { useEffect } from 'react';
import { authService } from '../../../services/authService';
import logo from '../../../assets/logodsk.png';

export function AuthPage({ onLoginSuccess }: AuthPageProps) {
  const {
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
  } = useAuthForm(onLoginSuccess);

  // Handle Microsoft login callback (?auth=success from backend redirect)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ok = params.get('auth');
    if (ok === 'success') {
      authService.finalizeMicrosoftLogin().then((user) => {
        if (user) {
          onLoginSuccess(user);
          // Setelah login berhasil, ganti URL dari /auth ke /
          const to = new URL(window.location.href);
          to.searchParams.delete('auth');
          to.pathname = '/';
          window.history.replaceState({}, '', to.toString());
        }
      });
      // Clean the query param from URL
      const url = new URL(window.location.href);
      url.searchParams.delete('auth');
      window.history.replaceState({}, '', url.toString());
    }
  }, [onLoginSuccess]);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#ffffff' }}>
      {/* Animated Background */}
      <AuthBackground />

      <div className="min-h-screen grid md:grid-cols-2 relative z-10">
            {/* Info Panel */}
            <InfoPanel isLogin={isLogin} />

            {/* Form Panel */}
            <motion.div
              layout
              transition={{ 
                layout: { duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }
              }}
              className="bg-white relative"
              style={{
                order: isLogin ? 1 : 2,
              }}
            >
              <div className="p-4 sm:p-6 md:p-8 lg:p-10 min-h-screen flex flex-col justify-center">
                <motion.div
                  key={isLogin ? 'form-login' : 'form-register'}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  {/* Mobile Logo */}
                  <div className="flex flex-col items-center mb-4 md:hidden">
                    <motion.div
                      className="inline-flex p-2 rounded-lg mb-2 relative"
                      style={{
                        background: 'rgba(185, 28, 28, 0.1)',
                        border: '1px solid rgba(185, 28, 28, 0.3)',
                      }}
                      animate={{
                        boxShadow: [
                          '0 0 15px rgba(185, 28, 28, 0.2)',
                          '0 0 30px rgba(185, 28, 28, 0.4)',
                          '0 0 15px rgba(185, 28, 28, 0.2)',
                        ],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    >
                      <img src={logo} alt="Logo" className="w-40 h-40 sm:w-48 sm:h-48 md:w-44 md:h-44" />
                    </motion.div>
                    
                    <p className="text-gray-500 text-[10px] sm:text-xs tracking-wider">
                      Enterprise Resource Planning System
                    </p>
                  </div>

                  {/* Header */}
                  <div className="mb-4 sm:mb-6 md:mb-8">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <motion.div
                        className="w-0.5 sm:w-1 h-5 sm:h-6 md:h-8 rounded-full"
                        style={{ background: 'linear-gradient(to bottom, #b91c1c, #dc2626)' }}
                        initial={{ height: 0 }}
                        animate={{ height: 32 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                      />
                      <h2 className="text-lg sm:text-xl md:text-2xl font-bold" style={{ color: '#1e1e1e' }}>
                        {isLogin ? 'Masuk' : 'Daftar'}
                      </h2>
                    </div>
                    <p className="text-gray-500 ml-2 sm:ml-3 text-[10px] sm:text-xs md:text-sm">
                      {isLogin ? 'Akses sistem ERP perusahaan Anda' : 'Buat akun untuk mengakses sistem'}
                    </p>
                  </div>

                  {/* Form - Login or Register */}
                  {isLogin ? (
                    <LoginForm 
                      formData={formData}
                      isLoading={isLoading}
                      rememberMe={rememberMe}
                      onFormChange={handleChange}
                      onRememberMeChange={setRememberMe}
                      onSubmit={handleSubmit}
                    />
                  ) : (
                    <RegisterForm 
                      formData={registerFormData}
                      isLoading={isLoading}
                      onFormChange={handleRegisterChange}
                      onSubmit={handleSubmit}
                      agreePrivacy={agreePrivacy}
                      agreeTerms={agreeTerms}
                      onPrivacyChange={setAgreePrivacy}
                      onTermsChange={setAgreeTerms}
                    />
                  )}

                  {/* Toggle Link */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.85, duration: 0.4 }}
                    className="text-center mt-3 sm:mt-4"
                  >
                    <p className="text-gray-600 text-[10px] sm:text-xs md:text-sm">
                      {isLogin ? 'Belum memiliki akun?' : 'Sudah memiliki akun?'}{' '}
                      <button
                        type="button"
                        onClick={toggleAuthMode}
                        className="transition-colors relative font-medium text-[10px] sm:text-xs md:text-sm cursor-pointer hover:underline"
                        style={{ color: '#b91c1c' }}
                      >
                        {isLogin ? 'Daftar di sini' : 'Masuk di sini'}
                      </button>
                    </p>
                  </motion.div>

                  {/* Divider */}
                  {/* <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9, duration: 0.4 }}
                    className="relative py-2 sm:py-3 mt-3 sm:mt-4"
                  >
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-white px-2 sm:px-3 text-gray-400 text-[10px] sm:text-xs">Atau masuk dengan</span>
                    </div>
                  </motion.div> */}

                  {/* Social Login */}
                  {/* <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 0.4 }}
                  >
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-8 sm:h-9 md:h-10 text-[10px] sm:text-xs md:text-sm border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 rounded-md"
                      onClick={() => authService.loginWithMicrosoftStart()}
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" viewBox="0 0 23 23" fill="none">
                        <path d="M0 0h10.9091v10.9091H0V0z" fill="#F25022"/>
                        <path d="M12.0909 0H23v10.9091H12.0909V0z" fill="#7FBA00"/>
                        <path d="M0 12.0909h10.9091V23H0V12.0909z" fill="#00A4EF"/>
                        <path d="M12.0909 12.0909H23V23H12.0909V12.0909z" fill="#FFB900"/>
                      </svg>
                      Login menggunakan Microsoft
                    </Button>
                  </motion.div> */}
                </motion.div>
              </div>

              {/* Decorative element */}
              <div 
                className="absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 opacity-5"
                style={{
                  background: 'radial-gradient(circle, #b91c1c 0%, transparent 70%)',
                }}
              />
            </motion.div>
      </div>
    </div>
  );
}
