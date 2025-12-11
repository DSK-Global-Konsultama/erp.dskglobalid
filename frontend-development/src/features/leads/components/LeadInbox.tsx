import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../../../components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { generateDummyLeadsBDMEO, type Lead } from '../../../lib/mock-data';
import { authService } from '../../../services/authService';

export function LeadInbox() {
  // Check if user is CEO
  const currentUser = authService.getCurrentUser();
  if (!currentUser || currentUser.role !== 'CEO') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900">Access Denied</p>
          <p className="text-sm text-gray-600 mt-1">Only CEO can access this page</p>
        </div>
      </div>
    );
  }
  // Get all leads and filter for NEW status
  const allLeads = generateDummyLeadsBDMEO('Sarah Wijaya');
  const [leads, setLeads] = useState<Lead[]>(() => {
    // Load from localStorage if exists, otherwise use fresh data
    const savedLeads = localStorage.getItem('ceo_leads');
    if (savedLeads) {
      try {
        return JSON.parse(savedLeads);
      } catch {
        return [...allLeads];
      }
    }
    return [...allLeads];
  });
  
  // Save to localStorage whenever leads change
  useEffect(() => {
    localStorage.setItem('ceo_leads', JSON.stringify(leads));
  }, [leads]);
  
  const newLeads = leads.filter(lead => (lead as any).status === 'NEW');

  const handleAction = (leadId: string, action: 'TO_BE_MEET' | 'ON_HOLD' | 'DROP') => {
    const updatedLeads = leads.map(lead => {
      if (lead.id === leadId) {
        const updatedLead = {
          ...lead,
          status: action as any,
          lastActivity: action === 'TO_BE_MEET' 
            ? `CEO moved to To Be Meet - ${new Date().toISOString().split('T')[0]}`
            : action === 'ON_HOLD'
            ? `CEO put on hold - ${new Date().toISOString().split('T')[0]}`
            : `Lead dropped - ${new Date().toISOString().split('T')[0]}`,
        };
        return updatedLead;
      }
      return lead;
    });
    
    setLeads(updatedLeads);
    
    const actionText = action === 'TO_BE_MEET' ? 'To Be Meet' : action === 'ON_HOLD' ? 'On Hold' : 'Dropped';
    toast.success(`Lead berhasil dipindahkan ke ${actionText}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {newLeads.length > 0 && (
        <Alert className="border-orange-500 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-900">Lead Baru!</AlertTitle>
          <AlertDescription className="text-orange-800">
            Ada {newLeads.length} lead baru menunggu review dari Anda
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Client</TableHead>
                  <TableHead className="font-semibold">PIC</TableHead>
                  <TableHead className="font-semibold">Service</TableHead>
                  <TableHead className="font-semibold">Source</TableHead>
                  <TableHead className="font-semibold">Created At</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {newLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                      <div className="flex flex-col items-center">
                        <p className="font-medium text-base">Tidak ada lead baru</p>
                        <p className="text-sm mt-1 text-gray-400">Semua lead sudah diproses</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  newLeads.map((lead) => (
                    <TableRow key={lead.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="py-4">
                        <div>
                          <div className="font-medium text-gray-900">{lead.company}</div>
                          {lead.notes && (
                            <div className="text-sm text-gray-600 mt-1.5 line-clamp-2">{lead.notes}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900">{lead.clientName}</div>
                          <div className="text-sm text-gray-600">{lead.phone}</div>
                          <div className="text-sm text-gray-600">{lead.email}</div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="text-sm text-gray-900">{(lead as any).service || '-'}</span>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge variant="secondary" className="text-xs">
                          {lead.source}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 text-gray-600 text-sm">
                        {formatDate(lead.createdDate)}
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex flex-col gap-2 min-w-[120px]">
                          <Button
                            onClick={() => handleAction(lead.id, 'TO_BE_MEET')}
                            className="w-full bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium transition-colors"
                            size="sm"
                          >
                            To Be Meet
                          </Button>
                          <Button
                            onClick={() => handleAction(lead.id, 'ON_HOLD')}
                            className="w-full bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium transition-colors"
                            size="sm"
                          >
                            On Hold
                          </Button>
                          <Button
                            onClick={() => handleAction(lead.id, 'DROP')}
                            className="w-full bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors"
                            size="sm"
                            variant="destructive"
                          >
                            Drop
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

