import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Edit, Trash2, Eye, Loader2 } from 'lucide-react';
import { staffApi } from '@/services/api';
import { AddStaffDialog } from '@/components/staff/AddStaffDialog';
import { toast } from '@/hooks/use-toast';
import type { Staff as StaffType } from '@/types';

const Staff = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [staffList, setStaffList] = useState<StaffType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const data = await staffApi.getActive();
      setStaffList(data);
    } catch (error) {
      console.error('Failed to fetch staff:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch staff members',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStaffAdded = () => {
    fetchStaff(); // Refresh the list
  };

  const handleDeactivate = async (id: number) => {
    try {
      await staffApi.deactivate(id);
      toast({
        title: 'Success',
        description: 'Staff member deactivated',
      });
      fetchStaff();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to deactivate staff member',
        variant: 'destructive',
      });
    }
  };

  const filteredStaff = staffList.filter(
    (staff) =>
      staff.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.cnic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.designation?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalSalary = staffList.reduce((sum, s) => {
    // Calculate net salary from salary structure if available
    return sum;
  }, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Staff Management</h1>
            <p className="text-muted-foreground">Manage teaching and administrative staff</p>
          </div>
          <AddStaffDialog onSuccess={handleStaffAdded} />
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Staff</p>
                <p className="text-3xl font-bold">{staffList.filter(s => s.active !== false).length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Teachers</p>
                <p className="text-3xl font-bold">{staffList.filter(s => s.designation === 'TEACHER').length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Admin Staff</p>
                <p className="text-3xl font-bold">{staffList.filter(s => s.designation === 'ADMIN').length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Active</p>
                <p className="text-3xl font-bold">{staffList.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Staff List</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search staff..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>CNIC</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Joining Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStaff.map((staff) => (
                    <TableRow key={staff.id}>
                      <TableCell className="font-medium">{staff.id}</TableCell>
                      <TableCell>{staff.fullName}</TableCell>
                      <TableCell>{staff.cnic}</TableCell>
                      <TableCell>{staff.designation}</TableCell>
                      <TableCell>{staff.contactNumber}</TableCell>
                      <TableCell>{staff.joiningDate ? new Date(staff.joiningDate).toLocaleDateString() : '-'}</TableCell>
                      <TableCell>
                        <Badge className={staff.active !== false ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"}>
                          {staff.active !== false ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => staff.id && handleDeactivate(staff.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredStaff.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No staff members found
                      </TableCell>
                    </TableRow>
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

export default Staff;
