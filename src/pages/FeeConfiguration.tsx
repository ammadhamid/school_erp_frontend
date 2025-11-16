import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { FeeHead } from '@/types';

const FeeConfiguration = () => {
  const [feeHeads, setFeeHeads] = useState<FeeHead[]>([
    { id: '1', name: 'Tuition Fee', amount: 5000, isMonthly: true, isActive: true },
    { id: '2', name: 'Transport Fee', amount: 2000, isMonthly: true, isActive: true },
    { id: '3', name: 'Exam Fee', amount: 1500, isMonthly: false, isActive: true },
    { id: '4', name: 'Lab Fee', amount: 1000, isMonthly: true, isActive: true },
    { id: '5', name: 'Library Fee', amount: 500, isMonthly: false, isActive: true },
  ]);

  const [newFeeHead, setNewFeeHead] = useState({
    name: '',
    amount: '',
    isMonthly: true,
    isActive: true,
  });

  const handleAddFeeHead = () => {
    if (!newFeeHead.name || !newFeeHead.amount) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    const feeHead: FeeHead = {
      id: Date.now().toString(),
      name: newFeeHead.name,
      amount: parseFloat(newFeeHead.amount),
      isMonthly: newFeeHead.isMonthly,
      isActive: newFeeHead.isActive,
    };

    setFeeHeads([...feeHeads, feeHead]);
    setNewFeeHead({ name: '', amount: '', isMonthly: true, isActive: true });
    
    toast({
      title: 'Success',
      description: 'Fee head added successfully',
    });
  };

  const handleDeleteFeeHead = (id: string) => {
    setFeeHeads(feeHeads.filter((fh) => fh.id !== id));
    toast({
      title: 'Success',
      description: 'Fee head deleted successfully',
    });
  };

  const handleToggleActive = (id: string) => {
    setFeeHeads(
      feeHeads.map((fh) =>
        fh.id === id ? { ...fh, isActive: !fh.isActive } : fh
      )
    );
  };

  const handleSaveChanges = () => {
    // TODO: Call API to save fee heads
    toast({
      title: 'Success',
      description: 'Fee configuration saved successfully',
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Fee Configuration</h1>
          <p className="text-muted-foreground">Manage fee heads and amounts</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Add New Fee Head</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Fee Head Name</Label>
                <Input
                  placeholder="e.g., Tuition Fee"
                  value={newFeeHead.name}
                  onChange={(e) => setNewFeeHead({ ...newFeeHead, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Amount (PKR)</Label>
                <Input
                  type="number"
                  placeholder="e.g., 5000"
                  value={newFeeHead.amount}
                  onChange={(e) => setNewFeeHead({ ...newFeeHead, amount: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select
                  value={newFeeHead.isMonthly ? 'monthly' : 'one-time'}
                  onValueChange={(value) =>
                    setNewFeeHead({ ...newFeeHead, isMonthly: value === 'monthly' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="one-time">One-time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={handleAddFeeHead} className="w-full gap-2">
                  <Plus className="h-4 w-4" />
                  Add Fee Head
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Fee Heads</CardTitle>
              <Button onClick={handleSaveChanges} className="gap-2">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fee Head</TableHead>
                  <TableHead>Amount (PKR)</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feeHeads.map((feeHead) => (
                  <TableRow key={feeHead.id}>
                    <TableCell className="font-medium">{feeHead.name}</TableCell>
                    <TableCell>PKR {feeHead.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {feeHead.isMonthly ? 'Monthly' : 'One-time'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={feeHead.isActive}
                          onCheckedChange={() => handleToggleActive(feeHead.id)}
                        />
                        <span className="text-sm text-muted-foreground">
                          {feeHead.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteFeeHead(feeHead.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
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

export default FeeConfiguration;
