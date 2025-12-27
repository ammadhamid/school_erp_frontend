import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, FileText, Download, Loader2 } from 'lucide-react';
import { studentApi, ledgerApi, downloadPdf } from '@/services/api';
import { toast } from '@/hooks/use-toast';
import type { Student, LedgerEntry } from '@/types';

const StudentLedger = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [ledger, setLedger] = useState<LedgerEntry | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      let student: Student | null = null;
      try {
        student = await studentApi.getByGrNumber(searchQuery);
      } catch {
        const students = await studentApi.search(searchQuery);
        if (students.length > 0) student = students[0];
      }

      if (student?.id) {
        setSelectedStudent(student);
        const ledgerData = await ledgerApi.getByStudent(student.id);
        setLedger(ledgerData);
      } else {
        toast({ title: 'Student Not Found', variant: 'destructive' });
        setSelectedStudent(null);
        setLedger(null);
      }
    } catch (error) {
      toast({ title: 'Error fetching ledger', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Student Ledger</h1>
          <p className="text-muted-foreground">View complete fee history and balance</p>
        </div>

        <Card>
          <CardHeader><CardTitle>Search Student</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="Enter GR Number or Name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                <span className="ml-2">Search</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {selectedStudent && ledger && (
          <>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Student Details</CardTitle>
                  <Button variant="outline" className="gap-2"><Download className="h-4 w-4" />Export</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div><p className="text-sm text-muted-foreground">GR Number</p><p className="font-semibold">{selectedStudent.grNumber}</p></div>
                  <div><p className="text-sm text-muted-foreground">Name</p><p className="font-semibold">{selectedStudent.fullName}</p></div>
                  <div><p className="text-sm text-muted-foreground">Class</p><p className="font-semibold">{selectedStudent.className} - {selectedStudent.section}</p></div>
                  <div><p className="text-sm text-muted-foreground">Phone</p><p className="font-semibold">{selectedStudent.parentContact1}</p></div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
              <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Total Due</p><p className="text-3xl font-bold">PKR {ledger.totalDue?.toLocaleString() || 0}</p></CardContent></Card>
              <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Total Paid</p><p className="text-3xl font-bold text-success">PKR {ledger.totalPaid?.toLocaleString() || 0}</p></CardContent></Card>
              <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Balance</p><p className="text-3xl font-bold text-destructive">PKR {ledger.balance?.toLocaleString() || 0}</p></CardContent></Card>
            </div>

            <Card>
              <CardHeader><CardTitle>Transaction History</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Debit</TableHead>
                      <TableHead className="text-right">Credit</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ledger.transactions?.map((t, i) => (
                      <TableRow key={i}>
                        <TableCell>{new Date(t.date).toLocaleDateString()}</TableCell>
                        <TableCell>{t.description}</TableCell>
                        <TableCell className="text-right">{t.debit?.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-success">{t.credit?.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-semibold">{t.balance?.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}

        {!selectedStudent && (
          <Card><CardContent className="p-12 text-center"><FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="text-lg text-muted-foreground">Search for a student to view their ledger</p></CardContent></Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentLedger;
