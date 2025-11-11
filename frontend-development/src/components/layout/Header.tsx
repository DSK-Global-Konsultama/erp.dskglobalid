import { Bell } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

type UserRole = 'BOD' | 'BD-Content' | 'BD-Executive' | 'PM' | 'Admin' | 'ITSpecialist' | 'Staff';

interface HeaderProps {
  role: UserRole;
  userName?: string;
  activeNav?: string;
}

export function Header({ role, userName, activeNav = 'dashboard' }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount] = useState(3); // Placeholder for notification count
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const getDashboardTitle = () => {
    switch (role) {
      case 'BOD':
        if (activeNav === 'dashboard') {
          return 'Dashboard BOD';
        } else if (activeNav === 'leads') {
          return 'All Leads';
        } else if (activeNav === 'deals') {
          return 'All Deals';
        } else if (activeNav === 'projects') {
          return 'Project Management';
        } else if (activeNav === 'invoices') {
          return 'Invoice Management';
        } else if (activeNav === 'ticketing') {
          return 'IT Ticketing';
        } else if (activeNav === 'reimburse') {
          return 'Reimburse';
        }
        return 'Dashboard BOD';
      case 'BD-Content':
        if (activeNav === 'ticketing') {
          return 'IT Ticketing';
        } else if (activeNav === 'reimburse') {
          return 'Reimburse';
        }
        return 'Input Leads';
      case 'BD-Executive':
        if (activeNav === 'leads') {
          return 'Available Leads';
        } else if (activeNav === 'deals') {
          return 'My Deals';
        } else if (activeNav === 'ticketing') {
          return 'IT Ticketing';
        } else if (activeNav === 'reimburse') {
          return 'Reimburse';
        }
        return 'Available Leads';
      case 'PM':
        if (activeNav === 'ticketing') {
          return 'IT Ticketing';
        } else if (activeNav === 'reimburse') {
          return 'Reimburse';
        }
        return `PM Dashboard - ${userName || 'Project Manager'}`;
      case 'Admin':
        if (activeNav === 'ticketing') {
          return 'IT Ticketing';
        } else if (activeNav === 'reimburse') {
          return 'Reimburse';
        }
        return 'Admin Dashboard';
      case 'ITSpecialist':
        if (activeNav === 'dashboard') {
          return 'Dashboard IT';
        } else if (activeNav === 'leads') {
          return 'All Leads';
        } else if (activeNav === 'deals') {
          return 'All Deals';
        } else if (activeNav === 'projects') {
          return 'Project Management';
        } else if (activeNav === 'invoices') {
          return 'Invoice Management';
        } else if (activeNav === 'ticketing') {
          return 'IT Ticketing';
        } else if (activeNav === 'reimburse') {
          return 'Reimburse Management';
        } else if (activeNav === 'user-account') {
          return 'User Account Management';
        } else if (activeNav === 'settings') {
          return 'System Settings';
        }
        return 'Dashboard IT';
      case 'Staff':
        return 'Menunggu Persetujuan';
      default:
        return 'Dashboard';
    }
  };

  const getDashboardSubtitle = () => {
    switch (role) {
      case 'BOD':
        if (activeNav === 'dashboard') {
          return 'Monitoring Business Development & Project Management';
        } else if (activeNav === 'leads') {
          return 'Monitor semua leads dari berbagai sumber';
        } else if (activeNav === 'deals') {
          return 'Monitor semua deals';
        } else if (activeNav === 'projects') {
          return 'BOD assign PM, PM assign Consultant untuk setiap project';
        } else if (activeNav === 'invoices') {
          return 'Kelola payment schedule yang flexible (50-50%, 50-35-15%, dll)';
        } else if (activeNav === 'ticketing') {
          return 'Request bantuan atau fitur baru dari tim IT';
        } else if (activeNav === 'reimburse') {
          return 'Request pengembalian biaya operasional';
        }
        return '';
      case 'BD-Content':
        if (activeNav === 'ticketing') {
          return 'Request bantuan atau fitur baru dari tim IT';
        } else if (activeNav === 'reimburse') {
          return 'Request pengembalian biaya operasional';
        }
        return 'Input lead baru dari berbagai sumber';
      case 'BD-Executive':
        if (activeNav === 'leads') {
          return 'Claim leads untuk di-follow up sampai deal';
        } else if (activeNav === 'deals') {
          return 'BD Executive menggali kebutuhan client, buat proposal dan EL';
        } else if (activeNav === 'ticketing') {
          return 'Request bantuan atau fitur baru dari tim IT';
        } else if (activeNav === 'reimburse') {
          return 'Request pengembalian biaya operasional';
        }
        return '';
      case 'PM':
        if (activeNav === 'ticketing') {
          return 'Request bantuan atau fitur baru dari tim IT';
        } else if (activeNav === 'reimburse') {
          return 'Request pengembalian biaya operasional';
        }
        return 'Projects yang di-assign ke saya';
      case 'Admin':
        if (activeNav === 'ticketing') {
          return 'Request bantuan atau fitur baru dari tim IT';
        } else if (activeNav === 'reimburse') {
          return 'Request pengembalian biaya operasional';
        }
        return 'Monitor semua pembayaran dari awal sampai akhir';
      case 'ITSpecialist':
        if (activeNav === 'dashboard') {
          return 'Monitoring Business Development & Project Management';
        } else if (activeNav === 'leads') {
          return 'Monitor semua leads dari berbagai sumber';
        } else if (activeNav === 'deals') {
          return 'Monitor semua deals';
        } else if (activeNav === 'projects') {
          return 'BOD assign PM, PM assign Consultant untuk setiap project';
        } else if (activeNav === 'invoices') {
          return 'Kelola payment schedule yang flexible (50-50%, 50-35-15%, dll)';
        } else if (activeNav === 'ticketing') {
          return 'Kelola semua ticket yang masuk dari user';
        } else if (activeNav === 'reimburse') {
          return 'Review dan approve/reject pengajuan reimburse';
        } else if (activeNav === 'user-account') {
          return 'Kelola akun user dan atur role-nya';
        } else if (activeNav === 'settings') {
          return 'Pengaturan sistem dan konfigurasi';
        }
        return '';
      case 'Staff':
        return 'Akun Anda sedang menunggu persetujuan dari administrator';
      default:
        return '';
    }
  };

  const getRoleName = () => {
    switch (role) {
      case 'ITSpecialist':
        return 'IT SPECIALIST';
      case 'BD-Content':
        return 'BD CONTENT';
      case 'BD-Executive':
        return 'BD EXECUTIVE';
      case 'PM':
        return 'PROJECT MANAGER';
      case 'Staff':
        return 'STAFF';
      default:
        return role;
    }
  };

  const getDisplayName = () => {
    return userName || 'User';
  };

  const subtitle = getDashboardSubtitle();

  return (
    <header className="bg-gray-50 px-6 pt-3 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        {/* Dashboard Title - Left Side */}
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold text-gray-900">
            {getDashboardTitle()}
          </h1>
          {subtitle && (
            <p className="text-gray-500 text-sm">
              {subtitle}
            </p>
          )}
        </div>

        {/* Right Side - Dark Card with Notification and User Section */}
        <div className="flex-shrink-0">
          <div className="px-4 py-2 rounded-lg flex items-center gap-4 shadow-lg border border-gray-800/30" style={{ backgroundColor: '#1e1e1e' }}>
            {/* Notification Icon */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Bell className="w-5 h-5 text-white" strokeWidth={2} fill="none" />
                {notificationCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-gray-900">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </button>
              
              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                      <p className="text-sm text-gray-900">No new notifications</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Separator */}
            <div className="h-6 w-px bg-white/30" />

            {/* User Section */}
            <div className="flex items-center gap-3 pr-6">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-1000 to-red-600 flex items-center justify-center flex-shrink-0 border-2 border-red-800 text-white font-semibold text-sm">
                {userName ? userName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex flex-col items-start min-w-0">
                <p className="text-[10px] text-gray-400 font-semibold">{getRoleName()}</p>
                <p className="text-xs font-bold text-white truncate">{getDisplayName()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

