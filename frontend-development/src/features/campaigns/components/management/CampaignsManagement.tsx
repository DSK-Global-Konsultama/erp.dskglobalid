/**
 * BD_MEO: Campaign List & Management
 */

import { useEffect, useMemo, useState } from 'react';
import { Search, Plus, Eye, Filter, Pencil, Trash2 } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import type { Campaign, CampaignType, Channel, CampaignStatus } from '../../../../lib/leadManagementTypes';
import { CreateCampaignModal } from '../modals/CreateCampaignModal';
import { EditCampaignModal } from '../modals/EditCampaignModal';
import { DeleteCampaignConfirmDialog } from '../modals/DeleteCampaignConfirmDialog';
import { campaignsService } from '../../services/campaignsService';
import { toast } from 'sonner';
import { formatCampaignPeriod } from '../../../../utils/dateFormat';

export function CampaignsManagement({ onViewDetail }: { onViewDetail: (campaignId: string) => void }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [bankDataCount, setBankDataCount] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<CampaignType | 'ALL'>('ALL');
  const [filterChannel, setFilterChannel] = useState<Channel | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<CampaignStatus | 'ALL'>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [deletingCampaign, setDeletingCampaign] = useState<Campaign | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const refetchCampaigns = async () => {
    setLoading(true);
    setError(null);
    try {
      const [campaignRes, bankEntries] = await Promise.all([
        campaignsService.getAll(),
        campaignsService.getBankDataEntries()
      ]);
      setCampaigns(campaignRes);
      const counts: Record<string, number> = {};
      bankEntries.forEach((entry) => {
        counts[entry.campaignId] = (counts[entry.campaignId] || 0) + 1;
      });
      setBankDataCount(counts);
    } catch (err: any) {
      setError(err?.message || 'Gagal memuat data campaign');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetchCampaigns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter campaigns
  const filteredCampaigns = useMemo(
    () =>
      campaigns.filter((campaign) => {
        const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === 'ALL' || campaign.type === filterType;
        const matchesChannel = filterChannel === 'ALL' || campaign.channel === filterChannel;
        const matchesStatus = filterStatus === 'ALL' || campaign.status === filterStatus;
        return matchesSearch && matchesType && matchesChannel && matchesStatus;
      }),
    [campaigns, searchQuery, filterType, filterChannel, filterStatus]
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterType, filterChannel, filterStatus]);

  // Ensure currentPage doesn't exceed totalPages
  useEffect(() => {
    const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [filteredCampaigns.length, currentPage, itemsPerPage]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCampaigns = filteredCampaigns.slice(startIndex, endIndex);

  // Get submission count for each campaign
  const getSubmissionCount = (campaignId: string) => {
    return bankDataCount[campaignId] || 0;
  };

  // Status badge colors
  const getStatusColor = (status: CampaignStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'PAUSED':
        return 'bg-yellow-100 text-yellow-800';
      case 'ENDED':
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Type badge colors
  const getTypeColor = (type: CampaignType) => {
    switch (type) {
      case 'SOCIAL_MEDIA':
        return 'bg-purple-100 text-purple-800';
      case 'FREEBIE':
        return 'bg-green-100 text-green-800';
      case 'EVENT':
        return 'bg-red-100 text-red-800';
    }
  };

  // Format channel display (capitalize first letter only)
  const formatChannel = (channel: Channel) => {
    const map: Partial<Record<Channel, string>> = {
      INSTAGRAM: 'Instagram',
      LINKEDIN: 'LinkedIn',
      WEBSITE: 'Website',
      SEMINAR: 'Seminar',
      WEBINAR: 'Webinar',
      BREVET: 'Brevet'
    };
    return map[channel] || channel;
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select 
              value={filterType === 'ALL' ? 'all' : filterType} 
              onValueChange={(value) => setFilterType(value === 'all' ? 'ALL' : value as CampaignType)}
            >
              <SelectTrigger className="w-[180px] focus:border-black focus:ring-1 focus:ring-black">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="SOCIAL_MEDIA">Social Media</SelectItem>
                <SelectItem value="FREEBIE">Freebie</SelectItem>
                <SelectItem value="EVENT">Event</SelectItem>
              </SelectContent>
            </Select>
            <Select 
              value={filterChannel === 'ALL' ? 'all' : filterChannel} 
              onValueChange={(value) => setFilterChannel(value === 'all' ? 'ALL' : value as Channel)}
            >
              <SelectTrigger className="w-[180px] focus:border-black focus:ring-1 focus:ring-black">
                <SelectValue placeholder="All Channels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                <SelectItem value="INSTAGRAM">Instagram</SelectItem>
                <SelectItem value="LINKEDIN">LinkedIn</SelectItem>
                <SelectItem value="WEBSITE">Website</SelectItem>
                <SelectItem value="SEMINAR">Seminar</SelectItem>
                <SelectItem value="WEBINAR">Webinar</SelectItem>
                <SelectItem value="BREVET">Brevet</SelectItem>
              </SelectContent>
            </Select>
            <Select 
              value={filterStatus === 'ALL' ? 'all' : filterStatus} 
              onValueChange={(value) => setFilterStatus(value === 'all' ? 'ALL' : value as CampaignStatus)}
            >
              <SelectTrigger className="w-[180px] focus:border-black focus:ring-1 focus:ring-black">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="PAUSED">Paused</SelectItem>
                <SelectItem value="ENDED">Ended</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => {
                setSearchQuery('');
                setFilterType('ALL');
                setFilterChannel('ALL');
                setFilterStatus('ALL');
              }}
            >
              <Filter className="w-4 h-4" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Campaigns List</CardTitle>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Campaign
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-6">
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-sm text-gray-600 font-medium">Campaign Name</th>
                  <th className="text-left px-6 py-3 text-sm text-gray-600 font-medium">Type</th>
                  <th className="text-left px-6 py-3 text-sm text-gray-600 font-medium">Channel</th>
                  <th className="text-left px-6 py-3 text-sm text-gray-600 font-medium">Topic Tag</th>
                  <th className="text-left px-6 py-3 text-sm text-gray-600 font-medium">Submissions</th>
                  <th className="text-left px-6 py-3 text-sm text-gray-600 font-medium">Status</th>
                  <th className="text-left px-6 py-3 text-sm text-gray-600 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      Loading campaigns...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-red-600">
                      {error}
                    </td>
                  </tr>
                ) : paginatedCampaigns.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No campaigns found
                    </td>
                  </tr>
                ) : (
                  paginatedCampaigns.map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{campaign.name}</div>
                          {campaign.dateRange && (
                            <div className="text-sm text-gray-500">
                              {formatCampaignPeriod({ start: campaign.dateRange.start, end: campaign.dateRange.end })}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${getTypeColor(campaign.type)}`}>
                          {campaign.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">{formatChannel(campaign.channel)}</span>
                      </td>
                      <td className="px-6 py-4">
                        {campaign.topicTag ? (
                          <span className="text-sm text-gray-700">{campaign.topicTag}</span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">
                          {getSubmissionCount(campaign.id)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${getStatusColor(campaign.status)}`}>
                          {campaign.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onViewDetail(campaign.id)}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>

                          <button
                            onClick={() => setEditingCampaign(campaign)}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                            Edit
                          </button>

                          <button
                            onClick={() => setDeletingCampaign(campaign)}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          {filteredCampaigns.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-white">
              <div className="text-sm text-gray-600">
                Showing {paginatedCampaigns.length} of {filteredCampaigns.length} campaigns
              </div>
              <div className="flex gap-2">
                <button 
                  className="h-8 px-3 rounded-md border bg-background text-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-all"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <button className="h-8 px-3 rounded-md bg-white text-black border border-black text-sm font-medium">
                  {currentPage}
                </button>
                <button 
                  className="h-8 px-3 rounded-md border bg-background text-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-all"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Total Campaigns</div>
          <div className="text-2xl font-semibold text-gray-900">{campaigns.length}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Active</div>
          <div className="text-2xl font-semibold text-green-600">
            {campaigns.filter(c => c.status === 'ACTIVE').length}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Total Submissions</div>
          <div className="text-2xl font-semibold text-blue-600">
            {campaigns.reduce((sum, c) => sum + getSubmissionCount(c.id), 0)}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Avg per Campaign</div>
          <div className="text-2xl font-semibold text-purple-600">
            {campaigns.length > 0 
              ? Math.round(campaigns.reduce((sum, c) => sum + getSubmissionCount(c.id), 0) / campaigns.length)
              : 0
            }
          </div>
        </div>
      </div>

      {/* Create Campaign Modal */}
      <CreateCampaignModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          toast.success('Campaign berhasil dibuat');
          refetchCampaigns();
        }}
      />

      {editingCampaign && (
        <EditCampaignModal
          open={!!editingCampaign}
          campaign={editingCampaign}
          onClose={() => setEditingCampaign(null)}
          onSuccess={(updated) => {
            setCampaigns((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
            setEditingCampaign(null);
          }}
        />
      )}

      {deletingCampaign && (
        <DeleteCampaignConfirmDialog
          open={!!deletingCampaign}
          campaignName={deletingCampaign.name}
          onClose={() => setDeletingCampaign(null)}
          onConfirm={async () => {
            await campaignsService.delete(deletingCampaign.id);
            setCampaigns((prev) => prev.filter((c) => c.id !== deletingCampaign.id));
            setDeletingCampaign(null);
          }}
        />
      )}
    </div>
  );
}

