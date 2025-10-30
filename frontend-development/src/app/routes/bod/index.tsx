import { DashboardSummary } from './components/DashboardSummary';
import { LeadsSection } from './components/LeadsSection';
import { DealsSection } from './components/DealsSection';
import { ProjectsSection } from './components/ProjectsSection';
import { InvoicesSection } from './components/InvoicesSection';

export function BODDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Dashboard BOD</h2>
        <p className="text-gray-500">Monitoring Business Development & Project Management</p>
      </div>

      <DashboardSummary />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LeadsSection />
        <ProjectsSection />
        <DealsSection />
        <InvoicesSection />
      </div>
    </div>
  );
}

