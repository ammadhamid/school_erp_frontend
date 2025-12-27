import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserPlus, FileText, Download, Loader2 } from 'lucide-react';
import { studentApi, downloadPdf } from '@/services/api';
import { toast } from '@/hooks/use-toast';
import type { Student } from '@/types';

const Admissions = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdmissions();
  }, []);

  const fetchAdmissions = async () => {
    setLoading(true);
    try {
      // Get admission report - students from last 3 months
      const today = new Date();
      const threeMonthsAgo = new Date(today.setMonth(today.getMonth() - 3));
      const data = await studentApi.getAdmissionReport({
        start: threeMonthsAgo.toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
      });
      setStudents(data);
    } catch (error) {
      console.error('Failed to fetch admissions:', error);
      // Fallback to search all
      try {
        const allStudents = await studentApi.search('');
        setStudents(allStudents.slice(0, 20));
      } catch {
        setStudents([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePrintSlip = async (studentId: number) => {
    try {
      const blob = await studentApi.generateAdmissionVoucher(studentId);
      downloadPdf(blob, `admission-slip-${studentId}.pdf`);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to generate slip', variant: 'destructive' });
    }
  };

  const thisMonthAdmissions = students.filter(s => {
    const admDate = s.admissionDate ? new Date(s.admissionDate) : null;
    return admDate && admDate.getMonth() === new Date().getMonth();
  }).length;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admissions</h1>
            <p className="text-muted-foreground">Manage student admissions and records</p>
          </div>
          <Link to="/students/add">
            <Button className="gap-2 bg-gradient-primary"><UserPlus className="h-4 w-4" />New Admission</Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground">This Month</p>
              <p className="text-3xl font-bold">{thisMonthAdmissions}</p>
              <Badge className="bg-success text-success-foreground">New Admissions</Badge>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground">Last 3 Months</p>
              <p className="text-3xl font-bold">{students.length}</p>
              <Badge variant="secondary">Total Admissions</Badge>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground">Active Students</p>
              <p className="text-3xl font-bold">{students.filter(s => s.studentStatus === 'ACTIVE').length}</p>
              <Badge variant="outline">Currently Enrolled</Badge>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Admissions</CardTitle>
              <Button variant="outline" className="gap-2"><Download className="h-4 w-4" />Export Report</Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>GR Number</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Father Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Admission Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.grNumber}</TableCell>
                      <TableCell>{student.fullName}</TableCell>
                      <TableCell>{student.fatherName}</TableCell>
                      <TableCell>Class {student.className}</TableCell>
                      <TableCell>{student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : '-'}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="gap-2" onClick={() => student.id && handlePrintSlip(student.id)}>
                          <FileText className="h-4 w-4" />Print Slip
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {students.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No admissions found</TableCell></TableRow>
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

export default Admissions;
