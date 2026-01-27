import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { FileText, Download, Plus, Loader2, AlertTriangle, RefreshCw, Users, Calendar } from 'lucide-react';
import { voucherApi, studentApi, downloadPdf } from '@/services/api';
import { toast } from '@/hooks/use-toast';
import type { Voucher, Student } from '@/types';

const FeeVouchers = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Generate voucher dialog state
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [generating, setGenerating] = useState(false);
  
  // Generate All state
  const [generatingAll, setGeneratingAll] = useState(false);
  
  // Apply late fees state
  const [applyingLateFees, setApplyingLateFees] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [vouchersData, studentsData] = await Promise.all([
        voucherApi.getUnpaid().catch(() => []),
        studentApi.getAll().catch(() => []),
      ]);
      setVouchers(vouchersData);
      setStudents(studentsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast({ title: 'Error', description: 'Failed to fetch data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async (id: number) => {
    try {
      await voucherApi.markPaid(id);
      toast({ title: 'Success', description: 'Voucher marked as paid' });
      fetchData();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update voucher', variant: 'destructive' });
    }
  };

  const handleDownload = async (id: number) => {
    try {
      const blob = await voucherApi.getPdf(id);
      downloadPdf(blob, `voucher-${id}.pdf`);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to download voucher', variant: 'destructive' });
    }
  };

  const handleGenerateVoucher = async () => {
    if (!selectedStudentId || !selectedMonth) {
      toast({ title: 'Error', description: 'Please select student and month', variant: 'destructive' });
      return;
    }

    setGenerating(true);
    try {
      await voucherApi.create({
        studentId: parseInt(selectedStudentId),
        month: selectedMonth,
        totalAmount: 0, // Backend will calculate
      });
      toast({ title: 'Success', description: 'Voucher generated successfully' });
      setGenerateDialogOpen(false);
      setSelectedStudentId('');
      setSelectedMonth('');
      fetchData();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to generate voucher', variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateAll = async () => {
    if (students.length === 0) {
      toast({ title: 'Warning', description: 'No active students found', variant: 'destructive' });
      return;
    }

    setGeneratingAll(true);
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format

    let successCount = 0;
    let failCount = 0;

    for (const student of students) {
      if (student.id) {
        try {
          await voucherApi.create({
            studentId: student.id,
            month: currentMonth,
            totalAmount: 0,
          });
          successCount++;
        } catch {
          failCount++;
        }
      }
    }

    setGeneratingAll(false);
    
    if (successCount > 0) {
      toast({ 
        title: 'Success', 
        description: `Generated ${successCount} vouchers${failCount > 0 ? `, ${failCount} failed (may already exist)` : ''}` 
      });
    } else {
      toast({ title: 'Warning', description: 'No vouchers generated - they may already exist', variant: 'destructive' });
    }
    
    fetchData();
  };

  const handleApplyLateFees = async () => {
    setApplyingLateFees(true);
    try {
      await voucherApi.applyLateFees();
      toast({ title: 'Success', description: 'Late fees applied where applicable' });
      fetchData();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to apply late fees', variant: 'destructive' });
    } finally {
      setApplyingLateFees(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    const variants: Record<string, string> = {
      PENDING: 'bg-warning text-warning-foreground',
      PAID: 'bg-success text-success-foreground',
      OVERDUE: 'bg-destructive text-destructive-foreground',
    };
    return <Badge className={variants[status || 'PENDING'] || ''}>{status || 'PENDING'}</Badge>;
  };

  // Filter vouchers based on search
  const filteredVouchers = useMemo(() => {
    if (!searchQuery) return vouchers;
    const query = searchQuery.toLowerCase();
    return vouchers.filter(v => 
      v.student?.fullName?.toLowerCase().includes(query) ||
      v.month?.toLowerCase().includes(query) ||
      String(v.id).includes(query)
    );
  }, [vouchers, searchQuery]);

  // Generate month options (last 12 months + next 3 months)
  const monthOptions = useMemo(() => {
    const options: { value: string; label: string }[] = [];
    const now = new Date();
    
    for (let i = -12; i <= 3; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const value = d.toISOString().slice(0, 7);
      const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      options.push({ value, label });
    }
    
    return options;
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Fee Vouchers</h1>
            <p className="text-muted-foreground">Manage monthly fee vouchers</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {/* Generate Single Voucher */}
            <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Voucher
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generate New Voucher</DialogTitle>
                  <DialogDescription>
                    Select a student and month to generate a fee voucher
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Select Student</Label>
                    <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a student..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {students.map((student) => (
                          <SelectItem key={student.id} value={String(student.id)}>
                            {student.fullName} {student.grNumber ? `(GR: ${student.grNumber})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Select Month</Label>
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose month..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {monthOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setGenerateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleGenerateVoucher} disabled={generating || !selectedStudentId || !selectedMonth}>
                    {generating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Generate
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Generate All Button */}
            <Button onClick={handleGenerateAll} disabled={generatingAll || students.length === 0}>
              {generatingAll ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Users className="h-4 w-4 mr-2" />
              )}
              Generate All ({students.length})
            </Button>

            {/* Apply Late Fees Button */}
            <Button variant="secondary" onClick={handleApplyLateFees} disabled={applyingLateFees}>
              {applyingLateFees ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <AlertTriangle className="h-4 w-4 mr-2" />
              )}
              Apply Late Fees
            </Button>

            {/* Refresh Button */}
            <Button variant="ghost" size="icon" onClick={fetchData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <FileText className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Unpaid Vouchers</p>
                  <p className="text-2xl font-bold">{vouchers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-destructive/10 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Pending</p>
                  <p className="text-2xl font-bold">
                    PKR {vouchers.reduce((sum, v) => sum + (v.totalAmount || 0), 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Students</p>
                  <p className="text-2xl font-bold">{students.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle>Unpaid Vouchers</CardTitle>
              <Input 
                placeholder="Search by name, ID, or month..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="w-full sm:w-64" 
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Month</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Late Fee</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVouchers.map((v) => (
                      <TableRow key={v.id}>
                        <TableCell className="font-mono text-sm">{v.id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{v.student?.fullName || 'N/A'}</p>
                            {v.student?.grNumber && (
                              <p className="text-xs text-muted-foreground">GR: {v.student.grNumber}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {v.month || '-'}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          PKR {v.totalAmount?.toLocaleString() || 0}
                        </TableCell>
                        <TableCell className={v.lateFee ? 'text-destructive' : ''}>
                          {v.lateFee ? `PKR ${v.lateFee.toLocaleString()}` : '-'}
                        </TableCell>
                        <TableCell>
                          {v.dueDate ? new Date(v.dueDate).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>{getStatusBadge(v.status)}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => v.id && handleDownload(v.id)}
                              title="Download PDF"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => v.id && handleMarkPaid(v.id)}
                            >
                              Mark Paid
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredVouchers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-12">
                          <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                          <p className="text-muted-foreground">
                            {searchQuery ? 'No matching vouchers found' : 'No unpaid vouchers'}
                          </p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default FeeVouchers;
