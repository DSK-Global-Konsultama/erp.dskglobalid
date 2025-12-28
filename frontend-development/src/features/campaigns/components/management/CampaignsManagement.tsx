/**
 * BD_MEO: Campaign List & Management
 */

import { useState, useEffect } from 'react';
import { Search, Plus, Eye, Filter } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import { Input } from '../../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { mockCampaigns } from '../../../../lib/leadManagementMockData';
import type { Campaign, CampaignType, Channel, CampaignStatus } from '../../../../lib/leadManagementTypes';
import { CreateCampaignModal } from '../modals/CreateCampaignModal';
import { getBankDataByCampaign } from '../../../../lib/leadManagementMockData';

export function CampaignsManagement({ onViewDetail }: { onViewDetail: (campaignId: string) => void }) {
  const [campaigns] = useState<Campaign[]>(mockCampaigns);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<CampaignType | 'ALL'>('ALL');
  const [filterChannel, setFilterChannel] = useState<Channel | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<CampaignStatus | 'ALL'>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter campaigns
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'ALL' || campaign.type === filterType;
    const matchesChannel = filterChannel === 'ALL' || campaign.channel === filterChannel;
    const matchesStatus = filterStatus === 'ALL' || campaign.status === filterStatus;
    return matchesSearch && matchesType && matchesChannel && matchesStatus;
  });

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
    return getBankDataByCampaign(campaignId).length;
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
      case 'WEBINAR':
        return 'bg-blue-100 text-blue-800';
      case 'SOCIAL':
        return 'bg-purple-100 text-purple-800';
      case 'FREEBIE':
        return 'bg-green-100 text-green-800';
    }
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
                <SelectItem value="WEBINAR">Webinar</SelectItem>
                <SelectItem value="SOCIAL">Social</SelectItem>
                <SelectItem value="FREEBIE">Freebie</SelectItem>
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
                <SelectItem value="IG">Instagram</SelectItem>
                <SelectItem value="LINKEDIN">LinkedIn</SelectItem>
                <SelectItem value="WEBSITE">Website</SelectItem>
                <SelectItem value="EVENT">Event</SelectItem>
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
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Topic Tag</TableHead>
                  <TableHead>Submissions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCampaigns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                      No campaigns found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedCampaigns.map((campaign) => (
                    <TableRow key={campaign.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">{campaign.name}</div>
                          {campaign.dateRange && (
                            <div className="text-sm text-gray-500">
                              {campaign.dateRange.start} - {campaign.dateRange.end}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${getTypeColor(campaign.type)}`}>
                          {campaign.type}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-700">{campaign.channel}</span>
                      </TableCell>
                      <TableCell>
                        {campaign.topicTag ? (
                          <span className="text-sm text-gray-700">{campaign.topicTag}</span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium text-gray-900">
                          {getSubmissionCount(campaign.id)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(campaign.status)}`}>
                          {campaign.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => onViewDetail(campaign.id)}
                          className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {/* Pagination */}
          {filteredCampaigns.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
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
          // In real app: refetch campaigns
        }}
      />
    </div>
  );
}

