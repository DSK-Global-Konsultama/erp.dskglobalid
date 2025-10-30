import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Card } from '../../../components/ui/card';
import { AvailableLeadsPage } from './pages/AvailableLeadsPage';
import { MyDealsPage } from './pages/MyDealsPage';
import { Users, HandshakeIcon } from 'lucide-react';

interface BDExecutiveProps {
  userName: string;
}

export function BDExecutiveDashboard({ userName }: BDExecutiveProps) {
  const [activeTab, setActiveTab] = useState('leads');

  return (
    <div>
      {userName ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="leads" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Available Leads
            </TabsTrigger>
            <TabsTrigger value="deals" className="flex items-center gap-2">
              <HandshakeIcon className="w-4 h-4" />
              My Deals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leads">
            <AvailableLeadsPage userName={userName} />
          </TabsContent>
          <TabsContent value="deals">
            <MyDealsPage userName={userName} />
          </TabsContent>
        </Tabs>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-gray-500">Pilih nama user terlebih dahulu</p>
        </Card>
      )}
    </div>
  );
}

