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
  LogOut,
  Building2,
  Inbox
} from 'lucide-react';

type UserRole = 'CEO' | 'COO-Tax-Audit' | 'COO-Legal-TP-SR' | 'BD-MEO' | 'BD-Executive' | 'PM' | 'Admin' | 'ITSpecialist' | 'SuperAdmin';
type NavItem = {
  id: string;
  label: string;
  icon: typeof LayoutDashboard;
  path: string;
};

interface SidebarProps {
  role: UserRole;
  activeNav?: string;
  onNavChange: (path: string) => void;
  onLogout?: () => void;
}

export function Sidebar({ role, activeNav: externalActiveNav, onNavChange, onLogout }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Set default activeNav based on role
  const getDefaultActiveNav = () => {
    switch (role) {
      case 'BD-Executive':
        return 'leads';
      case 'BD-MEO':
        return 'dashboard';
      default:
        return 'dashboard';
    }
  };
  
  const [internalActiveNav, setInternalActiveNav] = useState(getDefaultActiveNav());
  
  // Use external activeNav if provided, otherwise use internal
  const activeNav = externalActiveNav !== undefined ? externalActiveNav : internalActiveNav;

  const getNavItems = (): NavItem[] => {
    // CEO has Inbox, COO doesn't
    const ceoNavItems = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: 'dashboard' },
      { id: 'inbox', label: 'Lead Inbox', icon: Inbox, path: 'inbox' },
      { id: 'leads', label: 'Leads', icon: Users, path: 'leads' },
      { id: 'deals', label: 'Deals', icon: HandshakeIcon, path: 'deals' },
      { id: 'projects', label: 'Projects', icon: FolderKanban, path: 'projects' },
      { id: 'invoices', label: 'Invoices', icon: FileText, path: 'invoices' },
      { id: 'ticketing', label: 'Ticketing', icon: Ticket, path: 'ticketing' },
      { id: 'reimburse', label: 'Reimburse', icon: Receipt, path: 'reimburse' },
    ];

    // COO navigation items (without Inbox)
    const cooNavItems = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: 'dashboard' },
      { id: 'leads', label: 'Leads', icon: Users, path: 'leads' },
      { id: 'deals', label: 'Deals', icon: HandshakeIcon, path: 'deals' },
      { id: 'projects', label: 'Projects', icon: FolderKanban, path: 'projects' },
      { id: 'invoices', label: 'Invoices', icon: FileText, path: 'invoices' },
      { id: 'ticketing', label: 'Ticketing', icon: Ticket, path: 'ticketing' },
      { id: 'reimburse', label: 'Reimburse', icon: Receipt, path: 'reimburse' },
    ];

    switch (role) {
      case 'CEO':
        return ceoNavItems;
      case 'COO-Tax-Audit':
      case 'COO-Legal-TP-SR':
        return cooNavItems;
      case 'BD-MEO':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: 'dashboard' },
          { id: 'leads', label: 'My Leads', icon: Users, path: 'leads' },
          { id: 'ticketing', label: 'Ticketing', icon: Ticket, path: 'ticketing' },
          { id: 'reimburse', label: 'Reimburse', icon: Receipt, path: 'reimburse' },
        ];
      case 'BD-Executive':
        return [
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
      case 'ITSpecialist':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: 'dashboard' },
          { id: 'leads', label: 'Leads', icon: Users, path: 'leads' },
          { id: 'deals', label: 'Deals', icon: HandshakeIcon, path: 'deals' },
          { id: 'projects', label: 'Projects', icon: FolderKanban, path: 'projects' },
          { id: 'invoices', label: 'Invoices', icon: FileText, path: 'invoices' },
          { id: 'ticketing', label: 'Ticketing', icon: Ticket, path: 'ticketing' },
          { id: 'reimburse', label: 'Reimburse', icon: Receipt, path: 'reimburse' },
          { id: 'user-account', label: 'User Management', icon: Users, path: 'user-account' },
          { id: 'settings', label: 'Settings', icon: Settings, path: 'settings' },
        ];
      case 'SuperAdmin':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: 'dashboard' },
          { id: 'leads', label: 'Leads', icon: Users, path: 'leads' },
          { id: 'deals', label: 'Deals', icon: HandshakeIcon, path: 'deals' },
          { id: 'projects', label: 'Projects', icon: FolderKanban, path: 'projects' },
          { id: 'invoices', label: 'Invoices', icon: FileText, path: 'invoices' },
          { id: 'ticketing', label: 'Ticketing', icon: Ticket, path: 'ticketing' },
          { id: 'reimburse', label: 'Reimburse', icon: Receipt, path: 'reimburse' },
          { id: 'user-account', label: 'User Management', icon: Users, path: 'user-account' },
          { id: 'settings', label: 'Settings', icon: Settings, path: 'settings' },
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

  return (
    <div className="flex-shrink-0 relative sticky top-4 self-start z-[100]" style={{ overflow: 'visible' }}>
      <div
        className={`text-white transition-all duration-300 flex flex-col ${
          isCollapsed ? 'w-20' : 'w-64'
        } h-[calc(100vh-2rem)] rounded-2xl shadow-2xl border border-gray-800/30`}
        style={{ backgroundColor: '#1e1e1e', overflow: 'visible' }}
      >
      {/* Logo and ERP System Header */}
      <div className={`border-b border-white/40 ${isCollapsed ? 'p-4' : 'p-4'}`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
          <div className={`${isCollapsed ? 'w-8 h-8' : 'w-10 h-10'} rounded-lg bg-gradient-to-br from-red-1000 to-red-600 flex items-center justify-center flex-shrink-0`}>
            <Building2 className={`${isCollapsed ? 'w-4 h-4' : 'w-5 h-5'} text-white`} />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-bold text-white">ERP System</h1>
              <p className="text-[10px] text-gray-400">Business Management</p>
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
      <div className="flex-1 py-4" style={{ overflow: 'visible' }}>
        {!isCollapsed && (
          <p className="px-6 text-[10px] font-semibold text-white mb-2">MAIN</p>
        )}
        <nav className={isCollapsed ? 'px-2 space-y-1' : 'px-3 space-y-1'} style={{ overflow: 'visible', position: 'relative' }}>
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
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-[9999]">
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
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-[9999]">
                Settings
              </div>
            )}
          </button>
        </nav>
      </div>

      {/* Footer Section - Help and Logout */}
      <div className={`border-t border-white/40 ${isCollapsed ? 'p-3' : 'p-4'} space-y-3`} style={{ overflow: 'visible' }}>
        {/* Help Button */}
        <button
          className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-2 rounded-lg transition-colors text-white hover:text-red-500 group relative`}
        >
          <HelpCircle className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span className="text-xs font-medium">Help</span>}
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-[9999]">
              Help
            </div>
          )}
        </button>
        
        {/* Logout Button */}
        <button
          onClick={onLogout}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-2 rounded-lg transition-colors text-white hover:text-red-500 group relative`}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span className="text-xs font-medium">Logout</span>}
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-[9999]">
              Logout Account
            </div>
          )}
        </button>
      </div>
      </div>
    </div>
  );
}

