import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Send, FileText } from 'lucide-react';
import { mockStaff } from '@/lib/mockData';
import { toast } from '@/hooks/use-toast';

const Payroll = () => {
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  const handleProcessPayroll = () => {
    toast({
      title: 'Payroll Processed',
      description: `Payroll for ${currentMonth} has been processed successfully.`,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Payroll Management</h1>
            <p className="text-muted-foreground">Process and manage staff salaries</p>
          </div>
          <div className="flex gap-3">
            <Select defaultValue={new Date().getMonth().toString()}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {new Date(2025, i).toLocaleString('default', { month: 'long' })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button className="gap-2 bg-gradient-primary" onClick={handleProcessPayroll}>
              Process Payroll
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Staff</p>
                <p className="text-3xl font-bold">{mockStaff.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Salary</p>
                <p className="text-3xl font-bold">PKR {mockStaff.reduce((sum, s) => sum + s.netSalary, 0).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Processed</p>
                <p className="text-3xl font-bold">{mockStaff.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold">0</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Payroll for {currentMonth}</CardTitle>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export Report
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Basic Pay</TableHead>
                  <TableHead>Allowances</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Net Salary</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockStaff.map((staff) => (
                  <TableRow key={staff.id}>
                    <TableCell className="font-medium">{staff.staffId}</TableCell>
                    <TableCell>{staff.name}</TableCell>
                    <TableCell>{staff.designation}</TableCell>
                    <TableCell>PKR {staff.basicPay.toLocaleString()}</TableCell>
                    <TableCell>PKR {staff.allowances.toLocaleString()}</TableCell>
                    <TableCell>PKR {staff.deductions.toLocaleString()}</TableCell>
                    <TableCell className="font-bold">PKR {staff.netSalary.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" className="gap-2">
                          <FileText className="h-4 w-4" />
                          Slip
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-2">
                          <Send className="h-4 w-4" />
                          Send
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

export default Payroll;
