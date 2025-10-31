import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, TrendingUp, Users, DollarSign, Wallet } from 'lucide-react';

const reportCategories = [
  {
    title: 'Student Reports',
    icon: Users,
    reports: [
      'Total Students Report',
      'Class-wise Students',
      'Section-wise Distribution',
      'Left Students Report',
      'Active/Inactive Students',
    ],
  },
  {
    title: 'Financial Reports',
    icon: DollarSign,
    reports: [
      'Daily Collection Report',
      'Monthly Revenue Report',
      'Outstanding Fees Report',
      'Defaulters List',
      'Payment Method Analysis',
    ],
  },
  {
    title: 'Staff & Payroll',
    icon: Wallet,
    reports: [
      'Staff Salary Report',
      'Department-wise Payroll',
      'Monthly Payroll Summary',
      'Staff Attendance Report',
    ],
  },
  {
    title: 'Analytics',
    icon: TrendingUp,
    reports: [
      'Admission Trends',
      'Fee Collection Trends',
      'Class Performance',
      'Revenue Analysis',
    ],
  },
];

const Reports = () => {
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
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    {category.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {category.reports.map((report) => (
                      <div
                        key={report}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{report}</span>
                        </div>
                        <Button variant="ghost" size="sm" className="gap-2">
                          <Download className="h-4 w-4" />
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
