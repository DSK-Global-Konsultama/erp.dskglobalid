import { Bell, ArrowLeft } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { LeadDetailHeaderBar } from '../../features/leads';

type UserRole = 'CEO' | 'COO-Tax-Audit' | 'COO-Legal-TP-SR' | 'BD-MEO' | 'BD-Executive' | 'PM' | 'Admin' | 'IT' | 'ITSpecialist' | 'SuperAdmin';

interface LeadDetailInfo {
  clientName: string;
  company?: string;
  status: string;
  service?: string;
  source?: string;
  picEmail?: string;
  picPhone?: string;
  onBack: () => void;
}

interface CampaignDetailInfo {
  name: string;
  type: string;
  status: string;
  channel: string;
  topicTag?: string;
  onBack: () => void;
}

interface FormBuilderDetailInfo {
  campaignName: string;
  onBack: () => void;
}

interface ProjectDetailInfo {
  onBack: () => void;
}

interface HeaderProps {
  role: UserRole;
  userName?: string;
  userProfileImagePath?: string | null;
  userProfileImageUrl?: string | null;
  activeNav?: string;
  leadDetail?: LeadDetailInfo;
  campaignDetail?: CampaignDetailInfo;
  formBuilderDetail?: FormBuilderDetailInfo;
  projectDetail?: ProjectDetailInfo | null;
}

export function Header({ role, userName, userProfileImagePath, userProfileImageUrl, activeNav = 'dashboard', leadDetail, campaignDetail, formBuilderDetail, projectDetail }: HeaderProps) {
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

  const getApiBase = (): string => {
    const envBase = (import.meta.env.VITE_API_BASE_URL || '').toString().trim();
    const base = envBase || 'http://localhost:3000';
    return base.replace(/\/+$/, '');
  };

  const buildAbsoluteUrl = (value: string): string => {
    const apiBase = getApiBase();
    if (/^https?:\/\//i.test(value)) return value;
    return `${apiBase}${value.startsWith('/') ? value : `/${value}`}`;
  };

  const resolveUserProfileUrl = (): string | null => {
    const clean = (v?: string | null) => {
      const s = (v || '').toString().trim();
      if (!s || s.toLowerCase() === 'null' || s.toLowerCase() === 'undefined') return null;
      return s;
    };

    const url = clean(userProfileImageUrl);
    if (url) return buildAbsoluteUrl(url);

    const path = clean(userProfileImagePath);
    if (path) {
      if (path.startsWith('/uploads/')) return buildAbsoluteUrl(path);
      if (path.startsWith('uploads/')) return buildAbsoluteUrl(`/${path}`);
      return buildAbsoluteUrl(`/uploads/${path.replace(/^\/+/, '')}`);
    }

    return null;
  };

  const defaultAvatarSrc = (): string => {
    const apiBase = getApiBase();
    return `${apiBase}/uploads/profile_images/avatar_default.jpg`;
  };

  const getDashboardTitle = () => {
    // CEO and COO share the same titles
    const getCEOCootitle = () => {
      if (activeNav === 'dashboard') {
        return role === 'CEO' ? 'Dashboard CEO' : `Dashboard ${role}`;
      } else if (activeNav === 'inbox') {
        return 'Kotak Masuk Lead';
      } else if (activeNav === 'approval') {
        return 'Approval';
      } else if (activeNav === 'leads') {
        return 'Semua Lead';
      } else if (activeNav === 'projects') {
        return 'Project Management';
      } else if (activeNav === 'invoices') {
        return 'Invoice Management';
      } else if (activeNav === 'ticketing') {
        return 'IT Ticketing';
      } else if (activeNav === 'reimburse') {
        return 'My Reimbursements';
      }
      return role === 'CEO' ? 'Dashboard CEO' : `Dashboard ${role}`;
    };

    switch (role) {
      case 'CEO':
      case 'COO-Tax-Audit':
      case 'COO-Legal-TP-SR':
        return getCEOCootitle();
      case 'BD-MEO':
        if (activeNav === 'dashboard') {
          return 'Dashboard MEO';
        } else if (activeNav === 'campaigns') {
          return 'Campaigns';
        } else if (activeNav === 'bank-data') {
          return 'Bank Data';
        } else if (activeNav === 'leads') {
          return 'Leads';
        } else if (activeNav === 'ticketing') {
          return 'IT Ticketing';
        } else if (activeNav === 'reimburse') {
          return 'My Reimbursements';
        }
        return 'Dashboard MEO';
      case 'BD-Executive':
        if (activeNav === 'deals') {
          return 'Lead Tracker';
        } else if (activeNav === 'bank-data') {
          return 'Bank Data';
        } else if (activeNav === 'ticketing') {
          return 'IT Ticketing';
        } else if (activeNav === 'reimburse') {
          return 'My Reimbursements';
        }
        return 'Lead Tracker';
      case 'PM':
        if (activeNav === 'ticketing') {
          return 'IT Ticketing';
        } else if (activeNav === 'reimburse') {
          return 'My Reimbursements';
        }
        return `PM Dashboard - ${userName || 'Project Manager'}`;
      case 'Admin':
        if (activeNav === 'ticketing') {
          return 'IT Ticketing';
        } else if (activeNav === 'reimburse') {
          return 'Reimbursement Dashboard';
        }
        return 'Admin Dashboard';
      case 'IT':
      case 'ITSpecialist':
      case 'SuperAdmin':
        if (activeNav === 'dashboard') {
          return role === 'SuperAdmin' ? 'Dashboard Super Admin' : 'Dashboard IT';
        } else if (activeNav === 'leads') {
          return 'All Leads';
        } else if (activeNav === 'projects') {
          return 'Project Management';
        } else if (activeNav === 'invoices') {
          return 'Invoice Management';
        } else if (activeNav === 'ticketing') {
          return 'IT Ticketing';
        } else if (activeNav === 'reimburse') {
          return 'My Reimbursements';
        } else if (activeNav === 'user-account') {
          return 'User Management';
        } else if (activeNav === 'settings') {
          return 'System Settings';
        }
        return role === 'SuperAdmin' ? 'Dashboard Super Admin' : 'Dashboard IT';
      default:
        return 'Dashboard';
    }
  };

  const getDashboardSubtitle = () => {
    // CEO and COO share the same subtitles
    const getCEOCooSubtitle = () => {
      if (activeNav === 'dashboard') {
        return 'Monitoring Business Development & Project Management';
      } else if (activeNav === 'inbox') {
        return 'Review and follow-up on leads promoted by BD Admin';
      } else if (activeNav === 'approval') {
        return 'Review dan approve dokumen dari BD Admin';
      } else if (activeNav === 'leads') {
        return 'View dan monitor semua leads dalam pipeline';
      } else if (activeNav === 'projects') {
        return role === 'CEO' 
          ? 'CEO assign PM untuk WEB DEV, COO assign PM sesuai layanan'
          : `${role} assign PM untuk layanan yang ditanggung jawabi`;
      } else if (activeNav === 'invoices') {
        return role === 'CEO'
          ? 'CEO dapat approve invoice yang dikirim admin'
          : 'COO hanya dapat melihat invoice (tidak bisa approve)';
      } else if (activeNav === 'ticketing') {
        return 'Request bantuan atau fitur baru dari tim IT';
      } else if (activeNav === 'reimburse') {
        return 'Submit dan lacak reimbursement pengeluaran kantor';
      }
      return '';
    };

    switch (role) {
      case 'CEO':
      case 'COO-Tax-Audit':
      case 'COO-Legal-TP-SR':
        return getCEOCooSubtitle();
      case 'BD-MEO':
        if (activeNav === 'dashboard') {
          return 'Ringkasan leads yang Anda kelola';
        } else if (activeNav === 'campaigns') {
          return 'Kelola campaign untuk lead generation';
        } else if (activeNav === 'bank-data') {
          return 'Lihat data submissions dari campaign (View Only)';
        } else if (activeNav === 'leads') {
          return 'Kelola semua leads yang Anda buat';
        } else if (activeNav === 'ticketing') {
          return 'Request bantuan atau fitur baru dari tim IT';
        } else if (activeNav === 'reimburse') {
          return 'Submit dan lacak reimbursement pengeluaran kantor';
        }
        return 'Ringkasan leads yang Anda kelola';
      case 'BD-Executive':
        if (activeNav === 'leads') {
          return 'Claim leads untuk di-follow up sampai deal';
        } else if (activeNav === 'deals') {
          return 'BD Executive menggali kebutuhan client, buat proposal dan EL';
        } else if (activeNav === 'bank-data') {
          return 'Review dan kelola data submissions dari campaign';
        } else if (activeNav === 'ticketing') {
          return 'Request bantuan atau fitur baru dari tim IT';
        } else if (activeNav === 'reimburse') {
          return 'Submit dan lacak reimbursement pengeluaran kantor';
        }
        return '';
      case 'PM':
        if (activeNav === 'ticketing') {
          return 'Request bantuan atau fitur baru dari tim IT';
        } else if (activeNav === 'reimburse') {
          return 'Submit dan lacak reimbursement pengeluaran kantor';
        }
        return 'Projects yang di-assign ke saya';
      case 'Admin':
        if (activeNav === 'ticketing') {
          return 'Request bantuan atau fitur baru dari tim IT';
        } else if (activeNav === 'reimburse') {
          return 'Kelola dan approve reimbursement dari semua staff';
        }
        return 'Monitor semua pembayaran dari awal sampai akhir';
      case 'IT':
      case 'ITSpecialist':
      case 'SuperAdmin':
        if (activeNav === 'dashboard') {
          return 'Monitoring Business Development & Project Management';
        } else if (activeNav === 'leads') {
          return 'Monitor semua leads dari berbagai sumber';
        } else if (activeNav === 'projects') {
          return 'Kelola project: COO assign PM, lihat detail dan progress';
        } else if (activeNav === 'invoices') {
          return 'Kelola payment schedule yang flexible (50-50%, 50-35-15%, dll)';
        } else if (activeNav === 'ticketing') {
          return 'Kelola semua ticket yang masuk dari user';
        } else if (activeNav === 'reimburse') {
          return 'Submit dan lacak reimbursement pengeluaran kantor';
        } else if (activeNav === 'user-account') {
          return 'Kelola user accounts dan role assignments';
        } else if (activeNav === 'settings') {
          return 'Pengaturan sistem dan konfigurasi';
        }
        return '';
      default:
        return '';
    }
  };

  const getRoleName = () => {
    switch (role) {
      case 'CEO':
        return 'Chief Executive Officer';
      case 'COO-Tax-Audit':
        return 'Chief Operations Officer';
      case 'COO-Legal-TP-SR':
        return 'Chief Operations Officer';
      case 'SuperAdmin':
        return 'SUPERADMIN';
      case 'IT':
      case 'ITSpecialist':
        return 'IT SPECIALIST';
      case 'BD-MEO':
        return 'BD MEO';
      case 'BD-Executive':
        return 'BD EXECUTIVE';
      case 'PM':
        return 'PROJECT MANAGER';
      default:
        return role;
    }
  };

  const getDisplayName = () => {
    return userName || 'User';
  };

  const subtitle = getDashboardSubtitle();

  // User avatar JSX (dipakai di 2 tempat)
  const UserAvatar = (
    <img
      src={resolveUserProfileUrl() || defaultAvatarSrc()}
      alt={getDisplayName()}
      className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-red-800"
      onError={(e) => {
        // hanya fallback ke default jika user image gagal load
        (e.target as HTMLImageElement).src = defaultAvatarSrc();
      }}
    />
  );

  // If formBuilderDetail is provided, show form builder header
  if (formBuilderDetail) {
    return (
      <header className="bg-gray-50 px-6 pt-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          {/* Form Builder Header - Left Side */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-4">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  formBuilderDetail.onBack();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex-1">
                <h1 className="text-lg font-semibold text-gray-900">Form Builder</h1>
                <p className="text-gray-500 text-sm mt-1">
                  {formBuilderDetail.campaignName}
                </p>
              </div>
            </div>
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
                {UserAvatar}
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

  // If campaignDetail is provided, show campaign detail header
  if (campaignDetail) {
    return (
      <header className="bg-gray-50 px-6 pt-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          {/* Campaign Detail Header - Left Side */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-4">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  campaignDetail.onBack();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex-1">
                <h1 className="text-lg font-semibold text-gray-900">Campaign Detail</h1>
                <p className="text-gray-500 text-sm mt-1">
                  Buat form untuk campaign ini dan kelola submissions yang masuk
                </p>
              </div>
            </div>
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
                {UserAvatar}
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

  // If projectDetail is provided, show project detail header (back + title)
  if (projectDetail) {
    return (
      <header className="bg-gray-50 px-6 pt-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-4">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  projectDetail.onBack();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex-1">
                <h1 className="text-lg font-semibold text-gray-900">Project Detail Page</h1>
                <p className="text-sm text-gray-500 mt-0.5">View handover, requirements, and progress</p>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0">
            <div className="px-4 py-2 rounded-lg flex items-center gap-4 shadow-lg border border-gray-800/30" style={{ backgroundColor: '#1e1e1e' }}>
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
              <div className="h-6 w-px bg-white/30" />
              <div className="flex items-center gap-3 pr-6">
                {UserAvatar}
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

  // If leadDetail is provided, show lead detail header (content from leads feature)
  if (leadDetail) {
    return (
      <header className="bg-gray-50 px-6 pt-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <LeadDetailHeaderBar {...leadDetail} onBack={leadDetail.onBack} />

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
                {UserAvatar}
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
              {UserAvatar}
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

