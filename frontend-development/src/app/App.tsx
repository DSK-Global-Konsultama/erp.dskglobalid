import { useState, useEffect, useRef } from 'react';
import { Toaster } from '../components/ui/sonner';
import { toast } from 'sonner';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { authService, type User } from '../services/authService';

// CEO imports
import { CEODashboard } from './routes/ceo';
import { LeadsPage as CEOLeadsPage } from './routes/ceo/pages/LeadsPage';
import { InboxPage as CEOInboxPage } from './routes/ceo/pages/InboxPage';
import { DealsPage as CEODealsPage } from './routes/ceo/pages/DealsPage';
import { ProjectsPage as CEOProjectsPage } from './routes/ceo/pages/ProjectsPage';
import { InvoicesPage as CEOInvoicesPage } from './routes/ceo/pages/InvoicesPage';
import { TicketingPage as CEOTicketingPage } from './routes/ceo/pages/TicketingPage';
import { ReimbursePage as CEOReimbursePage } from './routes/ceo/pages/ReimbursePage';

// COO imports
import { COODashboard } from './routes/coo';
import { LeadsPage as COOLeadsPage } from './routes/coo/pages/LeadsPage';
import { DealsPage as COODealsPage } from './routes/coo/pages/DealsPage';
import { ProjectsPage as COOProjectsPage } from './routes/coo/pages/ProjectsPage';
import { InvoicesPage as COOInvoicesPage } from './routes/coo/pages/InvoicesPage';
import { TicketingPage as COOTicketingPage } from './routes/coo/pages/TicketingPage';
import { ReimbursePage as COOReimbursePage } from './routes/coo/pages/ReimbursePage';


// Other role imports
import { BDMEODashboard } from './routes/bd-meo';
import { DashboardPage as BDMEODashboardPage } from './routes/bd-meo/pages/DashboardPage';
import { TicketingPage as BDMEOTicketingPage } from './routes/bd-meo/pages/TicketingPage';
import { BDExecutiveDashboard } from './routes/bd-executive';
import { TicketingPage as BDExecutiveTicketingPage } from './routes/bd-executive/pages/TicketingPage';
import { PMDashboard } from './routes/pm';
import { TicketingPage as PMTicketingPage } from './routes/pm/pages/TicketingPage';
import { AdminDashboard } from './routes/admin';
import { TicketingPage as AdminTicketingPage } from './routes/admin/pages/TicketingPage';
import { ReimbursePage as AdminReimbursePage } from './routes/admin/pages/ReimbursePage';
import { ReimbursePage as BDMEOReimbursePage } from './routes/bd-meo/pages/ReimbursePage';
import { ReimbursePage as BDExecutiveReimbursePage } from './routes/bd-executive/pages/ReimbursePage';
import { ReimbursePage as PMReimbursePage } from './routes/pm/pages/ReimbursePage';
// SuperAdmin imports
import { UserManagementPage as SuperAdminUserManagementPage } from './routes/superadmin/pages/UserManagementPage';
import { SuperAdminReimbursePage } from './routes/superadmin/pages/ReimbursePage';
import { SettingPage as SuperAdminSettingPage } from './routes/superadmin/pages/SettingPage';
import { TicketingPage as SuperAdminTicketingPage } from './routes/superadmin/pages/TicketingPage';

// Shared dashboard for BOD/CEO/COO exports
import { BODDashboard } from '../features/bod-dashboard';

// Auth imports
import { AuthPage } from './routes/auth/AuthPage';

// Helper function to map User role to Header role type
const mapRoleForHeader = (role: User['role']): 'CEO' | 'COO-Tax-Audit' | 'COO-Legal-TP-SR' | 'BD-MEO' | 'BD-Executive' | 'PM' | 'Admin' | 'IT' | 'SuperAdmin' => {
  if (role === 'ITSpecialist') return 'IT';
  if (role === 'SuperAdmin') return 'SuperAdmin';
  if (role === 'COO-Tax-Audit' || role === 'COO-Legal-TP-SR') return role;
  if (role === 'CEO') return 'CEO';
  return role as 'BD-MEO' | 'BD-Executive' | 'PM' | 'Admin';
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [bdExecutiveTab, setBdExecutiveTab] = useState('leads');
  const [leadDetail, setLeadDetail] = useState<{ clientName: string; status: string } | null>(null);
  const resetDetailRef = useRef<(() => void) | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      // Set default active nav based on role
      if (user.role === 'BD-Executive') {
        setActiveNav('leads');
      } else if (user.role === 'BD-MEO') {
        setActiveNav('dashboard');
      } else {
        setActiveNav('dashboard');
      }
    }
  }, []);

  // Listen for storage changes (sync across tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'erp_user_session') {
        if (e.newValue === null) {
          // User logged out in another tab
          setCurrentUser(null);
          toast.info('You have been logged out');
        } else {
          // User logged in in another tab
          const user = authService.getCurrentUser();
          if (user && !currentUser) {
            setCurrentUser(user);
            toast.info('Logged in from another tab');
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentUser]);

  // Session validation and auto-logout check
  useEffect(() => {
    if (!currentUser) return;

    // Check session validity every minute
    const intervalId = setInterval(() => {
      const user = authService.getCurrentUser();
      if (!user) {
        // Session expired
        setCurrentUser(null);
        toast.error('Session expired. Please login again.');
      }
    }, 60 * 1000); // Check every 1 minute

    // Update activity on user interaction
    const handleActivity = () => {
      authService.updateActivity();
    };

    window.addEventListener('click', handleActivity);
    window.addEventListener('keypress', handleActivity);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keypress', handleActivity);
    };
  }, [currentUser]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    // Set default active nav based on role
    if (user.role === 'BD-Executive') {
      setActiveNav('leads');
      setBdExecutiveTab('leads');
    } else if (user.role === 'BD-MEO') {
      setActiveNav('dashboard');
    } else {
      setActiveNav('dashboard');
    }
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setActiveNav('dashboard');
  };

  const handleNavChange = (path: string) => {
    // Reset lead detail when navigating to a different page
    // Only keep detail if staying on leads/deals page for BD-Executive
    if (leadDetail) {
      const isStayingOnLeadsOrDeals = currentUser?.role === 'BD-Executive' && 
        (path === 'leads' || path === 'deals') && 
        (activeNav === 'leads' || activeNav === 'deals');
      
      if (!isStayingOnLeadsOrDeals) {
        setLeadDetail(null);
        // Trigger reset in LeadTrackerPage
        if (resetDetailRef.current) {
          resetDetailRef.current();
        }
      }
    }
    setActiveNav(path);
    // Sync tab state for BD-Executive when clicking sidebar
    if (currentUser?.role === 'BD-Executive' && (path === 'leads' || path === 'deals')) {
      setBdExecutiveTab(path);
    }
  };

  const handleBdExecutiveTabChange = (tab: string) => {
    setBdExecutiveTab(tab);
    setActiveNav(tab);
  };

  const renderContent = () => {
    if (!currentUser) return null;

    switch (activeNav) {
      case 'ticketing':
        // Use role-specific ticketing page
        if (currentUser.role === 'ITSpecialist') {
          return <SuperAdminTicketingPage />;
        } else if (currentUser.role === 'SuperAdmin') {
          return <SuperAdminTicketingPage />;
        } else if (currentUser.role === 'CEO') {
          return <CEOTicketingPage />;
        } else if (currentUser.role?.startsWith('COO-')) {
          return <COOTicketingPage />;
        } else if (currentUser.role === 'BD-MEO') {
          return <BDMEOTicketingPage />;
        } else if (currentUser.role === 'BD-Executive') {
          return <BDExecutiveTicketingPage />;
        } else if (currentUser.role === 'PM') {
          return <PMTicketingPage />;
        } else if (currentUser.role === 'Admin') {
          return <AdminTicketingPage />;
        }
        return null;
      case 'reimburse':
        // Use role-specific reimburse page
        if (currentUser.role === 'Admin') {
          return <AdminReimbursePage />;
        } else if (currentUser.role === 'ITSpecialist') {
          return <SuperAdminReimbursePage />;
        } else if (currentUser.role === 'SuperAdmin') {
          return <SuperAdminReimbursePage />;
        } else if (currentUser.role === 'CEO') {
          return <CEOReimbursePage />;
        } else if (currentUser.role?.startsWith('COO-')) {
          return <COOReimbursePage />;
        } else if (currentUser.role === 'BD-MEO') {
          return <BDMEOReimbursePage />;
        } else if (currentUser.role === 'BD-Executive') {
          return <BDExecutiveReimbursePage />;
        } else if (currentUser.role === 'PM') {
          return <PMReimbursePage />;
        }
        return null;
      default:
        // Role-specific content
        if (currentUser.role === 'SuperAdmin') {
          switch (activeNav) {
            case 'dashboard':
              return <BODDashboard />;
            case 'leads':
              return <CEOLeadsPage />;
            case 'deals':
              return <CEODealsPage />;
            case 'projects':
              return <CEOProjectsPage />;
            case 'invoices':
              return <CEOInvoicesPage />;
            case 'user-account':
              return <  SuperAdminUserManagementPage />;
            case 'settings':
              return <SuperAdminSettingPage />;
            default:
              return <BODDashboard />;
          }
        } else if (currentUser.role === 'ITSpecialist') {
          switch (activeNav) {
            case 'dashboard':
              return <CEODashboard />;
            case 'leads':
              return <CEOLeadsPage />;
            case 'deals':
              return <CEODealsPage />;
            case 'projects':
              return <CEOProjectsPage />;
            case 'invoices':
              return <CEOInvoicesPage />;
            case 'user-account':
              return <SuperAdminUserManagementPage />;
            case 'settings':
              return <SuperAdminSettingPage />;
            default:
              return <CEODashboard />;
          }
        } else if (currentUser.role === 'CEO') {
          switch (activeNav) {
            case 'dashboard':
              return <CEODashboard />;
            case 'inbox':
              return <CEOInboxPage />;
            case 'leads':
              return <CEOLeadsPage />;
            case 'deals':
              return <CEODealsPage />;
            case 'projects':
              return <CEOProjectsPage />;
            case 'invoices':
              return <CEOInvoicesPage />;
            default:
              return <CEODashboard />;
          }
        } else if (currentUser.role?.startsWith('COO-')) {
          switch (activeNav) {
            case 'dashboard':
              return <COODashboard />;
            case 'leads':
              return <COOLeadsPage />;
            case 'deals':
              return <COODealsPage />;
            case 'projects':
              return <COOProjectsPage />;
            case 'invoices':
              return <COOInvoicesPage />;
            default:
              return <COODashboard />;
          }
        } else if (currentUser.role === 'BD-MEO') {
          switch (activeNav) {
            case 'dashboard':
              return <BDMEODashboardPage userName={currentUser.name} />;
            case 'leads':
          return <BDMEODashboard userName={currentUser.name} />;
            default:
              return <BDMEODashboardPage userName={currentUser.name} />;
          }
        } else if (currentUser.role === 'BD-Executive') {
          // Only show BD Executive content if on leads or deals, otherwise show dashboard
          if (activeNav === 'leads' || activeNav === 'deals') {
            return (
              <BDExecutiveDashboard 
                userName={currentUser.name} 
                activeTab={bdExecutiveTab}
                onTabChange={handleBdExecutiveTabChange}
                onLeadDetailChange={setLeadDetail}
                onBackFromDetail={() => {
                  setLeadDetail(null);
                  if (resetDetailRef.current) {
                    resetDetailRef.current();
                  }
                }}
                onResetDetail={(resetFn) => {
                  resetDetailRef.current = resetFn;
                }}
              />
            );
          }
          // Default to showing leads tab when first loading BD-Executive
          return (
            <BDExecutiveDashboard 
              userName={currentUser.name} 
              activeTab="leads"
              onTabChange={handleBdExecutiveTabChange}
              onLeadDetailChange={setLeadDetail}
              onBackFromDetail={() => {
                setLeadDetail(null);
                if (resetDetailRef.current) {
                  resetDetailRef.current();
                }
              }}
              onResetDetail={(resetFn) => {
                resetDetailRef.current = resetFn;
              }}
            />
          );
        } else if (currentUser.role === 'PM') {
          return <PMDashboard pmName={currentUser.name} />;
        } else if (currentUser.role === 'Admin') {
          return <AdminDashboard />;
        }
        return null;
    }
  };

  // Show auth page if not authenticated
  if (!currentUser) {
    return (
      <>
        <AuthPage onLoginSuccess={handleLogin} />
        <Toaster />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Layout with Sidebar */}
      <div className="flex gap-4 p-4">
        <Sidebar 
          role={currentUser.role} 
          activeNav={activeNav}
          onNavChange={handleNavChange}
          onLogout={handleLogout}
        />
        
        <div className="flex-1 transition-all duration-300 overflow-hidden flex flex-col bg-white h-full relative z-10">
          {/* Header */}
          <Header 
            role={mapRoleForHeader(currentUser.role)} 
            userName={currentUser.name}
            userProfileImagePath={currentUser.profile_image_path}
            userProfileImageUrl={currentUser.profile_image_url}
            activeNav={activeNav}
            leadDetail={leadDetail ? {
              ...leadDetail,
              onBack: () => {
                setLeadDetail(null);
                // Reset detail in LeadTrackerPage
                if (resetDetailRef.current) {
                  resetDetailRef.current();
                }
              }
            } : undefined}
          />
          
          {/* Main Content */}
          <main className="flex-1 overflow-y-auto bg-gray-50">
            <div className="flex flex-col gap-6 p-6">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>

      <Toaster />
    </div>
  );
}

