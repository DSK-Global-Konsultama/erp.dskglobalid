/**
 * Project Detail – Requirements tab. List + filter; PM can validate/update status, COO read-only.
 */

import { useState } from 'react';
import { CheckCircle, Clock, FileText, Edit } from 'lucide-react';
import { toast } from 'sonner';
import type { Requirement, ProjectDocument, RequirementStatus } from '../../../../lib/projectWorkflowTypes';
import { canUpdateRequirementStatus } from '../guards/projectViewPolicy';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../components/ui/table';
import { MarkAsReceivedModal } from '../modals/MarkAsReceivedModal';

export interface ProjectRequirementsTabProps {
  handoverId: string;
  userRole: 'COO' | 'PM' | string;
  requirements: Requirement[];
  documents: ProjectDocument[];
}

const statusBadgeBase = 'inline-block min-w-[5.5rem] text-center px-2 py-1 rounded text-xs font-medium';

function getStatusBadge(status: RequirementStatus) {
  switch (status) {
    case 'RECEIVED':
      return <span className={`${statusBadgeBase} bg-blue-100 text-blue-800`}>RECEIVED</span>;
    case 'REQUESTED':
      return <span className={`${statusBadgeBase} bg-orange-100 text-orange-800`}>REQUESTED</span>;
    default:
      return <span className={`${statusBadgeBase} bg-gray-100 text-gray-800`}>—</span>;
  }
}

function getStatusIcon(status: RequirementStatus) {
  switch (status) {
    case 'RECEIVED':
      return <CheckCircle className="w-4 h-4 text-blue-600" />;
    case 'REQUESTED':
      return <Clock className="w-4 h-4 text-orange-600" />;
    default:
      return <Clock className="w-4 h-4 text-gray-400" />;
  }
}

export function ProjectRequirementsTab({
  handoverId: _handoverId,
  userRole,
  requirements,
  documents,
}: ProjectRequirementsTabProps) {
  const [filter, setFilter] = useState<'ALL' | RequirementStatus>('ALL');
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null);

  const canEdit = canUpdateRequirementStatus(userRole);

  const filteredRequirements =
    filter === 'ALL' ? requirements : requirements.filter((r) => r.status === filter);

  const stats = {
    total: requirements.length,
    received: requirements.filter((r) => r.status === 'RECEIVED').length,
    requested: requirements.filter((r) => r.status === 'REQUESTED').length,
  };

  const getEvidenceFiles = (requirementId: string): ProjectDocument[] => {
    const requirement = requirements.find((r) => r.id === requirementId);
    const ids = requirement?.evidenceFiles ?? [];
    if (ids.length === 0) return [];
    return documents.filter((doc) => ids.includes(doc.id));
  };

  const handleOpenModal = (req: Requirement) => {
    if (!canEdit) return;
    setSelectedRequirement(req);
  };

  const handleCloseModal = () => setSelectedRequirement(null);

  const handleMarkAsReceived = () => {
    if (!selectedRequirement) return;
    toast.success('Status diperbarui menjadi RECEIVED');
    handleCloseModal();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Requirements</h3>
          <p className="text-sm text-gray-600 mt-1">Data requirements dan status penerimaan dokumen</p>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer ${
                filter === 'ALL' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              All ({stats.total})
            </button>
            <button
              type="button"
              onClick={() => setFilter('REQUESTED')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer ${
                filter === 'REQUESTED' ? 'bg-orange-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Requested ({stats.requested})
            </button>
            <button
              type="button"
              onClick={() => setFilter('RECEIVED')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer ${
                filter === 'RECEIVED' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Received ({stats.received})
            </button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-200 [&_td]:py-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Evidence</TableHead>
                  {canEdit && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequirements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={canEdit ? 4 : 3} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <p className="text-sm font-medium">Belum ada data requirement</p>
                        <p className="text-xs mt-1">Tidak ada requirement yang sesuai filter</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequirements.map((req) => {
                    const evidenceFiles = getEvidenceFiles(req.id);
                    return (
                      <TableRow key={req.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(req.status)}
                            <div>
                              <p className="font-medium text-gray-900">{req.itemName}</p>
                              {req.notes && <p className="text-xs text-gray-500 mt-0.5">{req.notes}</p>}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(req.status)}</TableCell>
                        <TableCell>
                          {evidenceFiles.length > 0 ? (
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-blue-600" />
                              <span className="text-sm text-blue-600">{evidenceFiles.length} file(s)</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-600">No files</span>
                          )}
                        </TableCell>
                        {canEdit && (
                          <TableCell>
                            {req.status === 'REQUESTED' && (
                              <button
                                type="button"
                                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 hover:underline focus:outline-none focus:underline cursor-pointer"
                                onClick={() => handleOpenModal(req)}
                              >
                                <Edit className="w-3.5 h-3 shrink-0" />
                                Mark as Received
                              </button>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
      </div>

      <MarkAsReceivedModal
        requirement={selectedRequirement}
        open={!!selectedRequirement && canEdit}
        onClose={handleCloseModal}
        onConfirm={handleMarkAsReceived}
      />
    </div>
  );
}
