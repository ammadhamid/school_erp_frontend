import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsCard from '@/components/dashboard/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Users, DollarSign, AlertCircle, UserPlus, UserCog, FileText, TrendingUp, RefreshCw } from 'lucide-react';
import { dashboardApi } from '@/services/api';
import type { MonthlyCollectionData, ClassWiseStudentData, FeeStatusData, RecentActivity } from '@/services/api';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { DashboardStats } from '@/types';

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyCollectionData[]>([]);
  const [classData, setClassData] = useState<ClassWiseStudentData[]>([]);
  const [feeStatusData, setFeeStatusData] = useState<FeeStatusData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, activitiesData, monthlyCollections, classWiseStudents, feeStatus] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getRecentActivities(),
        dashboardApi.getMonthlyCollections(),
        dashboardApi.getClassWiseStudents(),
        dashboardApi.getFeeStatus(),
      ]);
      
      setStats(statsData);
      setActivities(activitiesData || []);
      setMonthlyData(monthlyCollections || []);
      setClassData(classWiseStudents || []);
      setFeeStatusData(feeStatus || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Use fallback data if API fails
      setStats({
        totalStudents: 0,
        totalStaff: 0,
        totalRevenue: 0,
        pendingFees: 0,
        monthlyCollection: 0,
        newAdmissions: 0,
      });
      setFeeStatusData([
        { name: 'Paid', value: 0, color: 'hsl(var(--success))' },
        { name: 'Pending', value: 0, color: 'hsl(var(--warning))' },
        { name: 'Overdue', value: 0, color: 'hsl(var(--destructive))' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchDashboardData();
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's your school overview.</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <StatsCard 
            title="Total Students" 
            value={stats?.totalStudents || 0} 
            icon={<Users className="h-6 w-6" />} 
            trend={{ value: 5, positive: true }} 
          />
          <StatsCard 
            title="Monthly Collection" 
            value={`PKR ${(stats?.monthlyCollection || 0).toLocaleString()}`} 
            icon={<DollarSign className="h-6 w-6" />} 
            trend={{ value: 12, positive: true }} 
          />
          <StatsCard 
            title="Pending Fees" 
            value={`PKR ${(stats?.pendingFees || 0).toLocaleString()}`} 
            icon={<AlertCircle className="h-6 w-6" />} 
          />
          <StatsCard 
            title="New Admissions" 
            value={stats?.newAdmissions || 0} 
            icon={<UserPlus className="h-6 w-6" />} 
            trend={{ value: 8, positive: true }} 
          />
          <StatsCard 
            title="Staff Count" 
            value={stats?.totalStaff || 0} 
            icon={<UserCog className="h-6 w-6" />} 
          />
        </div>

        <Card>
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              <Link to="/students/add"><Button className="w-full gap-2 bg-gradient-primary"><UserPlus className="h-4 w-4" />New Admission</Button></Link>
              <Link to="/fees/collection"><Button className="w-full gap-2 bg-gradient-success"><DollarSign className="h-4 w-4" />Collect Fee</Button></Link>
              <Link to="/fees/vouchers"><Button className="w-full gap-2 bg-gradient-warning"><FileText className="h-4 w-4" />Generate Voucher</Button></Link>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Monthly Collections</CardTitle></CardHeader>
            <CardContent>
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px' }} 
                      formatter={(value: number) => [`PKR ${value.toLocaleString()}`, 'Collections']}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="collections" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No collection data available
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Class-wise Students</CardTitle></CardHeader>
            <CardContent>
              {classData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={classData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="class" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px' }} 
                      formatter={(value: number) => [value, 'Students']}
                    />
                    <Legend />
                    <Bar dataKey="students" fill="hsl(var(--success))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No student data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.length > 0 ? activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                    <div className={`h-2 w-2 rounded-full mt-2 ${
                      activity.type === 'admission' ? 'bg-success' : 
                      activity.type === 'payment' ? 'bg-primary' : 
                      activity.type === 'voucher' ? 'bg-warning' : 'bg-muted-foreground'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.text}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-muted-foreground text-center py-4">No recent activities</p>
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Fee Status</CardTitle></CardHeader>
            <CardContent>
              {feeStatusData.some(d => d.value > 0) ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie 
                      data={feeStatusData as any[]} 
                      cx="50%" 
                      cy="50%" 
                      labelLine={false} 
                      label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`} 
                      outerRadius={80} 
                      dataKey="value"
                    >
                      {feeStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value}%`, 'Percentage']} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                  No fee data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
