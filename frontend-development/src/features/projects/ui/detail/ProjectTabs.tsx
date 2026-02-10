/**
 * Project detail tabs: Overview, Handover, Requirements, Documents, Progress, Activity.
 */

import {
  LayoutDashboard,
  FileText,
  ListChecks,
  Folder,
  TrendingUp,
  Activity,
} from 'lucide-react';
import type { ExtendedHandover, Requirement, ProjectDocument } from '../../../../lib/projectWorkflowTypes';
import type { Lead, Proposal, EngagementLetter } from '../../../../lib/mock-data';
import type { ProjectDetailTabId } from '../../pages';
import { ComingSoonTab, ProjectHandoverTab, ProjectRequirementsTab } from '../tabs';

const TAB_CONFIG: { id: ProjectDetailTabId; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'handover', label: 'Handover', icon: <FileText className="w-4 h-4" /> },
  { id: 'requirements', label: 'Requirements', icon: <ListChecks className="w-4 h-4" /> },
  { id: 'documents', label: 'Documents', icon: <Folder className="w-4 h-4" /> },
  { id: 'progress', label: 'Progress', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'activity', label: 'Activity', icon: <Activity className="w-4 h-4" /> },
];

export interface ProjectTabsProps {
  activeTab: ProjectDetailTabId;
  onTabChange: (tab: ProjectDetailTabId) => void;
  userRole: string;
  handoverId: string;
  handover: ExtendedHandover;
  lead?: Lead;
  proposal?: Proposal;
  engagementLetter?: EngagementLetter;
  requirements?: Requirement[];
  documents?: ProjectDocument[];
  onBack?: () => void;
}

export function ProjectTabs({
  activeTab,
  onTabChange,
  userRole,
  handoverId,
  handover,
  lead,
  proposal,
  engagementLetter,
  requirements = [],
  documents = [],
}: ProjectTabsProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="border-b border-gray-200">
        <div className="flex items-center gap-1 px-6">
          {TAB_CONFIG.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-600 hover:text-red-600 hover:border-red-600'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        {activeTab === 'handover' && (
          <ProjectHandoverTab
            userRole={userRole}
            handover={handover}
            lead={lead}
            proposal={proposal}
            engagementLetter={engagementLetter}
          />
        )}
        {activeTab === 'requirements' && (
          <ProjectRequirementsTab
            handoverId={handoverId}
            userRole={userRole}
            requirements={requirements}
            documents={documents}
          />
        )}
        {activeTab !== 'handover' && activeTab !== 'requirements' && (
          <ComingSoonTab title={`${TAB_CONFIG.find((t) => t.id === activeTab)?.label ?? activeTab}`} />
        )}
      </div>
    </div>
  );
}
