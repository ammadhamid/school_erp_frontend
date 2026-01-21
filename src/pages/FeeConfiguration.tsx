import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { feeHeadApi } from '@/services/api';
import type { FeeHead } from '@/types';

const FeeConfiguration = () => {
  const [feeHeads, setFeeHeads] = useState<FeeHead[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newFeeHead, setNewFeeHead] = useState({ name: '', amount: '' });

  useEffect(() => {
    fetchFeeHeads();
  }, []);

  const fetchFeeHeads = async () => {
    setLoading(true);
    try {
      const data = await feeHeadApi.getAll();
      setFeeHeads(data);
    } catch (error) {
      console.error('Failed to fetch fee heads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFeeHead = async () => {
    if (!newFeeHead.name || !newFeeHead.amount) {
      toast({ title: 'Error', description: 'Please fill in all fields', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      await feeHeadApi.create({
        name: newFeeHead.name,
        amount: parseFloat(newFeeHead.amount),
        active: true,
      });
      
      toast({ title: 'Success', description: 'Fee head added successfully' });
      setNewFeeHead({ name: '', amount: '' });
      fetchFeeHeads();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add fee head', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFeeHead = async (id: number) => {
    try {
      await feeHeadApi.delete(id);
      toast({ title: 'Success', description: 'Fee head deleted successfully' });
      fetchFeeHeads();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete fee head', variant: 'destructive' });
    }
  };

  const handleToggleActive = async (feeHead: FeeHead) => {
    if (!feeHead.id) return;
    try {
      await feeHeadApi.update(feeHead.id, { ...feeHead, active: !feeHead.active });
      fetchFeeHeads();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update fee head', variant: 'destructive' });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Fee Configuration</h1>
          <p className="text-muted-foreground">Manage fee heads and amounts</p>
        </div>

        <Card>
          <CardHeader><CardTitle>Add New Fee Head</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Fee Head Name</Label>
                <Input placeholder="e.g., Tuition Fee" value={newFeeHead.name} onChange={(e) => setNewFeeHead({ ...newFeeHead, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Amount (PKR)</Label>
                <Input type="number" placeholder="e.g., 5000" value={newFeeHead.amount} onChange={(e) => setNewFeeHead({ ...newFeeHead, amount: e.target.value })} />
              </div>
              <div className="flex items-end">
                <Button onClick={handleAddFeeHead} className="w-full gap-2" disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Add Fee Head
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Fee Heads</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fee Head</TableHead>
                    <TableHead>Amount (PKR)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feeHeads.map((feeHead) => (
                    <TableRow key={feeHead.id}>
                      <TableCell className="font-medium">{feeHead.name}</TableCell>
                      <TableCell>PKR {feeHead.amount?.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch checked={feeHead.active} onCheckedChange={() => handleToggleActive(feeHead)} />
                          <span className="text-sm text-muted-foreground">{feeHead.active ? 'Active' : 'Inactive'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => feeHead.id && handleDeleteFeeHead(feeHead.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {feeHeads.length === 0 && (
                    <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No fee heads configured</TableCell></TableRow>
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

export default FeeConfiguration;
