import { Button } from '../../../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../../components/ui/dialog';

interface DeleteFormConfirmDialogProps {
  open: boolean;
  formTitle: string;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}

export function DeleteFormConfirmDialog({
  open,
  formTitle,
  onClose,
  onConfirm,
}: DeleteFormConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? onClose() : undefined)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hapus form?</DialogTitle>
          <DialogDescription>
            Form <span className="font-medium">{formTitle}</span> akan dihapus. Tindakan ini tidak
            bisa dibatalkan.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button variant="destructive" onClick={() => onConfirm()}>
            Hapus
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
