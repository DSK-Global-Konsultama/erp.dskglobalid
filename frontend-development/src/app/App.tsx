import { useState, useEffect } from 'react';
import { Toaster } from '../components/ui/sonner';
import { toast } from 'sonner';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { authService, type User } from '../services/authService';

// BOD imports
import { BODDashboard } from './routes/bod';
import { LeadsPage } from './routes/bod/pages/LeadsPage';
import { DealsPage } from './routes/bod/pages/DealsPage';
import { ProjectsPage } from './routes/bod/pages/ProjectsPage';
import { InvoicesPage } from './routes/bod/pages/InvoicesPage';

// Other role imports
import { BDContentDashboard } from './routes/bd-content';
import { BDExecutiveDashboard } from './routes/bd-executive';
import { PMDashboard } from './routes/pm';
import { AdminDashboard } from './routes/admin';
import { ITDashboard } from './routes/it';
import { UserAccountPage } from './routes/it/pages/UserAccountPage';
import { ITReimbursePage } from './routes/it/pages/ReimbursePage';
import { SettingPage } from './routes/it/pages/SettingPage';

// Ticketing and Reimburse imports
import { TicketingPage } from './routes/ticketing';
import { ReimbursePage } from './routes/reimburse';

// Auth imports
import { AuthPage } from './routes/auth/AuthPage';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [bdExecutiveTab, setBdExecutiveTab] = useState('leads');

  // Check for existing session on mount
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      // Set default active nav based on role
      if (user.role === 'BD-Content' || user.role === 'BD-Executive') {
        setActiveNav('leads');
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
    if (user.role === 'BD-Content' || user.role === 'BD-Executive') {
      setActiveNav('leads');
      setBdExecutiveTab('leads');
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
        return <TicketingPage />;
      case 'reimburse':
        // Use IT-specific reimburse page for IT role, otherwise use general one
        if (currentUser.role === 'ITSpecialist') {
          return <ITReimbursePage />;
        }
        return <ReimbursePage />;
      default:
        // Role-specific content
        if (currentUser.role === 'ITSpecialist') {
          switch (activeNav) {
            case 'dashboard':
              return <BODDashboard />;
            case 'leads':
              return <LeadsPage />;
            case 'deals':
              return <DealsPage />;
            case 'projects':
              return <ProjectsPage />;
            case 'invoices':
              return <InvoicesPage />;
            case 'ticketing':
              return <ITDashboard />;
            case 'user-account':
              return <UserAccountPage />;
            case 'settings':
              return <SettingPage />;
            default:
              return <BODDashboard />;
          }
        } else if (currentUser.role === 'BOD') {
          switch (activeNav) {
            case 'dashboard':
              return <BODDashboard />;
            case 'leads':
              return <LeadsPage />;
            case 'deals':
              return <DealsPage />;
            case 'projects':
              return <ProjectsPage />;
            case 'invoices':
              return <InvoicesPage />;
            default:
              return <BODDashboard />;
          }
        } else if (currentUser.role === 'BD-Content') {
          return <BDContentDashboard userName={currentUser.name} />;
        } else if (currentUser.role === 'BD-Executive') {
          // Only show BD Executive content if on leads or deals, otherwise show dashboard
          if (activeNav === 'leads' || activeNav === 'deals') {
            return (
              <BDExecutiveDashboard 
                userName={currentUser.name} 
                activeTab={bdExecutiveTab}
                onTabChange={handleBdExecutiveTabChange}
              />
            );
          }
          // Default to showing leads tab when first loading BD-Executive
          return (
            <BDExecutiveDashboard 
              userName={currentUser.name} 
              activeTab="leads"
              onTabChange={handleBdExecutiveTabChange}
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
            role={currentUser.role} 
            userName={currentUser.name}
            activeNav={activeNav}
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

