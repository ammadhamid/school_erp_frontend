import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, FileText, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const FeeReports = () => {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedClass, setSelectedClass] = useState('');

  // Mock report data
  const mockReportData = [
    {
      id: '1',
      class: '10-A',
      totalStudents: 35,
      feesCollected: 280000,
      feesPending: 70000,
      collectionRate: 80,
    },
    {
      id: '2',
      class: '9-B',
      totalStudents: 40,
      feesCollected: 300000,
      feesPending: 100000,
      collectionRate: 75,
    },
    {
      id: '3',
      class: '8-A',
      totalStudents: 38,
      feesCollected: 266000,
      feesPending: 38000,
      collectionRate: 87,
    },
  ];

  const summaryStats = {
    totalCollection: 846000,
    totalPending: 208000,
    averageCollectionRate: 81,
    totalStudents: 113,
  };

  const handleExportReport = () => {
    toast({
      title: 'Exporting Report',
      description: 'Your report is being prepared for download',
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Fee Reports</h1>
          <p className="text-muted-foreground">View and export fee collection reports</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Collection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-foreground">
                  PKR {summaryStats.totalCollection.toLocaleString()}
                </div>
                <TrendingUp className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-foreground">
                  PKR {summaryStats.totalPending.toLocaleString()}
                </div>
                <TrendingDown className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Collection Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {summaryStats.averageCollectionRate}%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {summaryStats.totalStudents}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filter Reports</CardTitle>
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
                <Button onClick={handleExportReport} className="w-full gap-2">
                  <Download className="h-4 w-4" />
                  Export Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Class-wise Fee Collection Report</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class</TableHead>
                  <TableHead>Total Students</TableHead>
                  <TableHead>Fees Collected</TableHead>
                  <TableHead>Fees Pending</TableHead>
                  <TableHead>Collection Rate</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockReportData.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.class}</TableCell>
                    <TableCell>{report.totalStudents}</TableCell>
                    <TableCell className="text-success font-medium">
                      PKR {report.feesCollected.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-destructive font-medium">
                      PKR {report.feesPending.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${report.collectionRate}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{report.collectionRate}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" title="View Details">
                        <FileText className="h-4 w-4" />
                      </Button>
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

export default FeeReports;
