import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Search, Loader2, Eye } from 'lucide-react';
import { studentApi } from '@/services/api';
import { toast } from '@/hooks/use-toast';
import type { Student } from '@/types';
import StudentDetailsDialog from '@/components/students/StudentDetailsDialog';

const Reports = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await studentApi.getAll();
      setStudents(data);
    } catch (error) {
      console.error('Failed to fetch students:', error);
      toast({ title: 'Error', description: 'Failed to fetch student data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Filters
  const filteredStudents = students.filter((student) => {
    const matchesSearch = !searchQuery.trim() || 
      student.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.grNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.fatherName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = classFilter === 'all' || student.className === classFilter;
    const matchesStatus = statusFilter === 'all' || student.studentStatus === statusFilter;
    return matchesSearch && matchesClass && matchesStatus;
  });

  const classes = Array.from(new Set(students.map((s) => s.className).filter(Boolean))).sort(
    (a, b) => parseInt(a || '0') - parseInt(b || '0')
  );

  // Stats
  const totalActive = students.filter(s => s.studentStatus === 'ACTIVE').length;
  const totalInactive = students.filter(s => s.studentStatus === 'INACTIVE').length;
  const totalLeft = students.filter(s => s.studentStatus === 'LEFT').length;

  const handleViewStudent = (studentId: number) => {
    setSelectedStudentId(studentId);
    setDetailsOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground">Student-wise reports and analytics</p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                  <p className="text-2xl font-bold">{students.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-bold text-success">{totalActive}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Inactive</p>
              <p className="text-2xl font-bold text-warning">{totalInactive}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Left</p>
              <p className="text-2xl font-bold text-destructive">{totalLeft}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by Name, GR Number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls} value={cls || ''}>Class {cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="LEFT">Left</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Student Table */}
        <Card>
          <CardHeader>
            <CardTitle>Student-wise Report ({filteredStudents.length} students)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>GR #</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Father Name</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Admission Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.grNumber || '-'}</TableCell>
                        <TableCell>{student.fullName}</TableCell>
                        <TableCell>{student.fatherName || '-'}</TableCell>
                        <TableCell>{student.className || '-'}</TableCell>
                        <TableCell>{student.section || '-'}</TableCell>
                        <TableCell>{student.parentContact1 || '-'}</TableCell>
                        <TableCell>
                          <Badge className={
                            student.studentStatus === 'ACTIVE' ? 'bg-success text-success-foreground' :
                            student.studentStatus === 'LEFT' ? 'bg-destructive text-destructive-foreground' :
                            'bg-muted text-muted-foreground'
                          }>
                            {student.studentStatus || 'Unknown'}
                          </Badge>
                        </TableCell>
                        <TableCell>{student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : '-'}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => student.id && handleViewStudent(student.id)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredStudents.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                          No students found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <StudentDetailsDialog
          studentId={selectedStudentId}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
        />
      </div>
    </DashboardLayout>
  );
};

export default Reports;
