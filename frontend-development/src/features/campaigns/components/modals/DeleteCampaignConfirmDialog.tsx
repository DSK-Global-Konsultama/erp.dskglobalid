import { toast } from 'sonner';

import { Dialog, DialogContent } from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';

interface DeleteCampaignConfirmDialogProps {
  open: boolean;
  campaignName: string;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}

export function DeleteCampaignConfirmDialog({
  open,
  campaignName,
  onClose,
  onConfirm
}: DeleteCampaignConfirmDialogProps) {
  const handleConfirm = async () => {
    try {
      await onConfirm();
      toast.success('Campaign berhasil dihapus');
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Gagal menghapus campaign');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? onClose() : undefined)}>
      <DialogContent className="max-w-md">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Hapus Campaign?</h3>
            <p className="text-sm text-gray-600 mt-1">
              Campaign <span className="font-medium">{campaignName}</span> akan dihapus permanen.
              Aksi ini tidak bisa dibatalkan.
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleConfirm}>
              Hapus
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
