interface StatusChipProps {
  status: string;
}

export function StatusChip({ status }: StatusChipProps) {
  const getStatusStyle = () => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-100 text-blue-700';
      case 'TO_BE_MEET':
        return 'bg-teal-100 text-teal-700';
      case 'MEETING_SCHEDULED':
        return 'bg-purple-100 text-purple-700';
      case 'NEED_NOTULEN':
        return 'bg-amber-100 text-amber-700';
      case 'NEED_PROPOSAL':
        return 'bg-orange-100 text-orange-700';
      case 'NEED_ENGAGEMENT_LETTER':
        return 'bg-cyan-100 text-cyan-700';
      case 'NEED_HANDOVER':
        return 'bg-violet-100 text-violet-700';
      case 'IN_HANDOVER':
        return 'bg-violet-200 text-violet-800';
      case 'IN_PROPOSAL':
        return 'bg-indigo-100 text-indigo-700';
      case 'WAITING_APPROVAL':
        return 'bg-yellow-100 text-yellow-700';
      case 'DEAL_WON':
        return 'bg-green-100 text-green-700';
      case 'ON_HOLD':
        return 'bg-gray-100 text-gray-700';
      case 'DROP':
        return 'bg-red-100 text-red-700';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-600';
      case 'WAITING_CEO_APPROVAL':
      case 'Waiting':
        return 'bg-yellow-100 text-yellow-700';
      case 'REVISION_REQUESTED':
        return 'bg-yellow-100 text-yellow-700';
      case 'APPROVED':
      case 'Approved':
        return 'bg-green-100 text-green-700';
      case 'REJECTED':
      case 'Rejected':
        return 'bg-red-100 text-red-700';
      case 'SENT':
      case 'Sent':
      case 'SENT_TO_PM':
        return 'bg-blue-100 text-blue-700';
      case 'SIGNED':
      case 'Signed':
        return 'bg-green-100 text-green-700';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-700';
      case 'PROPOSAL_EXPIRED':
        return 'bg-red-100 text-red-700';
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-600';
      case 'SCHEDULED':
        return 'bg-purple-100 text-purple-700';
      case 'DONE':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ');
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${getStatusStyle()}`}>
      {formatStatus(status)}
    </span>
  );
}
