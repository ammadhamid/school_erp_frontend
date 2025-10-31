import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsCard from '@/components/dashboard/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  DollarSign,
  AlertCircle,
  UserPlus,
  UserCog,
  Calendar,
  FileText,
  TrendingUp,
} from 'lucide-react';
import { mockStudents, mockTransactions, mockStaff } from '@/lib/mockData';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const Dashboard = () => {
  // Calculate stats
  const totalStudents = mockStudents.filter((s) => s.status === 'active').length;
  const todayCollections = mockTransactions
    .filter((t) => t.date === new Date().toISOString().split('T')[0] && t.status === 'paid')
    .reduce((sum, t) => sum + t.paidAmount, 0);
  const pendingFees = mockTransactions
    .filter((t) => t.status !== 'paid')
    .reduce((sum, t) => sum + t.balance, 0);
  const newAdmissions = mockStudents.filter(
    (s) => new Date(s.admissionDate).getMonth() === new Date().getMonth()
  ).length;
  const totalStaff = mockStaff.filter((s) => s.status === 'active').length;

  // Monthly collections data for chart
  const monthlyData = [
    { month: 'Jan', collections: 450000 },
    { month: 'Feb', collections: 520000 },
    { month: 'Mar', collections: 490000 },
    { month: 'Apr', collections: 580000 },
    { month: 'May', collections: 620000 },
    { month: 'Jun', collections: 580000 },
  ];

  // Class-wise student distribution
  const classData = [
    { class: '5th', students: 45 },
    { class: '6th', students: 52 },
    { class: '7th', students: 48 },
    { class: '8th', students: 55 },
    { class: '9th', students: 50 },
    { class: '10th', students: 42 },
  ];

  // Fee status pie chart
  const feeStatusData = [
    { name: 'Paid', value: 65, color: 'hsl(var(--success))' },
    { name: 'Partial', value: 20, color: 'hsl(var(--warning))' },
    { name: 'Pending', value: 15, color: 'hsl(var(--destructive))' },
  ];

  // Recent activities
  const recentActivities = [
    { id: 1, text: 'New student admission: Ahmed Ali Khan', time: '10 mins ago', type: 'admission' },
    { id: 2, text: 'Fee collected: GR-2025-0045 - PKR 8,000', time: '25 mins ago', type: 'payment' },
    { id: 3, text: 'Staff salary processed: Muhammad Hussain', time: '1 hour ago', type: 'payroll' },
    { id: 4, text: 'WhatsApp reminder sent: 25 students', time: '2 hours ago', type: 'notification' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your school overview.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <StatsCard
            title="Total Students"
            value={totalStudents}
            icon={<Users className="h-6 w-6" />}
            trend={{ value: 5, positive: true }}
          />
          <StatsCard
            title="Today's Collections"
            value={`PKR ${todayCollections.toLocaleString()}`}
            icon={<DollarSign className="h-6 w-6" />}
            trend={{ value: 12, positive: true }}
          />
          <StatsCard
            title="Pending Fees"
            value={`PKR ${pendingFees.toLocaleString()}`}
            icon={<AlertCircle className="h-6 w-6" />}
          />
          <StatsCard
            title="New Admissions"
            value={newAdmissions}
            icon={<UserPlus className="h-6 w-6" />}
            trend={{ value: 8, positive: true }}
          />
          <StatsCard
            title="Staff Count"
            value={totalStaff}
            icon={<UserCog className="h-6 w-6" />}
          />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-4">
              <Button className="gap-2 bg-gradient-primary">
                <UserPlus className="h-4 w-4" />
                New Admission
              </Button>
              <Button className="gap-2 bg-gradient-success">
                <DollarSign className="h-4 w-4" />
                Collect Fee
              </Button>
              <Button className="gap-2 bg-gradient-warning">
                <FileText className="h-4 w-4" />
                Generate Voucher
              </Button>
              <Button variant="outline" className="gap-2">
                <Calendar className="h-4 w-4" />
                View Calendar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Monthly Collections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="collections"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Class-wise Students</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={classData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="class" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="students" fill="hsl(var(--success))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities & Fee Status */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                    <div
                      className={`h-2 w-2 rounded-full mt-2 ${
                        activity.type === 'admission'
                          ? 'bg-primary'
                          : activity.type === 'payment'
                          ? 'bg-success'
                          : activity.type === 'payroll'
                          ? 'bg-warning'
                          : 'bg-accent'
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.text}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fee Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={feeStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {feeStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
