import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, TrendingUp, Users, DollarSign, Wallet, Loader2 } from 'lucide-react';
import { reportApi, downloadPdf } from '@/services/api';
import { toast } from '@/hooks/use-toast';

const reportCategories = [
  {
    title: 'Student Reports',
    icon: Users,
    reports: [
      { name: 'Total Students Report', type: 'students-total' },
      { name: 'Class-wise Students', type: 'students-classwise' },
      { name: 'Section-wise Distribution', type: 'students-section' },
      { name: 'Left Students Report', type: 'students-left' },
      { name: 'Active/Inactive Students', type: 'students-status' },
    ],
  },
  {
    title: 'Financial Reports',
    icon: DollarSign,
    reports: [
      { name: 'Daily Collection Report', type: 'financial-daily' },
      { name: 'Monthly Revenue Report', type: 'financial-monthly' },
      { name: 'Outstanding Fees Report', type: 'financial-outstanding' },
      { name: 'Defaulters List', type: 'financial-defaulters' },
      { name: 'Payment Method Analysis', type: 'financial-payments' },
    ],
  },
  {
    title: 'Staff & Payroll',
    icon: Wallet,
    reports: [
      { name: 'Staff Salary Report', type: 'staff-salary' },
      { name: 'Department-wise Payroll', type: 'staff-department' },
      { name: 'Monthly Payroll Summary', type: 'staff-monthly' },
      { name: 'Staff Attendance Report', type: 'staff-attendance' },
    ],
  },
  {
    title: 'Analytics',
    icon: TrendingUp,
    reports: [
      { name: 'Admission Trends', type: 'analytics-admission' },
      { name: 'Fee Collection Trends', type: 'analytics-fees' },
      { name: 'Class Performance', type: 'analytics-class' },
      { name: 'Revenue Analysis', type: 'analytics-revenue' },
    ],
  },
];

const Reports = () => {
  const [loadingReport, setLoadingReport] = useState<string | null>(null);

  const handleExportReport = async (reportType: string, reportName: string) => {
    setLoadingReport(reportType);
    try {
      const blob = await reportApi.generate(reportType);
      downloadPdf(blob, `${reportName.toLowerCase().replace(/\s+/g, '-')}.pdf`);
      toast({ title: 'Success', description: 'Report downloaded successfully' });
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast({ title: 'Info', description: 'Report generation - connect to backend for full functionality' });
    } finally {
      setLoadingReport(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground">Generate comprehensive reports and insights</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {reportCategories.map((category) => {
            const Icon = category.icon;
            return (
              <Card key={category.title}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Icon className="h-5 w-5" />{category.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {category.reports.map((report) => (
                      <div key={report.type} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{report.name}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="gap-2" 
                          onClick={() => handleExportReport(report.type, report.name)}
                          disabled={loadingReport === report.type}
                        >
                          {loadingReport === report.type ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                          Export
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
