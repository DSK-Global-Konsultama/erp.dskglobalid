import type { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-white p-1.5 sm:p-2 md:p-3 lg:p-4 flex items-center justify-center">
      {/* Main Container Card */}
      <div className="w-full h-auto md:h-[calc(100vh-1.5rem)] lg:h-[calc(100vh-2rem)] max-w-7xl bg-white rounded-md sm:rounded-lg md:rounded-xl lg:rounded-2xl shadow-lg md:shadow-xl lg:shadow-2xl border border-gray-200 overflow-hidden">
        <div className="flex flex-col md:flex-row h-full min-h-[450px] sm:min-h-[500px]">
          {/* Left Side - Form Content */}
          <div className="w-full md:w-1/2 flex flex-col">
            <div className="flex-1 flex items-center justify-center p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10">
              <div className="w-full max-w-md">
                {children}
              </div>
            </div>

            {/* Footer */}
            <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 md:py-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-1.5 sm:gap-0">
                <p className="text-center sm:text-left text-[9px] sm:text-[10px] md:text-xs">©2024 DSK Global. All rights reserved.</p>
                <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 md:gap-2 lg:gap-3 text-[9px] sm:text-[10px] md:text-xs">
                  <button type="button" className="hover:text-gray-700 whitespace-nowrap">Privacy Policy</button>
                  <span>•</span>
                  <button type="button" className="hover:text-gray-700 whitespace-nowrap">Terms & Conditions</button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Dark Section (Visible on Tablet+) */}
          <div className="hidden md:block md:w-1/2 relative overflow-hidden" style={{ backgroundColor: '#1e1e1e' }}>
            {/* Decorative Dots Pattern */}
            <div 
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}
            />
            
            {/* Content */}
            <div className="relative h-full flex flex-col items-center justify-center p-6 md:p-8 lg:p-12 xl:p-16 text-white">
              <div className="text-center max-w-lg">
                <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 md:mb-4">ERP System</h2>
                <p className="text-base md:text-lg lg:text-xl text-gray-300 mb-1 md:mb-2">Business Development</p>
                <p className="text-base md:text-lg lg:text-xl text-gray-300">& Project Management</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

