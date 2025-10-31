import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, DollarSign, Printer } from 'lucide-react';
import { mockStudents } from '@/lib/mockData';
import { toast } from '@/hooks/use-toast';

const feeHeads = [
  { id: 'tuition', name: 'Tuition Fee', amount: 5000 },
  { id: 'transport', name: 'Transport Fee', amount: 2000 },
  { id: 'exam', name: 'Exam Fee', amount: 1000 },
  { id: 'lab', name: 'Lab Fee', amount: 500 },
  { id: 'sports', name: 'Sports Fee', amount: 300 },
  { id: 'library', name: 'Library Fee', amount: 200 },
];

const FeeCollection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<typeof mockStudents[0] | null>(null);
  const [selectedFees, setSelectedFees] = useState<string[]>([]);
  const [discount, setDiscount] = useState(0);
  const [lateFee, setLateFee] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const handleSearch = () => {
    const student = mockStudents.find(
      (s) =>
        s.grNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.phone.includes(searchQuery) ||
        s.fatherCnic.includes(searchQuery)
    );
    setSelectedStudent(student || null);
    if (!student) {
      toast({ title: 'Student Not Found', variant: 'destructive' });
    }
  };

  const calculateTotal = () => {
    const selected = feeHeads.filter((f) => selectedFees.includes(f.id));
    const subtotal = selected.reduce((sum, fee) => sum + fee.amount, 0);
    return subtotal - discount + lateFee;
  };

  const handleCollectFee = () => {
    if (!selectedStudent || selectedFees.length === 0) {
      toast({ title: 'Please select student and fee items', variant: 'destructive' });
      return;
    }
    toast({
      title: 'Fee Collected Successfully',
      description: `Total: PKR ${calculateTotal().toLocaleString()}`,
    });
    setSelectedStudent(null);
    setSelectedFees([]);
    setDiscount(0);
    setLateFee(0);
    setSearchQuery('');
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
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by GR Number, Phone, or CNIC..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch} className="bg-gradient-primary">
                Search
              </Button>
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
                    {selectedStudent.fullName.charAt(0)}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">GR Number</p>
                  <p className="font-medium">{selectedStudent.grNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedStudent.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Father Name</p>
                  <p className="font-medium">{selectedStudent.fatherName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Class</p>
                  <Badge>{selectedStudent.class} - {selectedStudent.section}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedStudent.phone}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Fee Collection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Select Fee Heads</Label>
                  {feeHeads.map((fee) => (
                    <div key={fee.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={selectedFees.includes(fee.id)}
                          onCheckedChange={(checked) => {
                            setSelectedFees(
                              checked
                                ? [...selectedFees, fee.id]
                                : selectedFees.filter((f) => f !== fee.id)
                            );
                          }}
                        />
                        <Label className="cursor-pointer">{fee.name}</Label>
                      </div>
                      <p className="font-medium">PKR {fee.amount.toLocaleString()}</p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="discount">Discount (PKR)</Label>
                    <Input
                      id="discount"
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lateFee">Late Fee (PKR)</Label>
                    <Input
                      id="lateFee"
                      type="number"
                      value={lateFee}
                      onChange={(e) => setLateFee(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payment">Payment Method</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="bank">Bank Transfer</SelectItem>
                        <SelectItem value="online">Online Payment</SelectItem>
                      </SelectContent>
                    </Select>
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
                  <Button onClick={handleCollectFee} className="gap-2 bg-gradient-success">
                    <DollarSign className="h-4 w-4" />
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
