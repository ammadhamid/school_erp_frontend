import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Loader2, Pencil, FileText, Calculator } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { feePlanApi, feeHeadApi } from '@/services/api';
import type { FeePlan, FeePlanRequest, FeeHead } from '@/types';

interface FormErrors {
  name?: string;
  feeHeads?: string;
}

const FeePlanManagement = () => {
  const [feePlans, setFeePlans] = useState<FeePlan[]>([]);
  const [feeHeads, setFeeHeads] = useState<FeeHead[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<FeePlan | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<{
    name: string;
    selectedFeeHeadIds: number[];
    monthly: boolean;
  }>({
    name: '',
    selectedFeeHeadIds: [],
    monthly: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [plansData, headsData] = await Promise.all([
        feePlanApi.getAll({ useCache: false }).catch(() => []),
        feeHeadApi.getAll().catch(() => []),
      ]);
      setFeePlans(plansData);
      setFeeHeads(headsData.filter(h => h.active !== false));
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast({ title: 'Error', description: 'Failed to load fee plans', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Plan name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }

    if (formData.selectedFeeHeadIds.length === 0) {
      newErrors.feeHeads = 'Select at least one fee head';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({ name: '', selectedFeeHeadIds: [], monthly: true });
    setEditingPlan(null);
    setErrors({});
  };

  const handleOpenDialog = (plan?: FeePlan) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        selectedFeeHeadIds: plan.feeHeads?.map(h => h.id!).filter(Boolean) || [],
        monthly: plan.monthly ?? true,
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleToggleFeeHead = (feeHeadId: number) => {
    setFormData(prev => {
      const isSelected = prev.selectedFeeHeadIds.includes(feeHeadId);
      return {
        ...prev,
        selectedFeeHeadIds: isSelected
          ? prev.selectedFeeHeadIds.filter(id => id !== feeHeadId)
          : [...prev.selectedFeeHeadIds, feeHeadId],
      };
    });
    if (errors.feeHeads) {
      setErrors({ ...errors, feeHeads: undefined });
    }
  };

  const calculateTotalAmount = () => {
    return formData.selectedFeeHeadIds.reduce((total, id) => {
      const feeHead = feeHeads.find(h => h.id === id);
      return total + (feeHead?.amount || 0);
    }, 0);
  };

  const getFeePlanTotal = (plan: FeePlan) => {
    return plan.feeHeads?.reduce((total, h) => total + (h.amount || 0), 0) || 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const payload: FeePlanRequest = {
        name: formData.name,
        feeHeadIds: formData.selectedFeeHeadIds,
        monthly: formData.monthly,
      };

      if (editingPlan?.id) {
        await feePlanApi.update(editingPlan.id, payload);
        toast({ title: 'Success', description: 'Fee plan updated successfully' });
      } else {
        await feePlanApi.create(payload);
        toast({ title: 'Success', description: 'Fee plan created successfully' });
      }

      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Failed to save fee plan:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save fee plan',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this fee plan? Students assigned to this plan may be affected.')) return;

    try {
      await feePlanApi.delete(id);
      toast({ title: 'Success', description: 'Fee plan deleted successfully' });
      fetchData();
    } catch (error) {
      console.error('Failed to delete fee plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete fee plan. It may be assigned to students.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Fee Plans
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {editingPlan ? 'Edit Fee Plan' : 'Create Fee Plan'}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="planName">Plan Name *</Label>
                  <Input
                    id="planName"
                    placeholder="e.g., Standard Monthly Plan"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (errors.name) setErrors({ ...errors, name: undefined });
                    }}
                    className={errors.name ? 'border-destructive' : ''}
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    id="monthly"
                    checked={formData.monthly}
                    onCheckedChange={(checked) => setFormData({ ...formData, monthly: checked })}
                  />
                  <Label htmlFor="monthly">Monthly recurring fee</Label>
                </div>

                <div className="space-y-2">
                  <Label className={errors.feeHeads ? 'text-destructive' : ''}>
                    Select Fee Heads *
                  </Label>
                  {errors.feeHeads && <p className="text-sm text-destructive">{errors.feeHeads}</p>}

                  {feeHeads.length === 0 ? (
                    <p className="text-sm text-muted-foreground p-4 border rounded-lg text-center">
                      No fee heads available. Create fee heads first.
                    </p>
                  ) : (
                    <div className="border rounded-lg max-h-[200px] overflow-y-auto">
                      {feeHeads.map((feeHead) => (
                        <div
                          key={feeHead.id}
                          className="flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-muted/50 cursor-pointer"
                          onClick={() => feeHead.id && handleToggleFeeHead(feeHead.id)}
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={formData.selectedFeeHeadIds.includes(feeHead.id!)}
                              onCheckedChange={() => feeHead.id && handleToggleFeeHead(feeHead.id)}
                            />
                            <span className="font-medium">{feeHead.name}</span>
                          </div>
                          <span className="text-muted-foreground">
                            PKR {feeHead.amount?.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-4 bg-muted rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Total Amount ({formData.selectedFeeHeadIds.length} items)
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-primary">
                    PKR {calculateTotalAmount().toLocaleString()}
                  </p>
                </div>
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" onClick={resetForm}>Cancel</Button>
                </DialogClose>
                <Button onClick={handleSave} disabled={saving || feeHeads.length === 0} className="gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {editingPlan ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan Name</TableHead>
                <TableHead>Fee Heads</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feePlans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plan.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {plan.feeHeads?.slice(0, 3).map((head) => (
                        <Badge key={head.id} variant="secondary" className="text-xs">
                          {head.name}
                        </Badge>
                      ))}
                      {(plan.feeHeads?.length || 0) > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{plan.feeHeads!.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={plan.monthly ? 'default' : 'outline'}>
                      {plan.monthly ? 'Monthly' : 'One-time'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-primary">
                    PKR {getFeePlanTotal(plan).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(plan)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(plan.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {feePlans.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No fee plans configured. Create one to assign to students.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default FeePlanManagement;
