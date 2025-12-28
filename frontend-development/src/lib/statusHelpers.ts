/**
 * Status Helper Functions
 */
import type { BankDataTriageStatus } from './leadManagementTypes';

export interface StatusBadge {
  label: string;
  color: string;
}

export function getTriageStatusBadge(status: BankDataTriageStatus): StatusBadge {
  switch (status) {
    case 'RAW_NEW':
      return {
        label: 'New',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
      };
    case 'PROMOTED_TO_LEAD':
      return {
        label: 'Promoted',
        color: 'bg-green-100 text-green-800 border-green-200'
      };
    case 'REJECTED':
      return {
        label: 'Rejected',
        color: 'bg-red-100 text-red-800 border-red-200'
      };
    default:
      return {
        label: status,
        color: 'bg-gray-100 text-gray-800 border-gray-200'
      };
  }
}

