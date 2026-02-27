import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsCard from '@/components/dashboard/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, DollarSign, AlertCircle, UserPlus, UserCog, Search, RefreshCw, Eye } from 'lucide-react';
import { dashboardApi, studentApi } from '@/services/api';
import StudentDetailsDialog from '@/components/students/StudentDetailsDialog';
import type { DashboardStats, Student } from '@/types';
import { toast } from '@/hooks/use-toast';

const ManagerDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Student search
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Student details modal
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const statsData = await dashboardApi.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setStats({
        totalStudents: 0,
        totalStaff: 0,
        totalRevenue: 0,
        pendingFees: 0,
        monthlyCollection: 0,
        newAdmissions: 0,
      });
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

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({ title: 'Error', description: 'Please enter GR number or student name', variant: 'destructive' });
      return;
    }
    
    setSearching(true);
    setHasSearched(true);
    try {
      // Try GR number first
      let results: Student[] = [];
      try {
        const student = await studentApi.getByGrNumber(searchQuery);
        if (student) results = [student];
      } catch {
        // Fallback to name search
        results = await studentApi.search(searchQuery);
      }
      setSearchResults(results);
      if (results.length === 0) {
        toast({ title: 'Not Found', description: 'No student found with the given search criteria', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Search Error', description: 'Failed to search for student', variant: 'destructive' });
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleViewStudent = (studentId: number) => {
    setSelectedStudentId(studentId);
    setDetailsOpen(true);
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

        {/* Student Search Section */}
        <Card>
          <CardHeader>
            <CardTitle>Search Student</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by GR Number or Name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-9"
                />
              </div>
              <Button onClick={handleSearch} className="bg-gradient-primary" disabled={searching}>
                {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Search Results */}
        {hasSearched && searchResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Search Results ({searchResults.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {searchResults.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold">
                        {student.fullName?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-medium">{student.fullName}</p>
                        <p className="text-sm text-muted-foreground">
                          GR: {student.grNumber || '-'} | Class: {student.className} - {student.section}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={student.studentStatus === 'ACTIVE' ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground'}>
                        {student.studentStatus || 'Unknown'}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => student.id && handleViewStudent(student.id)}
                        title="View Details"
                      >
                        <Eye className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Student Details Dialog - without fee collection */}
        <StudentDetailsDialog
          studentId={selectedStudentId}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
        />
      </div>
    </DashboardLayout>
  );
};

export default ManagerDashboard;
