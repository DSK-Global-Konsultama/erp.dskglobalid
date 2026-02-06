import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import { Label } from '../../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';
import { projectManagers } from '../../../../lib/mock-data';

interface AssignPMDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPM: string;
  onPMChange: (pm: string) => void;
  onAssign: () => void;
  dialogDescription?: string;
}

export function AssignPMDialog({
  open,
  onOpenChange,
  selectedPM,
  onPMChange,
  onAssign,
  dialogDescription,
}: AssignPMDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Project Manager</DialogTitle>
          {dialogDescription && (
            <DialogDescription>{dialogDescription}</DialogDescription>
          )}
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Project Manager</Label>
            <Select value={selectedPM} onValueChange={onPMChange}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih PM" />
              </SelectTrigger>
              <SelectContent>
                {projectManagers.map((pm) => (
                  <SelectItem key={pm} value={pm}>
                    {pm}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={onAssign}>Assign PM</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
