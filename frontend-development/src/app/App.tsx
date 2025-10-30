import { useState } from 'react';
import { Card } from '../components/ui/card';
import { Toaster } from '../components/ui/sonner';
import { Sidebar } from '../components/layout/Sidebar';

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
  const [userRole] = useState<UserRole>('BOD');
  const [userName] = useState('');

  const handleNavChange = (path: string) => {
    setActiveNav(path);
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
          return <BDExecutiveDashboard userName={userName} />;
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
      <div className="flex h-screen overflow-hidden p-4 gap-4">
        <Sidebar 
          role={userRole} 
          userName={userName} 
          onNavChange={handleNavChange}
        />
        
        <div className="flex-1 transition-all duration-300 overflow-hidden flex flex-col bg-white rounded-2xl shadow-lg h-[calc(100vh-2rem)]">
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

