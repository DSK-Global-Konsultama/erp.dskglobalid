import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { StatusChip } from '../../../../features/leads';
import { mockLeads, leadSources, generateDummyLeadsBDMEO } from '../../../../lib/mock-data';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface DashboardPageProps {
  userName: string;
}

export function DashboardPage({ userName }: DashboardPageProps) {
  const [periodFilter, setPeriodFilter] = useState<string>('this-year');
  const [sourcePeriodFilter, setSourcePeriodFilter] = useState<string>('this-year');
  
  const allLeads = [...generateDummyLeadsBDMEO(userName), ...mockLeads];
  const myLeads = allLeads.filter(lead => lead.createdBy === userName);

  // Calculate total leads based on period filter
  const getFilteredLeads = () => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return myLeads.filter(lead => {
      const leadDate = new Date(lead.createdDate);
      
      if (periodFilter === 'this-year') {
        return leadDate >= startOfYear && leadDate <= now;
      } else if (periodFilter === 'this-month') {
        return leadDate >= startOfMonth && leadDate <= now;
      }
      return true;
    });
  };

  const filteredLeadsByPeriod = getFilteredLeads();
  const totalLeadsThisPeriod = filteredLeadsByPeriod.length;

  // Generate chart data based on period
  const getChartData = () => {
    const now = new Date();
    
    if (periodFilter === 'this-year') {
      // Group by month
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      const currentMonth = now.getMonth();
      
      return months.slice(0, currentMonth + 1).map((month, index) => {
        const monthStart = new Date(now.getFullYear(), index, 1);
        const monthEnd = new Date(now.getFullYear(), index + 1, 0);
        if (index === currentMonth) {
          monthEnd.setHours(23, 59, 59, 999);
        }
        
        const count = filteredLeadsByPeriod.filter(lead => {
          const leadDate = new Date(lead.createdDate);
          return leadDate >= monthStart && leadDate <= monthEnd;
        }).length;
        
        return { name: month, value: count };
      });
    } else {
      // Group by week for this month
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const currentDate = new Date(now);
      const weeks: { name: string; start: Date; end: Date }[] = [];
      
      let weekStart = new Date(startOfMonth);
      while (weekStart <= currentDate) {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        if (weekEnd > currentDate) {
          weekEnd.setTime(currentDate.getTime());
        }
        
        weeks.push({
          name: `Minggu ${weeks.length + 1}`,
          start: new Date(weekStart),
          end: new Date(weekEnd),
        });
        
        weekStart.setDate(weekStart.getDate() + 7);
      }
      
      return weeks.map(week => {
        const count = filteredLeadsByPeriod.filter(lead => {
          const leadDate = new Date(lead.createdDate);
          return leadDate >= week.start && leadDate <= week.end;
        }).length;
        
        return { name: week.name, value: count };
      });
    }
  };

  const chartData = getChartData();

  // Filter leads by source period
  const getFilteredLeadsBySourcePeriod = () => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return myLeads.filter(lead => {
      const leadDate = new Date(lead.createdDate);
      
      if (sourcePeriodFilter === 'this-year') {
        return leadDate >= startOfYear && leadDate <= now;
      } else if (sourcePeriodFilter === 'this-month') {
        return leadDate >= startOfMonth && leadDate <= now;
      }
      return true;
    });
  };

  const filteredLeadsForSource = getFilteredLeadsBySourcePeriod();

  const sourceData = leadSources.map(source => ({
    name: source,
    value: filteredLeadsForSource.filter(l => l.source === source).length,
  })).filter(item => item.value > 0);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'];

  const recentLeads = myLeads
    .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
    .slice(0, 5);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads by Source Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Leads by Source</CardTitle>
              <Select value={sourcePeriodFilter} onValueChange={setSourcePeriodFilter}>
                <SelectTrigger className="w-[160px] h-8 text-xs focus:border-black focus:ring-1 focus:ring-black">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="this-year">Tahun Ini</SelectItem>
                  <SelectItem 
                    value="this-month"
                    className="data-[highlighted]:bg-gray-100 data-[highlighted]:text-black"
                  >
                    Bulan Ini
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sourceData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Total Leads by Period */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Total Leads</CardTitle>
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger className="w-[160px] h-8 text-xs focus:border-black focus:ring-1 focus:ring-black">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="this-year">Tahun Ini</SelectItem>
                  <SelectItem 
                    value="this-month"
                    className="data-[highlighted]:bg-gray-100 [&[data-state=checked]]:bg-black [&[data-state=checked]]:text-white [&[data-state=checked]]:font-semibold"
                  >
                    Bulan Ini
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{totalLeadsThisPeriod}</p>
              <p className="text-xs text-gray-600 mt-1">
                {periodFilter === 'this-year' 
                  ? `Dari awal tahun ${new Date().getFullYear()} sampai saat ini`
                  : `Dari awal bulan sampai saat ini`}
              </p>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  stroke="#666"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#666"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  fill="#1e1e1e"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lead Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client Name</TableHead>
                <TableHead>PIC Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentLeads.length > 0 ? (
                recentLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>{lead.company}</TableCell>
                    <TableCell>{lead.clientName}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{lead.phone}</span>
                        <span className="text-xs text-gray-500">{lead.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>{(lead as any).service || '-'}</TableCell>
                    <TableCell>
                      <StatusChip status={lead.status} />
                    </TableCell>
                    <TableCell>{formatDate(lead.createdDate)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                    Tidak ada lead terbaru
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
