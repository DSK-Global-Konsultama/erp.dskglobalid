import { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  HandshakeIcon, 
  FolderKanban, 
  FileText, 
  Ticket, 
  Receipt,
  ChevronLeft,
  ChevronRight,
  Settings,
  HelpCircle,
  LogOut
} from 'lucide-react';

type UserRole = 'BOD' | 'BD-Content' | 'BD-Executive' | 'PM' | 'Admin';
type NavItem = {
  id: string;
  label: string;
  icon: typeof LayoutDashboard;
  path: string;
};

interface SidebarProps {
  role: UserRole;
  userName?: string;
  activeNav?: string;
  onNavChange: (path: string) => void;
}

export function Sidebar({ role, userName, activeNav: externalActiveNav, onNavChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [internalActiveNav, setInternalActiveNav] = useState('dashboard');
  
  // Use external activeNav if provided, otherwise use internal
  const activeNav = externalActiveNav !== undefined ? externalActiveNav : internalActiveNav;

  const getNavItems = (): NavItem[] => {
    switch (role) {
      case 'BOD':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: 'dashboard' },
          { id: 'leads', label: 'Leads', icon: Users, path: 'leads' },
          { id: 'deals', label: 'Deals', icon: HandshakeIcon, path: 'deals' },
          { id: 'projects', label: 'Projects', icon: FolderKanban, path: 'projects' },
          { id: 'invoices', label: 'Invoices', icon: FileText, path: 'invoices' },
          { id: 'ticketing', label: 'Ticketing', icon: Ticket, path: 'ticketing' },
          { id: 'reimburse', label: 'Reimburse', icon: Receipt, path: 'reimburse' },
        ];
      case 'BD-Content':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: 'dashboard' },
          { id: 'leads', label: 'My Leads', icon: Users, path: 'dashboard' },
          { id: 'ticketing', label: 'Ticketing', icon: Ticket, path: 'ticketing' },
          { id: 'reimburse', label: 'Reimburse', icon: Receipt, path: 'reimburse' },
        ];
      case 'BD-Executive':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: 'dashboard' },
          { id: 'leads', label: 'Available Leads', icon: Users, path: 'dashboard' },
          { id: 'deals', label: 'My Deals', icon: HandshakeIcon, path: 'dashboard' },
          { id: 'ticketing', label: 'Ticketing', icon: Ticket, path: 'ticketing' },
          { id: 'reimburse', label: 'Reimburse', icon: Receipt, path: 'reimburse' },
        ];
      case 'PM':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: 'dashboard' },
          { id: 'projects', label: 'My Projects', icon: FolderKanban, path: 'dashboard' },
          { id: 'ticketing', label: 'Ticketing', icon: Ticket, path: 'ticketing' },
          { id: 'reimburse', label: 'Reimburse', icon: Receipt, path: 'reimburse' },
        ];
      case 'Admin':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: 'dashboard' },
          { id: 'payments', label: 'Payments', icon: FileText, path: 'dashboard' },
          { id: 'ticketing', label: 'Ticketing', icon: Ticket, path: 'ticketing' },
          { id: 'reimburse', label: 'Reimburse', icon: Receipt, path: 'reimburse' },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const handleNavClick = (id: string) => {
    setInternalActiveNav(id);
    onNavChange(id);
  };

  const getRoleName = () => {
    switch (role) {
      case 'BD-Content':
        return 'BD CONTENT';
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

  return (
    <div className="flex-shrink-0 relative h-full">
      <div
        className={`text-white transition-all duration-300 flex flex-col ${
          isCollapsed ? 'w-20' : 'w-64'
        } h-full rounded-2xl shadow-2xl border border-gray-800/30`}
        style={{ backgroundColor: '#1e1e1e' }}
      >
      {/* User Profile Section */}
      <div className={`border-b border-white/40 ${isCollapsed ? 'p-2' : 'p-4'}`}>
        <div className={`flex items-center mb-3 ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
          <div className={`${isCollapsed ? 'w-8 h-8' : 'w-10 h-10'} rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center flex-shrink-0 border-2 border-pink-500`}>
            {userName ? userName.charAt(0).toUpperCase() : 'U'}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-gray-400 font-semibold">{getRoleName()}</p>
              <p className="text-xs font-bold truncate">{getDisplayName()}</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Collapse Button - positioned at the edge */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-6 -right-3 w-6 h-6 rounded-full bg-[#1e1e1e] border-2 border-white hover:bg-black flex items-center justify-center transition-colors shadow-lg z-50"
      >
        {isCollapsed ? (
          <ChevronRight className="w-3 h-3 text-white" />
        ) : (
          <ChevronLeft className="w-3 h-3 text-white" />
        )}
      </button>

      {/* Navigation Section */}
      <div className="flex-1 py-4">
        {!isCollapsed && (
          <p className="px-6 text-[10px] font-semibold text-white mb-2">MAIN</p>
        )}
        <nav className={isCollapsed ? 'px-2 space-y-1' : 'px-3 space-y-1'}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-2 rounded-lg transition-colors group relative ${
                  isActive
                    ? 'bg-black/50 text-red-500'
                    : 'text-white hover:text-red-500'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="text-xs font-medium">{item.label}</span>
                )}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
        <div className="h-px bg-white/40 my-3 mx-4" />
        
        {/* Settings Section */}
        {!isCollapsed && (
          <p className="px-6 text-[10px] font-semibold text-white mb-2">SETTINGS</p>
        )}
        <nav className={isCollapsed ? 'px-2 space-y-1' : 'px-3 space-y-1'}>
          <button
            className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-2 rounded-lg transition-colors text-white hover:text-red-500 group relative`}
          >
            <Settings className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && <span className="text-xs font-medium">Settings</span>}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                Settings
              </div>
            )}
          </button>
        </nav>
      </div>

      {/* Footer Links */}
      <div className={`border-t border-white/40 space-y-2 ${isCollapsed ? 'p-2' : 'p-4'}`}>
        <button
          className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-2 rounded-lg transition-colors text-white hover:text-red-500 group relative`}
        >
          <HelpCircle className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span className="text-xs font-medium">Help</span>}
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
              Help
            </div>
          )}
        </button>
        <button
          className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-2 rounded-lg transition-colors text-white hover:text-red-500 group relative`}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span className="text-xs font-medium">Logout</span>}
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
              Logout Account
            </div>
          )}
        </button>
      </div>
      </div>
    </div>
  );
}

