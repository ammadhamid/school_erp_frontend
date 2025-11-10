import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, FileText, Download } from 'lucide-react';
import { mockStudents, mockTransactions } from '@/lib/mockData';

const StudentLedger = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const handleSearch = () => {
    const student = mockStudents.find(
      (s) =>
        s.grNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.phone.includes(searchQuery)
    );
    
    if (student) {
      setSelectedStudent(student);
    } else {
      setSelectedStudent(null);
    }
  };

  const studentTransactions = selectedStudent
    ? mockTransactions.filter((t) => t.studentId === selectedStudent.id)
    : [];

  // Calculate ledger entries
  const ledgerEntries = studentTransactions.map((transaction, index) => {
    const previousBalance = index === 0 ? 0 : studentTransactions
      .slice(0, index)
      .reduce((sum, t) => sum + t.totalAmount - t.paidAmount, 0);
    
    return {
      date: transaction.date,
      description: `Fee Collection - ${transaction.voucherNumber}`,
      voucherNumber: transaction.voucherNumber,
      debit: transaction.totalAmount,
      credit: transaction.paidAmount,
      balance: previousBalance + transaction.totalAmount - transaction.paidAmount,
    };
  });

  const totalBalance = ledgerEntries.length > 0 
    ? ledgerEntries[ledgerEntries.length - 1].balance 
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Student Ledger</h1>
          <p className="text-muted-foreground">View complete fee history and balance</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Search Student</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Enter GR Number or Phone Number"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch} className="gap-2">
                <Search className="h-4 w-4" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {selectedStudent && (
          <>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Student Details</CardTitle>
                  <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Export Ledger
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">GR Number</p>
                    <p className="font-semibold">{selectedStudent.grNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Student Name</p>
                    <p className="font-semibold">{selectedStudent.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Class</p>
                    <p className="font-semibold">{selectedStudent.class} - {selectedStudent.section}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-semibold">{selectedStudent.phone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Total Charged</p>
                    <p className="text-3xl font-bold">
                      PKR {studentTransactions.reduce((sum, t) => sum + t.totalAmount, 0).toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Total Paid</p>
                    <p className="text-3xl font-bold text-success">
                      PKR {studentTransactions.reduce((sum, t) => sum + t.paidAmount, 0).toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Outstanding Balance</p>
                    <p className="text-3xl font-bold text-destructive">
                      PKR {totalBalance.toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Voucher #</TableHead>
                      <TableHead className="text-right">Debit (PKR)</TableHead>
                      <TableHead className="text-right">Credit (PKR)</TableHead>
                      <TableHead className="text-right">Balance (PKR)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ledgerEntries.map((entry, index) => (
                      <TableRow key={index}>
                        <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                        <TableCell>{entry.description}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            {entry.voucherNumber}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{entry.debit.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-success">{entry.credit.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {entry.balance.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}

        {!selectedStudent && (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground">
                Search for a student to view their ledger
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentLedger;
