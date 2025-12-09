import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';

export function DealsSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Deals</CardTitle>
        <CardDescription>Deals terbaru</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500">Coming soon...</p>
      </CardContent>
    </Card>
  );
}

