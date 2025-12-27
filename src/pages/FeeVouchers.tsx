import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Search, Plus, Loader2 } from 'lucide-react';
import { voucherApi, downloadPdf } from '@/services/api';
import { toast } from '@/hooks/use-toast';
import type { Voucher } from '@/types';

const FeeVouchers = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const data = await voucherApi.getUnpaid();
      setVouchers(data);
    } catch (error) {
      console.error('Failed to fetch vouchers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async (id: number) => {
    try {
      await voucherApi.markPaid(id);
      toast({ title: 'Success', description: 'Voucher marked as paid' });
      fetchVouchers();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update voucher', variant: 'destructive' });
    }
  };

  const handleDownload = async (id: number) => {
    try {
      const blob = await voucherApi.getPdf(id);
      downloadPdf(blob, `voucher-${id}.pdf`);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to download voucher', variant: 'destructive' });
    }
  };

  const getStatusBadge = (status?: string) => {
    const variants: Record<string, string> = {
      PENDING: 'bg-warning text-warning-foreground',
      PAID: 'bg-success text-success-foreground',
      OVERDUE: 'bg-destructive text-destructive-foreground',
    };
    return <Badge className={variants[status || 'PENDING'] || ''}>{status || 'PENDING'}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Fee Vouchers</h1>
          <p className="text-muted-foreground">Manage monthly fee vouchers</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Unpaid Vouchers</CardTitle>
              <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-64" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Month</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vouchers.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell>{v.id}</TableCell>
                      <TableCell>{v.student?.fullName || v.studentId}</TableCell>
                      <TableCell>{v.month}</TableCell>
                      <TableCell>PKR {v.totalAmount?.toLocaleString()}</TableCell>
                      <TableCell>{v.dueDate ? new Date(v.dueDate).toLocaleDateString() : '-'}</TableCell>
                      <TableCell>{getStatusBadge(v.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => v.id && handleDownload(v.id)}><Download className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => v.id && handleMarkPaid(v.id)}>Mark Paid</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {vouchers.length === 0 && (
                    <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No unpaid vouchers</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default FeeVouchers;
