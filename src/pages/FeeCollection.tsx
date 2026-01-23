import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Search, DollarSign, Printer, Loader2 } from 'lucide-react';
import { studentApi, feeHeadApi, paymentApi } from '@/services/api';
import { toast } from '@/hooks/use-toast';
import type { Student, FeeHead, PaymentRequest } from '@/types';
import { validateNonNegative, hasErrors } from '@/lib/validation';

interface FormErrors {
  search?: string;
  selectedFees?: string;
  discount?: string;
}

const FeeCollection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [feeHeads, setFeeHeads] = useState<FeeHead[]>([]);
  const [selectedFees, setSelectedFees] = useState<number[]>([]);
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [studentDue, setStudentDue] = useState<number>(0);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    fetchFeeHeads();
  }, []);

  const fetchFeeHeads = async () => {
    try {
      const data = await feeHeadApi.getAll();
      setFeeHeads(data);
    } catch (error) {
      console.error('Failed to fetch fee heads:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setErrors({ ...errors, search: 'Please enter GR number or student name' });
      return;
    }
    setErrors({ ...errors, search: undefined });
    
    setSearching(true);
    try {
      let student: Student | null = null;
      try {
        student = await studentApi.getByGrNumber(searchQuery);
      } catch {
        const students = await studentApi.search(searchQuery);
        if (students.length > 0) {
          student = students[0];
        }
      }

      if (student) {
        setSelectedStudent(student);
        setSelectedFees([]);
        setDiscount(0);
        if (student.id) {
          try {
            const due = await studentApi.getStudentDue(student.id);
            setStudentDue(due);
          } catch {
            setStudentDue(0);
          }
        }
      } else {
        toast({ title: 'Student Not Found', description: 'No student found with the given search criteria', variant: 'destructive' });
        setSelectedStudent(null);
      }
    } catch (error) {
      toast({ title: 'Search Error', description: 'Failed to search for student', variant: 'destructive' });
      setSelectedStudent(null);
    } finally {
      setSearching(false);
    }
  };

  const calculateTotal = () => {
    const selected = feeHeads.filter((f) => f.id && selectedFees.includes(f.id));
    const subtotal = selected.reduce((sum, fee) => sum + fee.amount, 0);
    return Math.max(0, subtotal - discount);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (selectedFees.length === 0) {
      newErrors.selectedFees = 'Please select at least one fee item';
    }

    const discountError = validateNonNegative(discount, 'Discount');
    if (discountError) newErrors.discount = discountError;

    const total = calculateTotal();
    if (total <= 0 && selectedFees.length > 0) {
      newErrors.discount = 'Discount cannot exceed total fee amount';
    }

    setErrors(newErrors);
    return !hasErrors(newErrors);
  };

  const handleCollectFee = async () => {
    if (!selectedStudent) {
      toast({ title: 'No Student Selected', description: 'Please search and select a student first', variant: 'destructive' });
      return;
    }

    if (!validateForm()) {
      toast({ title: 'Validation Error', description: 'Please fix the errors below', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const paymentData: PaymentRequest = {
        studentId: selectedStudent.id!,
        feePlanId: selectedStudent.feePlanId || 1,
        amountPaid: calculateTotal(),
        discount: discount,
      };

      await paymentApi.makePayment(paymentData);

      toast({
        title: 'Fee Collected Successfully',
        description: `Total: PKR ${calculateTotal().toLocaleString()}`,
      });
      
      // Reset form
      setSelectedStudent(null);
      setSelectedFees([]);
      setDiscount(0);
      setSearchQuery('');
      setErrors({});
    } catch (error) {
      console.error('Failed to collect fee:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to collect fee',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFeeToggle = (feeId: number, checked: boolean) => {
    setSelectedFees(
      checked
        ? [...selectedFees, feeId]
        : selectedFees.filter((f) => f !== feeId)
    );
    // Clear fee selection error
    if (errors.selectedFees) {
      setErrors({ ...errors, selectedFees: undefined });
    }
  };

  const handleDiscountChange = (value: number) => {
    setDiscount(value);
    if (errors.discount) {
      setErrors({ ...errors, discount: undefined });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Fee Collection</h1>
          <p className="text-muted-foreground">Collect student fees and generate receipts</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Search Student</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by GR Number, Phone, or Name..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (errors.search) setErrors({ ...errors, search: undefined });
                    }}
                    className={`pl-9 ${errors.search ? 'border-destructive' : ''}`}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button onClick={handleSearch} className="bg-gradient-primary" disabled={searching}>
                  {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
                </Button>
              </div>
              {errors.search && <p className="text-sm text-destructive">{errors.search}</p>}
            </div>
          </CardContent>
        </Card>

        {selectedStudent && (
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Student Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-center mb-4">
                  <div className="h-24 w-24 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                    {selectedStudent.fullName?.charAt(0) || '?'}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">GR Number</p>
                  <p className="font-medium">{selectedStudent.grNumber || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedStudent.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Father Name</p>
                  <p className="font-medium">{selectedStudent.fatherName || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Class</p>
                  <Badge>{selectedStudent.className} - {selectedStudent.section}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedStudent.parentContact1 || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Outstanding Due</p>
                  <p className="font-medium text-destructive">PKR {studentDue.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Fee Collection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label className={errors.selectedFees ? 'text-destructive' : ''}>
                    Select Fee Heads <span className="text-destructive">*</span>
                  </Label>
                  {feeHeads.map((fee) => (
                    <div key={fee.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={fee.id ? selectedFees.includes(fee.id) : false}
                          onCheckedChange={(checked) => {
                            if (!fee.id) return;
                            handleFeeToggle(fee.id, !!checked);
                          }}
                        />
                        <Label className="cursor-pointer">{fee.name}</Label>
                      </div>
                      <p className="font-medium">PKR {fee.amount.toLocaleString()}</p>
                    </div>
                  ))}
                  {feeHeads.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">No fee heads configured</p>
                  )}
                  {errors.selectedFees && <p className="text-sm text-destructive">{errors.selectedFees}</p>}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="discount" className={errors.discount ? 'text-destructive' : ''}>
                      Discount (PKR)
                    </Label>
                    <Input
                      id="discount"
                      type="number"
                      value={discount}
                      onChange={(e) => handleDiscountChange(Number(e.target.value))}
                      className={errors.discount ? 'border-destructive' : ''}
                    />
                    {errors.discount && <p className="text-sm text-destructive">{errors.discount}</p>}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-lg">
                      <span>Total Amount:</span>
                      <span className="font-bold text-primary">PKR {calculateTotal().toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleCollectFee} className="gap-2 bg-gradient-success" disabled={loading}>
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <DollarSign className="h-4 w-4" />
                    )}
                    Collect Fee
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Printer className="h-4 w-4" />
                    Print Receipt
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default FeeCollection;
