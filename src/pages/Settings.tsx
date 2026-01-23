import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Building, Bell, DollarSign, Lock, Plus, Trash2, Loader2, Briefcase } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { feeHeadApi } from '@/services/api';
import type { FeeHead } from '@/types';
import SalaryStructureManagement from '@/components/settings/SalaryStructureManagement';

interface FeeHeadErrors {
  [key: number]: { name?: string; amount?: string };
}

const Settings = () => {
  const [feeHeads, setFeeHeads] = useState<FeeHead[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feeHeadErrors, setFeeHeadErrors] = useState<FeeHeadErrors>({});

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

  const handleSave = () => {
    toast({
      title: 'Settings Saved',
      description: 'Your settings have been updated successfully.',
    });
  };

  const addFeeHead = async () => {
    const newFeeHead: FeeHead = {
      name: '',
      amount: 0,
      active: true,
    };
    setFeeHeads([...feeHeads, newFeeHead]);
  };

  const removeFeeHead = async (id?: number, index?: number) => {
    if (id) {
      try {
        await feeHeadApi.delete(id);
        toast({ title: 'Success', description: 'Fee head deleted' });
        fetchFeeHeads();
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to delete fee head', variant: 'destructive' });
      }
    } else if (index !== undefined) {
      setFeeHeads(feeHeads.filter((_, i) => i !== index));
    }
  };

  const updateFeeHead = (index: number, field: string, value: any) => {
    setFeeHeads(
      feeHeads.map((fh, i) => (i === index ? { ...fh, [field]: value } : fh))
    );
    // Clear error for this field
    if (feeHeadErrors[index]) {
      setFeeHeadErrors({
        ...feeHeadErrors,
        [index]: { ...feeHeadErrors[index], [field]: undefined },
      });
    }
  };

  const validateFeeHeads = (): boolean => {
    const errors: FeeHeadErrors = {};
    let isValid = true;

    feeHeads.forEach((feeHead, index) => {
      const fieldErrors: { name?: string; amount?: string } = {};
      
      if (!feeHead.name?.trim()) {
        fieldErrors.name = 'Fee name is required';
        isValid = false;
      } else if (feeHead.name.length < 2) {
        fieldErrors.name = 'Fee name must be at least 2 characters';
        isValid = false;
      }

      if (feeHead.amount === undefined || feeHead.amount <= 0) {
        fieldErrors.amount = 'Amount must be greater than 0';
        isValid = false;
      }

      if (Object.keys(fieldErrors).length > 0) {
        errors[index] = fieldErrors;
      }
    });

    setFeeHeadErrors(errors);
    return isValid;
  };

  const saveFeeConfiguration = async () => {
    if (!validateFeeHeads()) {
      toast({ title: 'Validation Error', description: 'Please fix the errors below', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      for (const feeHead of feeHeads) {
        if (feeHead.id) {
          await feeHeadApi.update(feeHead.id, feeHead);
        } else if (feeHead.name) {
          await feeHeadApi.create(feeHead);
        }
      }
      toast({
        title: 'Success',
        description: 'Fee configuration saved successfully',
      });
      fetchFeeHeads();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save fee configuration',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage school settings and configuration</p>
        </div>

        <Tabs defaultValue="school" className="space-y-6">
          <TabsList>
            <TabsTrigger value="school">School Info</TabsTrigger>
            <TabsTrigger value="fees">Fee Configuration</TabsTrigger>
            <TabsTrigger value="salary">Salary Structures</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="school" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  School Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="schoolName">School Name</Label>
                    <Input id="schoolName" defaultValue="Abroad School" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="info@abroadschool.edu" />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" defaultValue="051-1234567" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input id="website" defaultValue="www.abroadschool.edu" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" defaultValue="Street 5, Sector F-8, Islamabad" />
                </div>
                <Button onClick={handleSave} className="gap-2 bg-gradient-primary">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fees" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Fee Configuration
                  </CardTitle>
                  <Button onClick={addFeeHead} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Fee Head
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Fee Heads</Label>
                    {feeHeads.map((feeHead, index) => (
                      <div key={feeHead.id || index} className="flex gap-4 items-start p-4 border rounded-lg">
                        <div className="flex-1 space-y-2">
                          <Label>Fee Name <span className="text-destructive">*</span></Label>
                          <Input
                            value={feeHead.name}
                            onChange={(e) => updateFeeHead(index, 'name', e.target.value)}
                            placeholder="e.g., Tuition Fee"
                            className={feeHeadErrors[index]?.name ? 'border-destructive' : ''}
                          />
                          {feeHeadErrors[index]?.name && (
                            <p className="text-sm text-destructive">{feeHeadErrors[index].name}</p>
                          )}
                        </div>
                        <div className="w-32 space-y-2">
                          <Label>Amount (PKR) <span className="text-destructive">*</span></Label>
                          <Input
                            type="number"
                            value={feeHead.amount}
                            onChange={(e) => updateFeeHead(index, 'amount', parseFloat(e.target.value) || 0)}
                            className={feeHeadErrors[index]?.amount ? 'border-destructive' : ''}
                          />
                          {feeHeadErrors[index]?.amount && (
                            <p className="text-sm text-destructive">{feeHeadErrors[index].amount}</p>
                          )}
                        </div>
                        <div className="w-24 space-y-2 flex items-center pt-7">
                          <Label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={feeHead.active !== false}
                              onChange={(e) => updateFeeHead(index, 'active', e.target.checked)}
                              className="h-4 w-4"
                            />
                            Active
                          </Label>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="mt-7"
                          onClick={() => removeFeeHead(feeHead.id, index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                    {feeHeads.length === 0 && (
                      <p className="text-center text-muted-foreground py-4">No fee heads configured</p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label>Late Fee Percentage (%)</Label>
                    <Input type="number" placeholder="5" defaultValue="5" />
                  </div>
                  <div className="space-y-2">
                    <Label>Fee Due Date (Day of Month)</Label>
                    <Input type="number" placeholder="10" defaultValue="10" />
                  </div>
                </div>

                <Button onClick={saveFeeConfiguration} className="w-full gap-2 bg-gradient-primary" disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Fee Configuration
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="salary" className="space-y-6">
            <SalaryStructureManagement />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">WhatsApp Reminders</p>
                    <p className="text-sm text-muted-foreground">Send fee reminders via WhatsApp</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">SMS Notifications</p>
                    <p className="text-sm text-muted-foreground">Send SMS for important updates</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Send email notifications to parents</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto Fee Reminders</p>
                    <p className="text-sm text-muted-foreground">Automatically send reminders on due dates</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Button onClick={handleSave} className="gap-2 bg-gradient-primary">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
                <Button onClick={handleSave} className="gap-2 bg-gradient-primary">
                  <Save className="h-4 w-4" />
                  Update Password
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
