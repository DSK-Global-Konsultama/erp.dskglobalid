import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent } from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Textarea } from '../../../components/ui/textarea';
import { Button } from '../../../components/ui/button';
import { type Lead } from '../../../lib/mock-data';

interface AddLeadModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (lead: Omit<Lead, 'id' | 'status' | 'createdDate' | 'createdBy'> & { service?: string }) => void;
  editingLead?: Lead & { service?: string } | null;
}

const services = [
  'Tax Consulting',
  'Legal Consulting',
  'Audit Services',
  'Financial Advisory',
  'Web Development',
];

const sources = [
  'Referral',
  'Website',
  'LinkedIn',
  'Cold Call',
  'Exhibition',
  'Social Media',
  'Facebook',
  'Instagram',
  'Event',
  'Other',
];

export function AddLeadModal({ open, onClose, onSave, editingLead }: AddLeadModalProps) {
  const [formData, setFormData] = useState({
    clientName: '',
    company: '',
    email: '',
    phone: '',
    source: 'Facebook' as Lead['source'],
    service: '',
    notes: '',
  });

  useEffect(() => {
    if (editingLead) {
      setFormData({
        clientName: editingLead.clientName,
        company: editingLead.company,
        email: editingLead.email,
        phone: editingLead.phone,
        source: editingLead.source,
        service: (editingLead as any).service || '',
        notes: editingLead.notes,
      });
    } else {
      setFormData({
        clientName: '',
        company: '',
        email: '',
        phone: '',
        source: 'Facebook',
        service: '',
        notes: '',
      });
    }
  }, [editingLead, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { service, ...leadData } = formData;
    onSave({ ...leadData, service: service || undefined });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold">{editingLead ? 'Edit Lead' : 'Tambah Lead Baru'}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Client Name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                required
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full"
                placeholder="PT Example Company"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                PIC Name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                required
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                className="w-full"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                PIC Phone <span className="text-red-500">*</span>
              </label>
              <Input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full"
                placeholder="+62 812-3456-7890"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                PIC Email <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Service
              </label>
              <Select
                value={formData.service}
                onValueChange={(value) => setFormData({ ...formData, service: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service} value={service}>
                      {service}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Source <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.source}
                onValueChange={(value: Lead['source']) => setFormData({ ...formData, source: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sources.map((source) => (
                    <SelectItem key={source} value={source}>
                      {source}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Initial Notes
            </label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className="w-full"
              placeholder="Add any initial notes about this lead..."
            />
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
            >
              {editingLead ? 'Update Lead' : 'Tambah Lead'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

