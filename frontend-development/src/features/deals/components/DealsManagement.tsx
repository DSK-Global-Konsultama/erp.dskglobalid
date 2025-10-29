import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Textarea } from '../../../components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '../../../components/ui/radio-group';
import { mockDeals, type Deal, mockLeads, type Service, type EL } from '../../../lib/mock-data';
import { Plus, FileText, Trash2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface DealsManagementProps {
  userRole: 'BOD' | 'BD-Executive';
  userName: string;
}

export function DealsManagement({ userRole, userName }: DealsManagementProps) {
  const [deals, setDeals] = useState<Deal[]>(mockDeals);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDetailOpen, setIsViewDetailOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [paymentScheme, setPaymentScheme] = useState<'50-50' | '50-35-15' | '40-30-30' | 'custom'>('50-50');
  const [customTerms, setCustomTerms] = useState<{ percentage: number; description: string }[]>([
    { percentage: 50, description: 'Pembayaran awal saat EL disetujui' },
    { percentage: 50, description: 'Pelunasan saat project selesai' },
  ]);
  
  const [newDeal, setNewDeal] = useState({
    leadId: '',
    clientNeeds: '',
    elStrategy: 'single' as 'single' | 'separate',
  });

  const [services, setServices] = useState<Omit<Service, 'id' | 'elId'>[]>([
    { name: '', description: '', estimatedValue: 0 },
  ]);

  // BD Executive only sees their own deals
  const filteredDeals = userRole === 'BD-Executive' 
    ? deals.filter(d => d.bdExecutive === userName)
    : deals;

  // BD Executive can only use leads they claimed
  const availableLeads = mockLeads.filter(l => {
    if (userRole === 'BD-Executive') {
      return l.status === 'deal' && l.claimedBy === userName;
    }
    return l.status === 'deal';
  });

  const handleAddService = () => {
    setServices([...services, { name: '', description: '', estimatedValue: 0 }]);
  };

  const handleRemoveService = (index: number) => {
    if (services.length > 1) {
      setServices(services.filter((_, i) => i !== index));
    }
  };

  const handleServiceChange = (index: number, field: keyof Omit<Service, 'id' | 'elId'>, value: string | number) => {
    const updated = [...services];
    updated[index] = { ...updated[index], [field]: value };
    setServices(updated);
  };

  const handleAddDeal = () => {
    const selectedLead = mockLeads.find(l => l.id === newDeal.leadId);
    if (!selectedLead) return;

    // Validate payment terms
    const totalPercentage = customTerms.reduce((sum, t) => sum + t.percentage, 0);
    if (totalPercentage !== 100) {
      toast.error('Total persentase termin harus 100%!');
      return;
    }

    const servicesWithId: Service[] = services.map((s, index) => ({
      ...s,
      id: `S${String(Date.now() + index).slice(-3)}`,
    }));

    // Create payment terms object
    const paymentTerms = {
      scheme: paymentScheme,
      terms: customTerms,
    };

    // Create ELs based on strategy
    let els: EL[] = [];
    if (newDeal.elStrategy === 'single') {
      // Single EL for all services
      const elId = `EL${String(Date.now()).slice(-3)}`;
      els = [{
        id: elId,
        serviceIds: servicesWithId.map(s => s.id),
        status: 'draft' as const,
        paymentTerms: paymentTerms,
      }];
      servicesWithId.forEach(s => s.elId = elId);
    } else {
      // Separate EL for each service
      els = servicesWithId.map((s, index) => {
        const elId = `EL${String(Date.now() + index).slice(-3)}`;
        s.elId = elId;
        return {
          id: elId,
          serviceIds: [s.id],
          status: 'draft' as const,
          paymentTerms: paymentTerms,
        };
      });
    }

    const totalValue = servicesWithId.reduce((sum, s) => sum + s.estimatedValue, 0);

    const deal: Deal = {
      id: `D${String(deals.length + 1).padStart(3, '0')}`,
      leadId: newDeal.leadId,
      clientName: selectedLead.clientName,
      company: selectedLead.company,
      services: servicesWithId,
      totalDealValue: totalValue,
      proposalStatus: 'draft',
      els: els,
      elStrategy: newDeal.elStrategy,
      bdExecutive: userName,
      createdDate: new Date().toISOString().split('T')[0],
      clientNeeds: newDeal.clientNeeds,
    };

    setDeals([deal, ...deals]);
    setIsAddDialogOpen(false);
    setNewDeal({ leadId: '', clientNeeds: '', elStrategy: 'single' });
    setServices([{ name: '', description: '', estimatedValue: 0 }]);
    
    // Reset payment terms to default
    setPaymentScheme('50-50');
    setCustomTerms([
      { percentage: 50, description: 'Pembayaran awal saat EL disetujui' },
      { percentage: 50, description: 'Pelunasan saat project selesai' },
    ]);
    
    toast.success(`Deal berhasil dibuat dengan ${servicesWithId.length} layanan!`);
  };

  const updateProposalStatus = (id: string, status: Deal['proposalStatus']) => {
    const updatedDeals = deals.map(d => {
      if (d.id === id) {
        const updates: Partial<Deal> = { proposalStatus: status };
        if (status === 'submitted') {
          updates.proposalSubmittedDate = new Date().toISOString().split('T')[0];
        } else if (status === 'approved') {
          updates.proposalApprovedDate = new Date().toISOString().split('T')[0];
        }
        return { ...d, ...updates };
      }
      return d;
    });
    
    setDeals(updatedDeals);
    toast.success('Status proposal diupdate!');
  };

  const updateELStatus = (dealId: string, elId: string, status: EL['status']) => {
    const updatedDeals = deals.map(d => {
      if (d.id === dealId) {
        const updatedEls = d.els.map(el => {
          if (el.id === elId) {
            const updates: Partial<EL> = { status };
            if (status === 'submitted') {
              updates.submittedDate = new Date().toISOString().split('T')[0];
            } else if (status === 'approved') {
              updates.approvedDate = new Date().toISOString().split('T')[0];
            }
            return { ...el, ...updates };
          }
          return el;
        });
        return { ...d, els: updatedEls };
      }
      return d;
    });
    
    setDeals(updatedDeals);
    toast.success('Status EL diupdate!');
  };

  const handlePaymentSchemeChange = (scheme: typeof paymentScheme) => {
    setPaymentScheme(scheme);
    
    // Set default terms based on scheme
    if (scheme === '50-50') {
      setCustomTerms([
        { percentage: 50, description: 'Pembayaran awal saat EL disetujui' },
        { percentage: 50, description: 'Pelunasan saat project selesai' },
      ]);
    } else if (scheme === '50-35-15') {
      setCustomTerms([
        { percentage: 50, description: 'Pembayaran awal saat EL disetujui' },
        { percentage: 35, description: 'Progress 50% pengerjaan' },
        { percentage: 15, description: 'Pelunasan saat project selesai' },
      ]);
    } else if (scheme === '40-30-30') {
      setCustomTerms([
        { percentage: 40, description: 'Pembayaran awal saat EL disetujui' },
        { percentage: 30, description: 'Progress 50% pengerjaan' },
        { percentage: 30, description: 'Pelunasan saat project selesai' },
      ]);
    }
  };

  const addCustomTerm = () => {
    setCustomTerms([...customTerms, { percentage: 0, description: '' }]);
  };

  const removeCustomTerm = (index: number) => {
    if (customTerms.length > 1) {
      setCustomTerms(customTerms.filter((_, i) => i !== index));
    }
  };

  const updateCustomTerm = (index: number, field: 'percentage' | 'description', value: number | string) => {
    const updated = [...customTerms];
    updated[index] = { ...updated[index], [field]: value };
    setCustomTerms(updated);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: 'default' | 'secondary' | 'outline'; className?: string }> = {
      draft: { variant: 'default' },
      submitted: { variant: 'secondary' },
      approved: { variant: 'outline', className: 'bg-green-50 text-green-700 border-green-200' },
    };
    const labels: Record<string, string> = {
      draft: 'Draft',
      submitted: 'Submitted',
      approved: 'Approved',
    };
    const { variant, className } = config[status];
    return <Badge variant={variant} className={className}>{labels[status]}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {userRole === 'BD-Executive' ? 'My Deals' : 'All Deals'}
          </h2>
          <p className="text-gray-500">
            {userRole === 'BD-Executive' 
              ? 'BD Executive menggali kebutuhan client, buat proposal dan EL'
              : 'Monitor semua deals'
            }
          </p>
        </div>
        {userRole === 'BD-Executive' && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Deal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Deal</DialogTitle>
                <DialogDescription>Convert lead menjadi deal dengan detail layanan</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="leadId">Pilih Lead (yang sudah saya claim)</Label>
                  <Select value={newDeal.leadId} onValueChange={(value) => setNewDeal({ ...newDeal, leadId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih lead" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableLeads.map(lead => (
                        <SelectItem key={lead.id} value={lead.id}>
                          {lead.clientName} - {lead.company}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientNeeds">Kebutuhan Client</Label>
                  <Textarea
                    id="clientNeeds"
                    value={newDeal.clientNeeds}
                    onChange={e => setNewDeal({ ...newDeal, clientNeeds: e.target.value })}
                    placeholder="Deskripsikan kebutuhan dan requirement dari client..."
                    rows={3}
                  />
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <Label>Layanan yang Dibutuhkan</Label>
                    <Button size="sm" variant="outline" onClick={handleAddService}>
                      <Plus className="w-3 h-3 mr-1" />
                      Tambah Layanan
                    </Button>
                  </div>

                  {services.map((service, index) => (
                    <div key={index} className="border rounded-lg p-4 mb-3 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm">Layanan {index + 1}</span>
                        {services.length > 1 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveService(index)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label>Nama Layanan</Label>
                          <Input
                            value={service.name}
                            onChange={e => handleServiceChange(index, 'name', e.target.value)}
                            placeholder="e.g., Website Development, Mobile App"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Deskripsi</Label>
                          <Textarea
                            value={service.description}
                            onChange={e => handleServiceChange(index, 'description', e.target.value)}
                            placeholder="Detail layanan..."
                            rows={2}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Estimasi Nilai</Label>
                          <Input
                            type="number"
                            value={service.estimatedValue || ''}
                            onChange={e => handleServiceChange(index, 'estimatedValue', Number(e.target.value))}
                            placeholder="50000000"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {services.length > 1 && (
                    <div className="space-y-2 mt-4">
                      <Label>Strategi EL</Label>
                      <RadioGroup value={newDeal.elStrategy} onValueChange={(value: 'single' | 'separate') => setNewDeal({ ...newDeal, elStrategy: value })}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="single" id="single" />
                          <Label htmlFor="single" className="font-normal">
                            Satu EL untuk semua layanan
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="separate" id="separate" />
                          <Label htmlFor="separate" className="font-normal">
                            EL terpisah per layanan
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  )}

                  <div className="space-y-2 mt-4">
                    <Label>Termin Pembayaran (sesuai kesepakatan di EL)</Label>
                    <Select value={paymentScheme} onValueChange={(value: typeof paymentScheme) => handlePaymentSchemeChange(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="50-50">50% - 50% (2 Termin)</SelectItem>
                        <SelectItem value="50-35-15">50% - 35% - 15% (3 Termin)</SelectItem>
                        <SelectItem value="40-30-30">40% - 30% - 30% (3 Termin)</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Detail Termin */}
                  <div className="mt-4 border rounded-lg p-3 bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm">Detail Termin</Label>
                      {paymentScheme === 'custom' && (
                        <Button size="sm" variant="outline" onClick={addCustomTerm}>
                          <Plus className="w-3 h-3 mr-1" />
                          Tambah Termin
                        </Button>
                      )}
                    </div>

                    {customTerms.map((term, index) => (
                      <div key={index} className="border rounded-lg p-3 mb-2 bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm">Termin {index + 1}</span>
                          {paymentScheme === 'custom' && customTerms.length > 1 && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeCustomTerm(index)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label className="text-xs">Persentase (%)</Label>
                            <Input
                              type="number"
                              value={term.percentage}
                              onChange={e => updateCustomTerm(index, 'percentage', Number(e.target.value))}
                              disabled={paymentScheme !== 'custom'}
                              min={0}
                              max={100}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Nominal</Label>
                            <Input
                              value={formatCurrency((services.reduce((sum, s) => sum + (s.estimatedValue || 0), 0)) * term.percentage / 100)}
                              disabled
                            />
                          </div>
                        </div>
                        <div className="space-y-1 mt-2">
                          <Label className="text-xs">Deskripsi</Label>
                          <Input
                            value={term.description}
                            onChange={e => updateCustomTerm(index, 'description', e.target.value)}
                            placeholder="e.g., Pembayaran awal saat EL disetujui"
                          />
                        </div>
                      </div>
                    ))}

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mt-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Total Persentase:</span>
                        <span className={customTerms.reduce((sum, t) => sum + t.percentage, 0) === 100 ? 'text-green-600' : 'text-red-600'}>
                          {customTerms.reduce((sum, t) => sum + t.percentage, 0)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                    <p className="text-sm">
                      <span className="text-gray-700">Total Estimasi: </span>
                      <span className="font-semibold">
                        {formatCurrency(services.reduce((sum, s) => sum + (s.estimatedValue || 0), 0))}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Batal
                </Button>
                <Button onClick={handleAddDeal}>Create Deal</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Deals ({filteredDeals.length})</CardTitle>
          <CardDescription>
            {userRole === 'BD-Executive' && 'BD Executive handle proposal & EL'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Layanan</TableHead>
                  <TableHead>Total Nilai</TableHead>
                  <TableHead>Proposal</TableHead>
                  <TableHead>EL Status</TableHead>
                  <TableHead>BD Executive</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeals.map(deal => {
                  const allELsApproved = deal.els.every(el => el.status === 'approved');
                  
                  return (
                    <TableRow key={deal.id}>
                      <TableCell>{deal.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{deal.clientName}</p>
                          <p className="text-xs text-gray-500">{deal.company}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {deal.services.length} Layanan
                        </Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(deal.totalDealValue)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {getStatusBadge(deal.proposalStatus)}
                          {userRole === 'BD-Executive' && deal.proposalStatus === 'draft' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => updateProposalStatus(deal.id, 'submitted')}
                            >
                              Submit
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {deal.elStrategy === 'single' ? (
                            <Badge variant="outline">{deal.els.length} EL (Combined)</Badge>
                          ) : (
                            <Badge variant="outline">{deal.els.length} ELs (Separate)</Badge>
                          )}
                          {allELsApproved && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 mt-1">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              All Approved
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{deal.bdExecutive}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedDeal(deal);
                            setIsViewDetailOpen(true);
                          }}
                        >
                          <FileText className="w-3 h-3 mr-1" />
                          Detail
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Detail Dialog */}
      <Dialog open={isViewDetailOpen} onOpenChange={setIsViewDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Deal: {selectedDeal?.clientName}</DialogTitle>
            <DialogDescription>{selectedDeal?.company}</DialogDescription>
          </DialogHeader>
          {selectedDeal && (
            <div className="space-y-4 py-4">
              <div>
                <Label>Kebutuhan Client:</Label>
                <p className="text-sm text-gray-700 mt-1">{selectedDeal.clientNeeds}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status Proposal:</Label>
                  <div className="mt-1">{getStatusBadge(selectedDeal.proposalStatus)}</div>
                  {selectedDeal.proposalApprovedDate && (
                    <p className="text-xs text-gray-500 mt-1">Approved: {formatDate(selectedDeal.proposalApprovedDate)}</p>
                  )}
                </div>
                <div>
                  <Label>Strategi EL:</Label>
                  <p className="text-sm mt-1">
                    {selectedDeal.elStrategy === 'single' ? 'Satu EL untuk semua' : 'EL terpisah per layanan'}
                  </p>
                </div>
              </div>

              <div>
                <Label>Daftar Layanan ({selectedDeal.services.length}):</Label>
                <div className="space-y-3 mt-2">
                  {selectedDeal.services.map((service, index) => {
                    const serviceEL = selectedDeal.els.find(el => el.serviceIds.includes(service.id));
                    
                    return (
                      <div key={service.id} className="border rounded-lg p-3 bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm">
                              <span className="text-gray-500">Layanan {index + 1}:</span>{' '}
                              <span>{service.name}</span>
                            </p>
                            <p className="text-xs text-gray-600 mt-1">{service.description}</p>
                            <p className="text-sm mt-2">{formatCurrency(service.estimatedValue)}</p>
                            
                            {serviceEL && (
                              <div className="mt-3 pt-3 border-t">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500">EL {serviceEL.id}:</span>
                                  {getStatusBadge(serviceEL.status)}
                                </div>
                                
                                {/* Payment Terms */}
                                {serviceEL.paymentTerms && (
                                  <div className="mt-2 bg-white rounded border border-gray-200 p-2">
                                    <p className="text-xs text-gray-500 mb-1">Payment Terms:</p>
                                    <Badge variant="secondary" className="text-xs">
                                      {serviceEL.paymentTerms.scheme === '50-50' && '50% - 50%'}
                                      {serviceEL.paymentTerms.scheme === '50-35-15' && '50% - 35% - 15%'}
                                      {serviceEL.paymentTerms.scheme === '40-30-30' && '40% - 30% - 30%'}
                                      {serviceEL.paymentTerms.scheme === 'custom' && 'Custom'}
                                    </Badge>
                                  </div>
                                )}
                                
                                {userRole === 'BD-Executive' && selectedDeal.proposalStatus === 'approved' && (
                                  <div className="flex gap-2 mt-2">
                                    {serviceEL.status === 'draft' && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => updateELStatus(selectedDeal.id, serviceEL.id, 'submitted')}
                                      >
                                        Submit EL
                                      </Button>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Deal Value:</span>
                  <span className="text-lg font-semibold">{formatCurrency(selectedDeal.totalDealValue)}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDetailOpen(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
