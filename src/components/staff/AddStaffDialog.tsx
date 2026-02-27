import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { staffApi, salaryStructureApi } from '@/services/api';
import type { StaffDTO, StaffDesignation, SalaryStructure } from '@/types';

// Backend designation values - synced directly with backend enum
const BACKEND_DESIGNATIONS: { label: string; value: StaffDesignation }[] = [
  { label: 'Teacher', value: 'TEACHER' },
  { label: 'Principal', value: 'PRINCIPAL' },
  { label: 'Vice Principal', value: 'VICE_PRINCIPAL' },
  { label: 'Admin', value: 'ADMIN' },
  { label: 'Accountant', value: 'ACCOUNTANT' },
  { label: 'Librarian', value: 'LIBRARIAN' },
  { label: 'Peon', value: 'PEON' },
  { label: 'Security', value: 'SECURITY' },
  { label: 'Cleaner', value: 'CLEANER' },
];

interface AddStaffDialogProps {
  onSuccess?: () => void;
}

interface FormErrors {
  name?: string;
  cnic?: string;
  dob?: string;
  phone?: string;
  designation?: string;
  salaryStructureId?: string;
}

export const AddStaffDialog = ({ onSuccess }: AddStaffDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [salaryStructures, setSalaryStructures] = useState<SalaryStructure[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState({
    name: '',
    cnic: '',
    dob: '',
    phone: '',
    email: '',
    address: '',
    designation: '',
    salaryStructureId: '',
  });

  useEffect(() => {
    if (open) {
      salaryStructureApi.getAll().then(setSalaryStructures).catch(console.error);
    }
  }, [open]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.cnic.trim()) newErrors.cnic = 'CNIC is required';
    else if (!/^\d{5}-\d{7}-\d$/.test(formData.cnic)) newErrors.cnic = 'Invalid CNIC format (12345-1234567-1)';
    if (!formData.dob) newErrors.dob = 'Date of birth is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.designation) newErrors.designation = 'Designation is required';
    if (!formData.salaryStructureId) newErrors.salaryStructureId = 'Salary structure is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({ title: 'Validation Error', description: 'Please fix the errors below', variant: 'destructive' });
      return;
    }
    
    setLoading(true);

    try {
      const apiStaffData: StaffDTO = {
        fullName: formData.name,
        cnic: formData.cnic,
        dateOfBirth: formData.dob,
        contactNumber: formData.phone,
        email: formData.email || undefined,
        address: formData.address || undefined,
        designation: formData.designation as StaffDesignation,
        salaryStructureId: parseInt(formData.salaryStructureId) || undefined,
      };

      await staffApi.create(apiStaffData);
      
      toast({
        title: 'Success',
        description: 'Staff member added successfully',
      });

      onSuccess?.();
      setOpen(false);
      setErrors({});
      
      // Reset form
      setFormData({
        name: '',
        cnic: '',
        dob: '',
        phone: '',
        email: '',
        address: '',
        designation: '',
        salaryStructureId: '',
      });
    } catch (error) {
      console.error('Failed to add staff:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add staff member',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-gradient-primary">
          <UserPlus className="h-4 w-4" />
          Add New Staff
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Staff Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => { setFormData({ ...formData, name: e.target.value }); setErrors({ ...errors, name: undefined }); }}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cnic">CNIC *</Label>
              <Input
                id="cnic"
                placeholder="42101-1234567-1"
                value={formData.cnic}
                onChange={(e) => { setFormData({ ...formData, cnic: e.target.value }); setErrors({ ...errors, cnic: undefined }); }}
                className={errors.cnic ? 'border-destructive' : ''}
              />
              {errors.cnic && <p className="text-sm text-destructive">{errors.cnic}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth *</Label>
              <Input
                id="dob"
                type="date"
                value={formData.dob}
                onChange={(e) => { setFormData({ ...formData, dob: e.target.value }); setErrors({ ...errors, dob: undefined }); }}
                className={errors.dob ? 'border-destructive' : ''}
              />
              {errors.dob && <p className="text-sm text-destructive">{errors.dob}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                placeholder="0300-1234567"
                value={formData.phone}
                onChange={(e) => { setFormData({ ...formData, phone: e.target.value }); setErrors({ ...errors, phone: undefined }); }}
                className={errors.phone ? 'border-destructive' : ''}
              />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="designation">Designation *</Label>
              <Select
                value={formData.designation}
                onValueChange={(value) => { setFormData({ ...formData, designation: value }); setErrors({ ...errors, designation: undefined }); }}
              >
                <SelectTrigger className={errors.designation ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select designation" />
                </SelectTrigger>
                <SelectContent>
                  {BACKEND_DESIGNATIONS.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.designation && <p className="text-sm text-destructive">{errors.designation}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="salaryStructure">Salary Structure *</Label>
              <Select
                value={formData.salaryStructureId}
                onValueChange={(value) => { setFormData({ ...formData, salaryStructureId: value }); setErrors({ ...errors, salaryStructureId: undefined }); }}
              >
                <SelectTrigger className={errors.salaryStructureId ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select salary structure" />
                </SelectTrigger>
                <SelectContent>
                  {salaryStructures.map((ss) => (
                    <SelectItem key={ss.id} value={ss.id.toString()}>
                      {ss.name} - PKR {ss.basicPay?.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.salaryStructureId && <p className="text-sm text-destructive">{errors.salaryStructureId}</p>}
              {salaryStructures.length === 0 && <p className="text-sm text-muted-foreground">No salary structures found. Create one in Payroll settings.</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Staff'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
