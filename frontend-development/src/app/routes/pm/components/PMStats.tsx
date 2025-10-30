import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Clock, DollarSign, AlertCircle } from 'lucide-react';

interface PMStatsProps {
  totalProjects: number;
  waitingPayment: number;
  inProgress: number;
  waitingFinal: number;
}

export function PMStats({ totalProjects, waitingPayment, inProgress, waitingFinal }: PMStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm">Total Projects</CardTitle>
          <Clock className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">{totalProjects}</div>
          <p className="text-xs text-gray-500 mt-1">Under my management</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm">Waiting Payment</CardTitle>
          <DollarSign className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold text-orange-600">{waitingPayment}</div>
          <p className="text-xs text-gray-500 mt-1">Belum bisa dimulai</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm">In Progress</CardTitle>
          <Clock className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold text-blue-600">{inProgress}</div>
          <p className="text-xs text-gray-500 mt-1">Sedang dikerjakan</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm">Waiting Final</CardTitle>
          <AlertCircle className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold text-yellow-600">{waitingFinal}</div>
          <p className="text-xs text-gray-500 mt-1">Tunggu pelunasan</p>
        </CardContent>
      </Card>
    </div>
  );
}

