import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { Toaster } from '../components/ui/sonner';
import { LayoutDashboard, Users, HandshakeIcon, FolderKanban, FileText } from 'lucide-react';
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

type UserRole = 'BOD' | 'BD-Content' | 'BD-Executive' | 'PM' | 'Admin';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userRole, setUserRole] = useState<UserRole>('BOD');
  const [userName, setUserName] = useState('');

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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-l font-sm text-black">ERP System</h1>
            <p className="text-gray-500 text-sm mt-1">Business Development & Project Management</p>
          </div>
          
          {/* Role Selector */}
          <div className="flex items-center gap-4">
            <div className="w-48">
              <Label className="text-xs text-gray-500">Role</Label>
              <Select value={userRole} onValueChange={(value: UserRole) => { setUserRole(value); setUserName(''); }}>
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

      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* BOD View */}
        {userRole === 'BOD' && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="leads" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Leads
              </TabsTrigger>
              <TabsTrigger value="deals" className="flex items-center gap-2">
                <HandshakeIcon className="w-4 h-4" />
                Deals
              </TabsTrigger>
              <TabsTrigger value="projects" className="flex items-center gap-2">
                <FolderKanban className="w-4 h-4" />
                Projects
              </TabsTrigger>
              <TabsTrigger value="invoices" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Invoices
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard"><BODDashboard /></TabsContent>
            <TabsContent value="leads"><LeadsPage /></TabsContent>
            <TabsContent value="deals"><DealsPage /></TabsContent>
            <TabsContent value="projects"><ProjectsPage /></TabsContent>
            <TabsContent value="invoices"><InvoicesPage /></TabsContent>
          </Tabs>
        )}

        {/* BD Content Creator View */}
        {userRole === 'BD-Content' && (
          <div>
            {userName ? (
              <BDContentDashboard userName={userName} />
            ) : (
              <Card className="p-8 text-center">
                <p className="text-gray-500">Pilih nama user terlebih dahulu</p>
              </Card>
            )}
          </div>
        )}

        {/* BD Executive View */}
        {userRole === 'BD-Executive' && (
          <BDExecutiveDashboard userName={userName} />
        )}

        {/* PM View */}
        {userRole === 'PM' && (
          <div>
            {userName ? (
              <PMDashboard pmName={userName} />
            ) : (
              <Card className="p-8 text-center">
                <p className="text-gray-500">Pilih nama user terlebih dahulu</p>
              </Card>
            )}
          </div>
        )}

        {/* Admin View */}
        {userRole === 'Admin' && (
          <AdminDashboard />
        )}
      </main>

      <Toaster />
    </div>
  );
}

