/**
 * BD-Executive: Bank Data Page
 */
import { BankDataManagement } from '../../../../features/bank-data/components/management/BankDataManagement';
import { leadsService } from '../../../../features/leads/services/leadsService';
import { toast } from 'sonner';

export function BankDataPage() {
  const handlePromoteToLead = async (bankDataId: string) => {
    try {
      const lead = await leadsService.promoteFromBank(bankDataId);
      toast.success(`Berhasil promote ke lead: ${lead.clientName}`);
    } catch (err: any) {
      toast.error(err?.message || 'Gagal promote bank data ke lead');
    }
  };

  return <BankDataManagement canEdit={true} onPromoteToLead={handlePromoteToLead} />;
}


