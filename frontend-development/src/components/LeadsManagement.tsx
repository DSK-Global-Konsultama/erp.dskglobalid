import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { mockLeads } from '../lib/mock-data';
import { toast } from 'sonner';
import { UserPlus, Package } from 'lucide-react';

interface LeadsManagementProps {
  userRole: 'BOD' | 'BD-Content' | 'BD-Executive';
  userName: string;
}

export function LeadsManagement({ userRole, userName }: LeadsManagementProps) {
  const [leads, setLeads] = useState(mockLeads);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleClaimLead = (leadId: string) => {
    const updatedLeads = leads.map(lead => 
      lead.id === leadId 
        ? { ...lead, status: 'claimed' as const, claimedBy: userName, claimedDate: new Date().toISOString().split('T')[0] }
        : lead
    );
    setLeads(updatedLeads);
    toast.success('Lead claimed successfully');
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      available: 'default',
      claimed: 'secondary',
      'follow-up': 'outline',
      deal: 'outline',
      lost: 'destructive',
    };
    return <Badge variant={variants[status] || 'default'}>{status.toUpperCase()}</Badge>;
  };

  // Filter leads based on role
  let displayLeads = leads;
  if (userRole === 'BD-Executive') {
    displayLeads = leads.filter(l => 
      l.status === 'available' || 
      (l.status === 'claimed' && l.claimedBy === userName) ||
      (l.status === 'follow-up' && l.claimedBy === userName) ||
      (l.status === 'deal' && l.claimedBy === userName)
    );
  } else if (userRole === 'BD-Content') {
    displayLeads = leads.filter(l => l.createdBy === userName);
  }

  // Filter by status for BD Executive
  const availableLeads = displayLeads.filter(l => l.status === 'available');
  const myLeads = displayLeads.filter(l => 
    userRole === 'BD-Executive' && l.status !== 'available' && l.claimedBy === userName
  );

  if (userRole === 'BD-Content') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Leads Management</h2>
          <p className="text-gray-500">Leads yang Anda buat</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>My Leads</CardTitle>
            <CardDescription>Total: {displayLeads.length} leads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {displayLeads.map(lead => (
                <div key={lead.id} className="flex items-start justify-between border-b pb-4 last:border-0">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <Package className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{lead.clientName}</p>
                        <p className="text-xs text-gray-500">{lead.company}</p>
                        <p className="text-xs text-gray-400 mt-1">{lead.email} • {lead.phone}</p>
                        <p className="text-xs text-gray-400 mt-1">Source: {lead.source}</p>
                        <p className="text-xs text-gray-500 mt-2">{lead.notes}</p>
                        <p className="text-xs text-gray-400 mt-1">Created: {formatDate(lead.createdDate)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(lead.status)}
                    {lead.claimedBy && <p className="text-xs text-gray-500 mt-1">BD: {lead.claimedBy}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (userRole === 'BD-Executive') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Available Leads</h2>
          <p className="text-gray-500">Claim leads yang tersedia</p>
        </div>

        {availableLeads.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Available to Claim</CardTitle>
              <CardDescription>Total: {availableLeads.length} leads tersedia</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {availableLeads.map(lead => (
                  <div key={lead.id} className="flex items-start justify-between border-b pb-4 last:border-0">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <Package className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{lead.clientName}</p>
                          <p className="text-xs text-gray-500">{lead.company}</p>
                          <p className="text-xs text-gray-400 mt-1">{lead.email} • {lead.phone}</p>
                          <p className="text-xs text-gray-400 mt-1">Source: {lead.source}</p>
                          <p className="text-xs text-gray-500 mt-2">{lead.notes}</p>
                          <p className="text-xs text-gray-400 mt-1">Created: {formatDate(lead.createdDate)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(lead.status)}
                      <Button size="sm" onClick={() => handleClaimLead(lead.id)}>
                        <UserPlus className="w-4 h-4 mr-1" />
                        Claim
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {myLeads.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">My Claimed Leads</CardTitle>
              <CardDescription>Total: {myLeads.length} leads</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myLeads.map(lead => (
                  <div key={lead.id} className="flex items-start justify-between border-b pb-4 last:border-0">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <Package className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{lead.clientName}</p>
                          <p className="text-xs text-gray-500">{lead.company}</p>
                          <p className="text-xs text-gray-400 mt-1">{lead.email} • {lead.phone}</p>
                          <p className="text-xs text-gray-400 mt-1">Source: {lead.source}</p>
                          <p className="text-xs text-gray-500 mt-2">{lead.notes}</p>
                          <p className="text-xs text-gray-400 mt-1">Created: {formatDate(lead.createdDate)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(lead.status)}
                      {lead.claimedBy && <p className="text-xs text-gray-500 mt-1">Claimed: {formatDate(lead.claimedDate!)}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // BOD View
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Leads Management</h2>
        <p className="text-gray-500">View and manage all leads</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Leads</CardTitle>
          <CardDescription>Total: {displayLeads.length} leads</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {displayLeads.map(lead => (
              <div key={lead.id} className="flex items-start justify-between border-b pb-4 last:border-0">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <Package className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{lead.clientName}</p>
                      <p className="text-xs text-gray-500">{lead.company}</p>
                      <p className="text-xs text-gray-400 mt-1">{lead.email} • {lead.phone}</p>
                      <p className="text-xs text-gray-400 mt-1">Source: {lead.source}</p>
                      <p className="text-xs text-gray-500 mt-2">{lead.notes}</p>
                      <div className="flex gap-3 mt-1">
                        <p className="text-xs text-gray-400">Created: {formatDate(lead.createdDate)}</p>
                        {lead.claimedDate && <p className="text-xs text-gray-400">Claimed: {formatDate(lead.claimedDate)}</p>}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {getStatusBadge(lead.status)}
                  <p className="text-xs text-gray-500 mt-1">Created by: {lead.createdBy}</p>
                  {lead.claimedBy && <p className="text-xs text-gray-500">BD: {lead.claimedBy}</p>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

