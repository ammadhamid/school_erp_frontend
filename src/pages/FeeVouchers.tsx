import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Search, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const FeeVouchers = () => {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock voucher data
  const mockVouchers = [
    {
      id: '1',
      voucherNumber: 'VOC-2025-001',
      grNumber: 'GR-2025-0001',
      studentName: 'Ahmed Ali Khan',
      class: '10-A',
      month: 'January 2025',
      amount: 8000,
      dueDate: '2025-01-10',
      status: 'pending' as const,
    },
    {
      id: '2',
      voucherNumber: 'VOC-2025-002',
      grNumber: 'GR-2025-0002',
      studentName: 'Sara Malik',
      class: '9-B',
      month: 'January 2025',
      amount: 7500,
      dueDate: '2025-01-10',
      status: 'paid' as const,
    },
    {
      id: '3',
      voucherNumber: 'VOC-2025-003',
      grNumber: 'GR-2025-0003',
      studentName: 'Ali Hassan',
      class: '8-A',
      month: 'January 2025',
      amount: 7000,
      dueDate: '2025-01-10',
      status: 'overdue' as const,
    },
  ];

  const filteredVouchers = mockVouchers.filter((voucher) => {
    const matchesSearch =
      searchQuery === '' ||
      voucher.grNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voucher.studentName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClass === '' || voucher.class.startsWith(selectedClass);
    return matchesSearch && matchesClass;
  });

  const handleGenerateVouchers = () => {
    if (!selectedMonth || !selectedClass) {
      toast({
        title: 'Error',
        description: 'Please select month and class',
        variant: 'destructive',
      });
      return;
    }

    // TODO: Call API to generate vouchers
    toast({
      title: 'Success',
      description: `Vouchers generated for ${selectedClass} - ${selectedMonth}`,
    });
  };

  const getStatusBadge = (status: 'pending' | 'paid' | 'overdue') => {
    const variants = {
      pending: 'bg-warning text-warning-foreground',
      paid: 'bg-success text-success-foreground',
      overdue: 'bg-destructive text-destructive-foreground',
    };
    return <Badge className={variants[status]}>{status.toUpperCase()}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Fee Vouchers</h1>
          <p className="text-muted-foreground">Generate and manage monthly fee vouchers</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Generate Vouchers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Month</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2025-01">January 2025</SelectItem>
                    <SelectItem value="2025-02">February 2025</SelectItem>
                    <SelectItem value="2025-03">March 2025</SelectItem>
                    <SelectItem value="2025-04">April 2025</SelectItem>
                    <SelectItem value="2025-05">May 2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Class</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {Array.from({ length: 8 }, (_, i) => i + 5).map((cls) => (
                      <SelectItem key={cls} value={cls.toString()}>
                        Class {cls}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={handleGenerateVouchers} className="w-full gap-2">
                  <Plus className="h-4 w-4" />
                  Generate Vouchers
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Voucher List</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by GR or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Voucher #</TableHead>
                  <TableHead>GR Number</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Month</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVouchers.map((voucher) => (
                  <TableRow key={voucher.id}>
                    <TableCell className="font-medium">{voucher.voucherNumber}</TableCell>
                    <TableCell>{voucher.grNumber}</TableCell>
                    <TableCell>{voucher.studentName}</TableCell>
                    <TableCell>{voucher.class}</TableCell>
                    <TableCell>{voucher.month}</TableCell>
                    <TableCell>PKR {voucher.amount.toLocaleString()}</TableCell>
                    <TableCell>{new Date(voucher.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell>{getStatusBadge(voucher.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" title="View">
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Download">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default FeeVouchers;
