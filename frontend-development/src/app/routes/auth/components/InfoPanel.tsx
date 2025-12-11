import { motion } from 'framer-motion';
import type { InfoPanelProps } from '../types/auth.types';
import logo from '../../../../assets/logodsk.png';

export function InfoPanel({ isLogin }: InfoPanelProps) {
  return (
    <motion.div
      layout
      transition={{ 
        layout: { duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }
      }}
      className="relative overflow-hidden hidden md:flex items-center justify-center w-full h-full"
      style={{ 
        backgroundColor: '#1e1e1e',
        order: isLogin ? 2 : 1,
      }}
    >

      <div className="p-4 sm:p-6 md:p-8 lg:p-10 min-h-[450px] sm:min-h-[500px] md:min-h-[550px] lg:min-h-[600px] flex flex-col justify-center items-center relative">
        
        <motion.div
          key={isLogin ? 'info-login' : 'info-register'}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center"
        >
          {/* Logo/Icon */}
          <motion.div
            className="inline-flex p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl mb-3 sm:mb-4 md:mb-6 relative"
            style={{
              background: 'rgba(185, 28, 28, 0.1)',
              border: '1px solid rgba(185, 28, 28, 0.3)',
            }}
            animate={{
              boxShadow: [
                '0 0 20px rgba(185, 28, 28, 0.2)',
                '0 0 40px rgba(185, 28, 28, 0.4)',
                '0 0 20px rgba(185, 28, 28, 0.2)',
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <img src={logo} alt="Logo" className="w-60 h-60 sm:w-72 sm:h-72 md:w-84 md:h-84" />
          </motion.div>

        </motion.div>

        {/* Floating particles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: '#dc2626',
              boxShadow: '0 0 10px rgba(220, 38, 38, 0.5)',
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0, 0.8, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Light flashes */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(220, 38, 38, 0.3) 0%, transparent 70%)',
            filter: 'blur(30px)',
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.6, 0.2],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-40 h-40 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(185, 28, 28, 0.3) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.7, 0.3],
            x: [0, -30, 0],
            y: [0, -40, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />

        {/* Subtle background pattern */}
        <div 
          className="absolute bottom-0 right-0 w-64 h-64 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle, #b91c1c 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
          }}
        />
      </div>
    </motion.div>
  );
}

