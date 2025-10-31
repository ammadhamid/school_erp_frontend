import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserPlus, FileText, Download } from 'lucide-react';
import { mockStudents } from '@/lib/mockData';
import { Link } from 'react-router-dom';

const Admissions = () => {
  const recentAdmissions = mockStudents
    .filter((s) => new Date(s.admissionDate) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000))
    .slice(0, 20);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admissions</h1>
            <p className="text-muted-foreground">Manage student admissions and records</p>
          </div>
          <Link to="/students/add">
            <Button className="gap-2 bg-gradient-primary">
              <UserPlus className="h-4 w-4" />
              New Admission
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">This Month</p>
                <p className="text-3xl font-bold">{recentAdmissions.filter(s => new Date(s.admissionDate).getMonth() === new Date().getMonth()).length}</p>
                <Badge className="bg-success text-success-foreground">New Admissions</Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Last 3 Months</p>
                <p className="text-3xl font-bold">{recentAdmissions.length}</p>
                <Badge variant="secondary">Total Admissions</Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold">5</p>
                <Badge variant="outline">Applications</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Admissions</CardTitle>
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
                  <TableHead>GR Number</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Father Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Admission Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentAdmissions.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.grNumber}</TableCell>
                    <TableCell>{student.fullName}</TableCell>
                    <TableCell>{student.fatherName}</TableCell>
                    <TableCell>Class {student.class}</TableCell>
                    <TableCell>{new Date(student.admissionDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="gap-2">
                        <FileText className="h-4 w-4" />
                        Print Slip
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

export default Admissions;
