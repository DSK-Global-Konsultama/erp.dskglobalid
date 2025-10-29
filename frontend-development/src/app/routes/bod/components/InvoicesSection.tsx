import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';

export function InvoicesSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Invoices</CardTitle>
        <CardDescription>Invoice terbaru</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500">Coming soon...</p>
      </CardContent>
    </Card>
  );
}

