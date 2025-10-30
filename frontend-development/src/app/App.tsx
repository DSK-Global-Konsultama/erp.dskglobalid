import { useState } from 'react';
import { Card } from '../components/ui/card';
import { Toaster } from '../components/ui/sonner';
import { Sidebar } from '../components/layout/Sidebar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { bdContentCreators, bdExecutives, projectManagers } from '../lib/mock-data';

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

// Ticketing and Reimburse imports
import { TicketingPage } from './routes/ticketing';
import { ReimbursePage } from './routes/reimburse';

type UserRole = 'BOD' | 'BD-Content' | 'BD-Executive' | 'PM' | 'Admin';

export default function App() {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [userRole, setUserRole] = useState<UserRole>('BOD');
  const [userName, setUserName] = useState('');
  const [bdExecutiveTab, setBdExecutiveTab] = useState('leads');

  const getUserOptions = () => {
    switch (userRole) {
      case 'BD-Content':
        return bdContentCreators;
      case 'BD-Executive':
        return bdExecutives;
      case 'PM':
        return projectManagers;
      default:
        return ['BOD', 'Admin'];
    }
  };

  // Reset to correct initial nav when role changes
  const handleRoleChange = (newRole: UserRole) => {
    setUserRole(newRole);
    setUserName('');
    
    // Set default active nav based on role
    switch (newRole) {
      case 'BD-Content':
      case 'BD-Executive':
        setActiveNav('leads');
        setBdExecutiveTab('leads');
        break;
      default:
        setActiveNav('dashboard');
        setBdExecutiveTab('leads');
    }
  };

  const handleNavChange = (path: string) => {
    setActiveNav(path);
    // Sync tab state for BD-Executive when clicking sidebar
    if (userRole === 'BD-Executive' && (path === 'leads' || path === 'deals')) {
      setBdExecutiveTab(path);
    }
  };

  const handleBdExecutiveTabChange = (tab: string) => {
    setBdExecutiveTab(tab);
    setActiveNav(tab);
  };

  const renderContent = () => {
    switch (activeNav) {
      case 'ticketing':
        return <TicketingPage />;
      case 'reimburse':
        return <ReimbursePage />;
      default:
        // Role-specific content
        if (userRole === 'BOD') {
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
        } else if (userRole === 'BD-Content') {
          if (!userName) {
            return (
              <Card className="p-8 text-center">
                <p className="text-gray-500">Pilih nama user terlebih dahulu</p>
              </Card>
            );
          }
          return <BDContentDashboard userName={userName} />;
        } else if (userRole === 'BD-Executive') {
          if (!userName) {
            return (
              <Card className="p-8 text-center">
                <p className="text-gray-500">Pilih nama user terlebih dahulu</p>
              </Card>
            );
          }
          // Only show BD Executive content if on leads or deals, otherwise show dashboard
          if (activeNav === 'leads' || activeNav === 'deals') {
            return (
              <BDExecutiveDashboard 
                userName={userName} 
                activeTab={bdExecutiveTab}
                onTabChange={handleBdExecutiveTabChange}
              />
            );
          }
          // Default to showing leads tab when first loading BD-Executive
          return (
            <BDExecutiveDashboard 
              userName={userName} 
              activeTab="leads"
              onTabChange={handleBdExecutiveTabChange}
            />
          );
        } else if (userRole === 'PM') {
          if (!userName) {
            return (
              <Card className="p-8 text-center">
                <p className="text-gray-500">Pilih nama user terlebih dahulu</p>
              </Card>
            );
          }
          return <PMDashboard pmName={userName} />;
        } else if (userRole === 'Admin') {
          return <AdminDashboard />;
        }
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-2">
        <div className="mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-black text-l font-semibold">ERP System</h1>
            <p className="text-gray-500 text-sm mt-1">Business Development & Project Management</p>
          </div>
          
          {/* Role Selector */}
          <div className="flex items-center gap-4">
            <div className="w-48">
              <Label className="text-xs text-gray-500">Role</Label>
              <Select value={userRole} onValueChange={handleRoleChange}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BOD">BOD</SelectItem>
                  <SelectItem value="BD-Content">BD Content Creator</SelectItem>
                  <SelectItem value="BD-Executive">BD Executive</SelectItem>
                  <SelectItem value="PM">Project Manager</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {(userRole === 'BD-Content' || userRole === 'BD-Executive' || userRole === 'PM') && (
              <div className="w-48">
                <Label className="text-xs text-gray-500">User</Label>
                <Select value={userName} onValueChange={setUserName}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Pilih nama" />
                  </SelectTrigger>
                  <SelectContent>
                    {getUserOptions().map(name => (
                      <SelectItem key={name} value={name}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Layout with Sidebar */}
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden p-4 gap-4">
        <Sidebar 
          role={userRole} 
          userName={userName || userRole} 
          activeNav={activeNav}
          onNavChange={handleNavChange}
        />
        
        <div className="flex-1 transition-all duration-300 overflow-hidden flex flex-col bg-white rounded-2xl shadow-lg h-full">
          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
            {renderContent()}
          </main>
        </div>
      </div>

      <Toaster />
    </div>
  );
}

