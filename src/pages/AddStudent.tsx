import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Upload, Save, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { studentApi, feePlanApi, downloadPdf } from '@/services/api';
import type { StudentDTO, FeePlan } from '@/types';
import { validateCnic, validatePhone, validateRequired, validateBForm, hasErrors } from '@/lib/validation';

// Local storage key (same as FeePlanManagement)
const FEE_PLANS_STORAGE_KEY = 'created_fee_plans';

interface FormErrors {
  fullName?: string;
  fatherName?: string;
  fatherCnic?: string;
  motherCnic?: string;
  bFormNumber?: string;
  dateOfBirth?: string;
  className?: string;
  section?: string;
  rollNumber?: string;
  phone?: string;
  address?: string;
}

const AddStudent = () => {
  const navigate = useNavigate();
  const [dob, setDob] = useState<Date>();
  const [dobText, setDobText] = useState('');
  const [loading, setLoading] = useState(false);
  const [feePlans, setFeePlans] = useState<FeePlan[]>([]);
  const [selectedFeePlanId, setSelectedFeePlanId] = useState<number | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    // Load fee plans from localStorage (backend doesn't have GET endpoint)
    const loadFeePlans = () => {
      try {
        const stored = localStorage.getItem(FEE_PLANS_STORAGE_KEY);
        const plans = stored ? JSON.parse(stored) : [];
        setFeePlans(plans);
      } catch {
        setFeePlans([]);
      }
    };
    loadFeePlans();
  }, []);

  const [formData, setFormData] = useState({
    fullName: '',
    fatherName: '',
    motherName: '',
    fatherCnic: '',
    motherCnic: '',
    bFormNumber: '',
    class: '',
    section: '',
    group: '',
    rollNumber: '',
    phone: '',
    alternatePhone: '',
    address: '',
    previousSchool: '',
  });

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    // Clear error when user types
    if (errors[field as keyof FormErrors]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required text fields
    const fullNameError = validateRequired(formData.fullName, 'Full name');
    if (fullNameError) newErrors.fullName = fullNameError;
    else if (formData.fullName.length < 3) newErrors.fullName = 'Name must be at least 3 characters';

    const fatherNameError = validateRequired(formData.fatherName, "Father's name");
    if (fatherNameError) newErrors.fatherName = fatherNameError;

    // CNIC validations
    const fatherCnicError = validateCnic(formData.fatherCnic, true);
    if (fatherCnicError) newErrors.fatherCnic = fatherCnicError;

    if (formData.motherCnic) {
      const motherCnicError = validateCnic(formData.motherCnic, false);
      if (motherCnicError) newErrors.motherCnic = motherCnicError;
    }

    // B-Form validation
    const bFormError = validateBForm(formData.bFormNumber, true);
    if (bFormError) newErrors.bFormNumber = bFormError;

    // Date of birth
    if (!dob && !dobText) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }

    // Class and section
    if (!formData.class) newErrors.className = 'Class is required';
    if (!formData.section) newErrors.section = 'Section is required';

    // Roll number
    if (!formData.rollNumber) {
      newErrors.rollNumber = 'Roll number is required';
    } else if (parseInt(formData.rollNumber) <= 0) {
      newErrors.rollNumber = 'Roll number must be positive';
    }

    // Phone validation
    const phoneError = validatePhone(formData.phone, true);
    if (phoneError) newErrors.phone = phoneError;

    // Address
    const addressError = validateRequired(formData.address, 'Address');
    if (addressError) newErrors.address = addressError;

    setErrors(newErrors);
    return !hasErrors(newErrors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const studentData: StudentDTO = {
        fullName: formData.fullName,
        fatherName: formData.fatherName,
        motherName: formData.motherName || undefined,
        fatherCnic: formData.fatherCnic,
        motherCnic: formData.motherCnic || formData.fatherCnic,
        dateOfBirth: dobText || (dob ? format(dob, 'yyyy-MM-dd') : undefined),
        className: formData.class,
        section: formData.section,
        groupName: formData.group || undefined,
        rollNumber: parseInt(formData.rollNumber) || undefined,
        parentContact1: formData.phone,
        parentContact2: formData.alternatePhone || undefined,
        address: formData.address,
        bFormNumber: formData.bFormNumber,
        previousSchool: formData.previousSchool || undefined,
        admissionDate: format(new Date(), 'yyyy-MM-dd'),
        studentStatus: 'ACTIVE',
      };

      const response = await studentApi.create(studentData);
      
      toast({
        title: 'Student Added Successfully',
        description: `GR Number: ${response.grNumber || 'Will be assigned'}`,
      });

      // Assign existing fee plan if selected
      if (response.id && selectedFeePlanId) {
        try {
          await studentApi.assignFeePlan(response.id, selectedFeePlanId);
          toast({ title: 'Fee Plan Assigned', description: 'Student fee plan has been assigned successfully.' });
        } catch (feeError) {
          console.error('Failed to assign fee plan:', feeError);
          toast({ title: 'Warning', description: 'Student created but fee plan assignment failed.', variant: 'destructive' });
        }
      }

      // Generate admission voucher if student has an ID
      if (response.id) {
        try {
          const voucherBlob = await studentApi.generateAdmissionVoucher(response.id);
          downloadPdf(voucherBlob, `admission-voucher-${response.grNumber || response.id}.pdf`);
        } catch (err) {
          console.log('Voucher generation skipped');
        }
      }

      navigate('/students');
    } catch (error) {
      console.error('Failed to add student:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add student',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Add New Student</h1>
          <p className="text-muted-foreground">Enter student information for admission</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Student Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Personal Information */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className={errors.fullName ? 'text-destructive' : ''}>
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => updateField('fullName', e.target.value)}
                    className={errors.fullName ? 'border-destructive' : ''}
                  />
                  {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob" className={errors.dateOfBirth ? 'text-destructive' : ''}>
                    Date of Birth <span className="text-destructive">*</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !dob && 'text-muted-foreground',
                          errors.dateOfBirth && 'border-destructive'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dob ? format(dob, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dob}
                        onSelect={(date) => {
                          setDob(date);
                          if (date) {
                            setDobText(format(date, 'yyyy-MM-dd'));
                            setErrors({ ...errors, dateOfBirth: undefined });
                          }
                        }}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <Input
                    id="dob"
                    placeholder="YYYY-MM-DD"
                    value={dobText}
                    onChange={(e) => {
                      setDobText(e.target.value);
                      setErrors({ ...errors, dateOfBirth: undefined });
                      const value = e.target.value;
                      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                        const parts = value.split('-').map(Number);
                        const parsed = new Date(parts[0], parts[1] - 1, parts[2]);
                        if (!Number.isNaN(parsed.getTime())) {
                          setDob(parsed);
                        }
                      }
                    }}
                    className={errors.dateOfBirth ? 'border-destructive' : ''}
                  />
                  {errors.dateOfBirth && <p className="text-sm text-destructive">{errors.dateOfBirth}</p>}
                </div>
              </div>

              {/* Parent Information */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fatherName" className={errors.fatherName ? 'text-destructive' : ''}>
                    Father's Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="fatherName"
                    value={formData.fatherName}
                    onChange={(e) => updateField('fatherName', e.target.value)}
                    className={errors.fatherName ? 'border-destructive' : ''}
                  />
                  {errors.fatherName && <p className="text-sm text-destructive">{errors.fatherName}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motherName">Mother's Name</Label>
                  <Input
                    id="motherName"
                    value={formData.motherName}
                    onChange={(e) => updateField('motherName', e.target.value)}
                  />
                </div>
              </div>

              {/* CNIC Information */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fatherCnic" className={errors.fatherCnic ? 'text-destructive' : ''}>
                    Father's CNIC <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="fatherCnic"
                    placeholder="12345-1234567-1"
                    value={formData.fatherCnic}
                    onChange={(e) => updateField('fatherCnic', e.target.value)}
                    className={errors.fatherCnic ? 'border-destructive' : ''}
                  />
                  {errors.fatherCnic && <p className="text-sm text-destructive">{errors.fatherCnic}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motherCnic" className={errors.motherCnic ? 'text-destructive' : ''}>
                    Mother's CNIC
                  </Label>
                  <Input
                    id="motherCnic"
                    placeholder="12345-1234567-1"
                    value={formData.motherCnic}
                    onChange={(e) => updateField('motherCnic', e.target.value)}
                    className={errors.motherCnic ? 'border-destructive' : ''}
                  />
                  {errors.motherCnic && <p className="text-sm text-destructive">{errors.motherCnic}</p>}
                </div>
              </div>

              {/* B-Form */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="bForm" className={errors.bFormNumber ? 'text-destructive' : ''}>
                    B-Form Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="bForm"
                    placeholder="B-2020-001234"
                    value={formData.bFormNumber}
                    onChange={(e) => updateField('bFormNumber', e.target.value)}
                    className={errors.bFormNumber ? 'border-destructive' : ''}
                  />
                  {errors.bFormNumber && <p className="text-sm text-destructive">{errors.bFormNumber}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="previousSchool">Previous School</Label>
                  <Input
                    id="previousSchool"
                    value={formData.previousSchool}
                    onChange={(e) => updateField('previousSchool', e.target.value)}
                  />
                </div>
              </div>

              {/* Academic Information */}
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="class" className={errors.className ? 'text-destructive' : ''}>
                    Class <span className="text-destructive">*</span>
                  </Label>
                  <Select 
                    value={formData.class} 
                    onValueChange={(val) => {
                      updateField('class', val);
                      setErrors({ ...errors, className: undefined });
                    }}
                  >
                    <SelectTrigger className={errors.className ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 8 }, (_, i) => (
                        <SelectItem key={i + 5} value={String(i + 5)}>
                          Class {i + 5}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.className && <p className="text-sm text-destructive">{errors.className}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="section" className={errors.section ? 'text-destructive' : ''}>
                    Section <span className="text-destructive">*</span>
                  </Label>
                  <Select 
                    value={formData.section} 
                    onValueChange={(val) => {
                      updateField('section', val);
                      setErrors({ ...errors, section: undefined });
                    }}
                  >
                    <SelectTrigger className={errors.section ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">Section A</SelectItem>
                      <SelectItem value="B">Section B</SelectItem>
                      <SelectItem value="C">Section C</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.section && <p className="text-sm text-destructive">{errors.section}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="group">Group</Label>
                  <Select value={formData.group} onValueChange={(val) => updateField('group', val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Science">Science</SelectItem>
                      <SelectItem value="Arts">Arts</SelectItem>
                      <SelectItem value="Commerce">Commerce</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rollNumber" className={errors.rollNumber ? 'text-destructive' : ''}>
                    Roll Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="rollNumber"
                    type="number"
                    value={formData.rollNumber}
                    onChange={(e) => updateField('rollNumber', e.target.value)}
                    className={errors.rollNumber ? 'border-destructive' : ''}
                  />
                  {errors.rollNumber && <p className="text-sm text-destructive">{errors.rollNumber}</p>}
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone" className={errors.phone ? 'text-destructive' : ''}>
                    Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="phone"
                    placeholder="0300-1234567"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className={errors.phone ? 'border-destructive' : ''}
                  />
                  {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alternatePhone">Alternate Phone</Label>
                  <Input
                    id="alternatePhone"
                    placeholder="0321-7654321"
                    value={formData.alternatePhone}
                    onChange={(e) => updateField('alternatePhone', e.target.value)}
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address" className={errors.address ? 'text-destructive' : ''}>
                  Address <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  rows={3}
                  className={errors.address ? 'border-destructive' : ''}
                />
                {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
              </div>

              {/* Photo Upload */}
              <div className="space-y-2">
                <Label htmlFor="photo">Student Photo</Label>
                <div className="flex items-center gap-4">
                  <Input id="photo" type="file" accept="image/*" />
                  <Button type="button" variant="outline" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Upload
                  </Button>
                </div>
              </div>

              {/* Fee Plan Selection */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">Fee Plan</h3>
                <div className="space-y-2">
                  <Label htmlFor="feePlan">Select Fee Plan</Label>
                  <Select
                    value={selectedFeePlanId?.toString() || ''}
                    onValueChange={(val) => setSelectedFeePlanId(val ? parseInt(val) : null)}
                  >
                    <SelectTrigger className="w-full md:w-1/2">
                      <SelectValue placeholder="Select a fee plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {feePlans.map((plan) => {
                        const total = plan.feeHeads?.reduce((sum, h) => sum + (h.amount || 0), 0) || 0;
                        return (
                          <SelectItem key={plan.id} value={plan.id.toString()}>
                            {plan.name} - PKR {total.toLocaleString()} {plan.monthly ? '(Monthly)' : '(One-time)'}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {feePlans.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No fee plans available. Please create fee plans in Fee Configuration first.
                    </p>
                  )}
                  {selectedFeePlanId && (
                    <div className="mt-3 p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium mb-2">Included Fee Heads:</p>
                      <div className="flex flex-wrap gap-2">
                        {feePlans.find(p => p.id === selectedFeePlanId)?.feeHeads?.map((head) => (
                          <span key={head.id} className="text-xs px-2 py-1 bg-background rounded border">
                            {head.name}: PKR {head.amount?.toLocaleString()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="gap-2 bg-gradient-primary" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save & Generate Voucher
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/students')}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default AddStudent;
