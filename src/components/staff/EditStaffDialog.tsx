import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { staffApi, salaryStructureApi } from '@/services/api';
import { DESIGNATION_OPTIONS, STAFF_DESIGNATION_MAP, type Staff, type StaffDTO, type DesignationType, type SalaryStructure, type StaffDesignation } from '@/types';

interface EditStaffDialogProps {
  staff: Staff | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

// Reverse mapping from StaffDesignation to DesignationType
const REVERSE_DESIGNATION_MAP: Partial<Record<StaffDesignation, DesignationType>> = {
  'TEACHER': 'Teacher',
  'PRINCIPAL': 'Principal',
  'VICE_PRINCIPAL': 'Vice Principal',
  'ADMIN': 'Admin Staff',
  'ACCOUNTANT': 'Accountant',
  'LIBRARIAN': 'Librarian',
  'PEON': 'Peon',
  'SECURITY': 'Guard',
  'CLEANER': 'Peon',
  'OTHER': 'Admin Staff',
};

export const EditStaffDialog = ({ staff, open, onOpenChange, onSuccess }: EditStaffDialogProps) => {
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
    if (open && staff) {
      // Populate form with staff data
      const displayDesignation = REVERSE_DESIGNATION_MAP[staff.designation as StaffDesignation] || 'Admin Staff';
      setFormData({
        name: staff.fullName || '',
        cnic: staff.cnic || '',
        dob: staff.dateOfBirth || '',
        phone: staff.contactNumber || '',
        email: staff.email || '',
        address: staff.address || '',
        designation: displayDesignation,
        salaryStructureId: staff.salaryStructureId?.toString() || '',
      });
      
      // Fetch salary structures
      salaryStructureApi.getAll().then(setSalaryStructures).catch(console.error);
    }
  }, [open, staff]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.cnic.trim()) newErrors.cnic = 'CNIC is required';
    else if (!/^\d{5}-\d{7}-\d$/.test(formData.cnic)) newErrors.cnic = 'Invalid CNIC format (12345-1234567-1)';
    if (!formData.dob) newErrors.dob = 'Date of birth is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.designation) newErrors.designation = 'Designation is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!staff?.id) return;
    
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
        designation: STAFF_DESIGNATION_MAP[formData.designation as DesignationType] || 'OTHER',
        salaryStructureId: formData.salaryStructureId ? parseInt(formData.salaryStructureId) : undefined,
      };

      await staffApi.update(staff.id, apiStaffData);
      
      toast({
        title: 'Success',
        description: 'Staff member updated successfully',
      });

      onSuccess?.();
      onOpenChange(false);
      setErrors({});
    } catch (error) {
      console.error('Failed to update staff:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update staff member',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!staff) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Staff Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => { setFormData({ ...formData, name: e.target.value }); setErrors({ ...errors, name: undefined }); }}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-cnic">CNIC *</Label>
              <Input
                id="edit-cnic"
                placeholder="42101-1234567-1"
                value={formData.cnic}
                onChange={(e) => { setFormData({ ...formData, cnic: e.target.value }); setErrors({ ...errors, cnic: undefined }); }}
                className={errors.cnic ? 'border-destructive' : ''}
              />
              {errors.cnic && <p className="text-sm text-destructive">{errors.cnic}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-dob">Date of Birth *</Label>
              <Input
                id="edit-dob"
                type="date"
                value={formData.dob}
                onChange={(e) => { setFormData({ ...formData, dob: e.target.value }); setErrors({ ...errors, dob: undefined }); }}
                className={errors.dob ? 'border-destructive' : ''}
              />
              {errors.dob && <p className="text-sm text-destructive">{errors.dob}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone Number *</Label>
              <Input
                id="edit-phone"
                placeholder="0300-1234567"
                value={formData.phone}
                onChange={(e) => { setFormData({ ...formData, phone: e.target.value }); setErrors({ ...errors, phone: undefined }); }}
                className={errors.phone ? 'border-destructive' : ''}
              />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-designation">Designation *</Label>
              <Select
                value={formData.designation}
                onValueChange={(value) => { setFormData({ ...formData, designation: value }); setErrors({ ...errors, designation: undefined }); }}
              >
                <SelectTrigger className={errors.designation ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select designation" />
                </SelectTrigger>
                <SelectContent>
                  {DESIGNATION_OPTIONS.map((designation) => (
                    <SelectItem key={designation} value={designation}>
                      {designation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.designation && <p className="text-sm text-destructive">{errors.designation}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-salaryStructure">Salary Structure</Label>
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
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-address">Address</Label>
            <Input
              id="edit-address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Staff'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
