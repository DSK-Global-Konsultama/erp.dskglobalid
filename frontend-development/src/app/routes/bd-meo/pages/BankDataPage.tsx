/**
 * BD-MEO: Bank Data Page (View Only)
 */
import { BankDataManagement } from '../../../../features/bank-data/components/management/BankDataManagement';

export function BankDataPage() {
  return (
    <BankDataManagement 
      canEdit={false}
    />
  );
}

