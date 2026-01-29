import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { UserPlus, AlertCircle, Clock } from 'lucide-react';

interface ProjectStatsCardsProps {
  projectsWaitingPM: number;
  projectsWaitingPayment: number;
  projectsInProgress: number;
  projectsWaitingFinal: number;
}

export function ProjectStatsCards({
  projectsWaitingPM,
  projectsWaitingPayment,
  projectsInProgress,
  projectsWaitingFinal,
}: ProjectStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="hover:border-gray-300 hover:shadow-lg transition-all">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm">Waiting PM</CardTitle>
          <UserPlus className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">{projectsWaitingPM}</div>
          <p className="text-xs text-gray-500 mt-1">Belum assign PM</p>
        </CardContent>
      </Card>

      <Card className="hover:border-gray-300 hover:shadow-lg transition-all">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm">Waiting Payment</CardTitle>
          <AlertCircle className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold text-orange-600">{projectsWaitingPayment}</div>
          <p className="text-xs text-gray-500 mt-1">Belum bisa dimulai</p>
        </CardContent>
      </Card>

      <Card className="hover:border-gray-300 hover:shadow-lg transition-all">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm">In Progress</CardTitle>
          <Clock className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold text-blue-600">{projectsInProgress}</div>
          <p className="text-xs text-gray-500 mt-1">Sedang dikerjakan</p>
        </CardContent>
      </Card>

      <Card className="hover:border-gray-300 hover:shadow-lg transition-all">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm">Waiting Final</CardTitle>
          <AlertCircle className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold text-yellow-600">{projectsWaitingFinal}</div>
          <p className="text-xs text-gray-500 mt-1">Selesai, tagih final</p>
        </CardContent>
      </Card>
    </div>
  );
}

