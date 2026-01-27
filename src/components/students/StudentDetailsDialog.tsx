import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  CreditCard, 
  FileText, 
  Loader2,
  GraduationCap,
  Users,
  Hash,
  Building
} from 'lucide-react';
import { studentApi, ledgerApi, paymentApi } from '@/services/api';
import type { Student, LedgerEntry, Payment } from '@/types';

interface StudentDetailsDialogProps {
  studentId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange?: () => void;
}

const StudentDetailsDialog = ({ studentId, open, onOpenChange, onStatusChange }: StudentDetailsDialogProps) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [ledger, setLedger] = useState<LedgerEntry | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [dueAmount, setDueAmount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    if (studentId && open) {
      fetchStudentDetails();
    }
  }, [studentId, open]);

  const fetchStudentDetails = async () => {
    if (!studentId) return;
    
    setLoading(true);
    try {
      // Fetch all student data in parallel
      const [studentData, ledgerData, paymentsData, dueData] = await Promise.all([
        studentApi.getById(studentId).catch(() => null),
        ledgerApi.getByStudent(studentId).catch(() => null),
        paymentApi.getStudentPayments(studentId).catch(() => []),
        studentApi.getStudentDue(studentId).catch(() => 0),
      ]);

      setStudent(studentData);
      setLedger(ledgerData);
      setPayments(paymentsData || []);
      setDueAmount(typeof dueData === 'number' ? dueData : 0);
    } catch (error) {
      console.error('Failed to fetch student details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!studentId) return;
    
    setStatusLoading(true);
    try {
      await studentApi.updateStatus(studentId, newStatus);
      await fetchStudentDetails();
      onStatusChange?.();
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setStatusLoading(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-success text-success-foreground">Active</Badge>;
      case 'INACTIVE':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'LEFT':
        return <Badge variant="destructive">Left</Badge>;
      default:
        return <Badge variant="outline">{status || 'Unknown'}</Badge>;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount?: number) => {
    return `PKR ${(amount || 0).toLocaleString()}`;
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <GraduationCap className="h-6 w-6" />
            Student Details
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : student ? (
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="academic">Academic</TabsTrigger>
              <TabsTrigger value="fees">Fees & Payments</TabsTrigger>
            </TabsList>

            {/* Personal Information Tab */}
            <TabsContent value="personal" className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {student.fullName}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(student.studentStatus)}
                      {student.studentStatus === 'ACTIVE' ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleStatusChange('INACTIVE')}
                          disabled={statusLoading}
                        >
                          {statusLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Deactivate'}
                        </Button>
                      ) : (
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => handleStatusChange('ACTIVE')}
                          disabled={statusLoading}
                        >
                          {statusLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Activate'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">GR Number</p>
                      <p className="font-medium flex items-center gap-1">
                        <Hash className="h-4 w-4" />
                        {student.grNumber || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date of Birth</p>
                      <p className="font-medium flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(student.dateOfBirth)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">B-Form Number</p>
                      <p className="font-medium">{student.bFormNumber || 'N/A'}</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Parent/Guardian Information
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Father's Name</p>
                        <p className="font-medium">{student.fatherName || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Father's CNIC</p>
                        <p className="font-medium">{student.fatherCnic || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Mother's Name</p>
                        <p className="font-medium">{student.motherName || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Mother's CNIC</p>
                        <p className="font-medium">{student.motherCnic || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          Primary Contact
                        </p>
                        <p className="font-medium">{student.parentContact1 || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          Secondary Contact
                        </p>
                        <p className="font-medium">{student.parentContact2 || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Address
                    </p>
                    <p className="font-medium">{student.address || 'N/A'}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Academic Information Tab */}
            <TabsContent value="academic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Academic Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Class</p>
                      <p className="font-medium text-lg">{student.className || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Section</p>
                      <p className="font-medium text-lg">{student.section || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Roll Number</p>
                      <p className="font-medium text-lg">{student.rollNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Group</p>
                      <p className="font-medium">{student.groupName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Admission Date</p>
                      <p className="font-medium flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-success" />
                        {formatDate(student.admissionDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Previous School</p>
                      <p className="font-medium">{student.previousSchool || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Fees & Payments Tab */}
            <TabsContent value="fees" className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Total Due</p>
                      <p className="text-2xl font-bold text-destructive">
                        {formatCurrency(ledger?.totalDue || dueAmount)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Total Paid</p>
                      <p className="text-2xl font-bold text-success">
                        {formatCurrency(ledger?.totalPaid)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Balance</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(ledger?.balance)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Payment History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {payments.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Receipt #</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Discount</TableHead>
                          <TableHead>Method</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payments.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                            <TableCell>{payment.receiptNumber || '-'}</TableCell>
                            <TableCell className="font-medium text-success">
                              {formatCurrency(payment.amount)}
                            </TableCell>
                            <TableCell>{formatCurrency(payment.discount)}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{payment.paymentMethod || 'CASH'}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No payment records found
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Ledger Transactions */}
              {ledger?.transactions && ledger.transactions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Ledger Transactions
                    </CardTitle>
                  </CardHeader>
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
                        {ledger.transactions.map((tx) => (
                          <TableRow key={tx.id}>
                            <TableCell>{formatDate(tx.date)}</TableCell>
                            <TableCell>{tx.description}</TableCell>
                            <TableCell className="text-right text-destructive">
                              {tx.debit > 0 ? formatCurrency(tx.debit) : '-'}
                            </TableCell>
                            <TableCell className="text-right text-success">
                              {tx.credit > 0 ? formatCurrency(tx.credit) : '-'}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(tx.balance)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            Student not found
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StudentDetailsDialog;
