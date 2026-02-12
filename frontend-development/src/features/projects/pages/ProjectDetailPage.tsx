/**
 * Project Detail – access only for COO and PM.
 * Tabs: Overview, Handover, Requirements, Documents, Progress, Activity.
 */

import { useState, useEffect } from 'react';
import { projectApi } from '../api/projectApi';
import { mapWorkflowToDisplayStatus, getWorkflowLabel } from '../model/selectors';
import { ProjectDetailHeaderBar } from '../ui/detail/ProjectDetailHeaderBar';
import { WorkStartAlert } from '../ui/detail/WorkStartAlert';
import { WorkflowStepCard } from '../ui/detail/WorkflowStepCard';
import { ProjectTabs } from '../ui/detail/ProjectTabs';

export type ProjectDetailTabId =
  | 'overview'
  | 'handover'
  | 'requirements'
  | 'documents'
  | 'progress'
  | 'activity';

export interface ProjectDetailPageProps {
  handoverId: string;
  userRole: string;
  onBack: () => void;
}

export function ProjectDetailPage({ handoverId, userRole, onBack }: ProjectDetailPageProps) {
  const isPM = userRole === 'PM';
  const isCOO = userRole.startsWith('COO') || userRole === 'COO';
  if (!isPM && !isCOO) {
    return (
      <div className="p-8">
        <p className="text-lg font-semibold text-gray-900">Access Denied</p>
        <p className="text-sm text-gray-600 mt-1">You do not have permission to view this page.</p>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState<ProjectDetailTabId>('overview');
  const bundle = projectApi.getProjectDetailByHandoverId(handoverId);
  const [progressLogs, setProgressLogs] = useState(bundle?.progressLogs ?? []);

  useEffect(() => {
    const b = projectApi.getProjectDetailByHandoverId(handoverId);
    if (b) setProgressLogs(b.progressLogs ?? []);
  }, [handoverId]);

  if (!bundle) {
    return (
      <div className="p-8">
        <h1 className="text-xl font-semibold text-gray-900">Project Not Found</h1>
      </div>
    );
  }

  const {
    handover,
    lead,
    proposal,
    engagementLetter,
    workStartAllowed,
    paymentGateStatus,
    workflowDisplayStatus,
    requirements = [],
    documents = [],
  } = bundle;
  const projectName =
    (handover as { projectName?: string }).projectName ??
    (handover as { projectTitle?: string }).projectTitle ??
    'Project';
  const clientName = (handover as { clientName?: string }).clientName ?? '';
  const rawWorkflowStatus = workflowDisplayStatus ?? (handover as { workflowStatus?: string }).workflowStatus ?? '';
  const displayStatus = mapWorkflowToDisplayStatus(rawWorkflowStatus);
  const statusLabel = getWorkflowLabel(displayStatus) || undefined;
  const projectPeriod = (handover as { projectPeriod?: string }).projectPeriod;
  const metaLine = [
    `ID: ${handoverId}`,
    projectPeriod ? `Period: ${projectPeriod}` : null,
  ]
    .filter(Boolean)
    .join(' • ');

  return (
    <div>
      <ProjectDetailHeaderBar
        title={projectName}
        subtitle={clientName}
        statusLabel={statusLabel}
        metaLine={metaLine}
        onBack={onBack}
      />
      <WorkStartAlert
        workStartAllowed={workStartAllowed}
        paymentGateStatus={paymentGateStatus}
      />
      <WorkflowStepCard currentStatus={rawWorkflowStatus} />
      <ProjectTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userRole={userRole}
        handoverId={handoverId}
        handover={handover}
        lead={lead}
        proposal={proposal}
        engagementLetter={engagementLetter}
        requirements={requirements}
        documents={documents}
        progressLogs={progressLogs}
        onAddProgress={(log) => setProgressLogs((prev) => [log, ...prev])}
        onBack={onBack}
      />
    </div>
  );
}
