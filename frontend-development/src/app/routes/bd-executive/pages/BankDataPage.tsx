/**
 * BD-Executive: Bank Data Page
 */
import { BankDataManagement } from '../../../../features/bank-data/components/management/BankDataManagement';

export function BankDataPage() {
  const handlePromoteToLead = (bankDataId: string) => {
    console.log('Promote to lead:', bankDataId);
    // In real app: call service to promote bank data to lead
    alert(`Bank data ${bankDataId} promoted to lead!`);
  };

  return (
    <BankDataManagement 
      canEdit={true}
      onPromoteToLead={handlePromoteToLead}
    />
  );
}

