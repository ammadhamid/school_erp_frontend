import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Building, Bell, DollarSign, Lock, Plus, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Settings = () => {
  const [feeHeads, setFeeHeads] = useState([
    { id: '1', name: 'Tuition Fee', amount: 5000, class: 'All' },
    { id: '2', name: 'Transport Fee', amount: 2000, class: 'All' },
    { id: '3', name: 'Exam Fee', amount: 1000, class: 'All' },
    { id: '4', name: 'Lab Fee', amount: 1500, class: '9,10,11,12' },
  ]);

  const handleSave = () => {
    toast({
      title: 'Settings Saved',
      description: 'Your settings have been updated successfully.',
    });
  };

  const addFeeHead = () => {
    const newFeeHead = {
      id: Date.now().toString(),
      name: '',
      amount: 0,
      class: 'All',
    };
    setFeeHeads([...feeHeads, newFeeHead]);
  };

  const removeFeeHead = (id: string) => {
    setFeeHeads(feeHeads.filter((fh) => fh.id !== id));
  };

  const updateFeeHead = (id: string, field: string, value: any) => {
    setFeeHeads(
      feeHeads.map((fh) => (fh.id === id ? { ...fh, [field]: value } : fh))
    );
  };

  const saveFeeConfiguration = () => {
    // TODO: Call API to save fee configuration
    toast({
      title: 'Success',
      description: 'Fee configuration saved successfully',
    });
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
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Fee Heads</Label>
                  {feeHeads.map((feeHead) => (
                    <div key={feeHead.id} className="flex gap-4 items-end p-4 border rounded-lg">
                      <div className="flex-1 space-y-2">
                        <Label>Fee Name</Label>
                        <Input
                          value={feeHead.name}
                          onChange={(e) =>
                            updateFeeHead(feeHead.id, 'name', e.target.value)
                          }
                          placeholder="e.g., Tuition Fee"
                        />
                      </div>
                      <div className="w-32 space-y-2">
                        <Label>Amount (PKR)</Label>
                        <Input
                          type="number"
                          value={feeHead.amount}
                          onChange={(e) =>
                            updateFeeHead(feeHead.id, 'amount', parseFloat(e.target.value) || 0)
                          }
                        />
                      </div>
                      <div className="w-40 space-y-2">
                        <Label>Applicable Class</Label>
                        <Input
                          value={feeHead.class}
                          onChange={(e) =>
                            updateFeeHead(feeHead.id, 'class', e.target.value)
                          }
                          placeholder="All or 9,10"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFeeHead(feeHead.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>

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

                <Button onClick={saveFeeConfiguration} className="w-full gap-2 bg-gradient-primary">
                  <Save className="h-4 w-4" />
                  Save Fee Configuration
                </Button>
              </CardContent>
            </Card>
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
