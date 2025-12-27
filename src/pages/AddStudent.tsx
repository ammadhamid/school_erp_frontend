import { useState } from 'react';
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
import { studentApi, downloadPdf } from '@/services/api';
import type { StudentDTO } from '@/types';

const AddStudent = () => {
  const navigate = useNavigate();
  const [dob, setDob] = useState<Date>();
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const studentData: StudentDTO = {
        fullName: formData.fullName,
        fatherName: formData.fatherName,
        motherName: formData.motherName || undefined,
        fatherCnic: formData.fatherCnic,
        motherCnic: formData.motherCnic || formData.fatherCnic, // Use father's if mother's not provided
        dateOfBirth: dob ? format(dob, 'yyyy-MM-dd') : undefined,
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
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn('w-full justify-start text-left font-normal', !dob && 'text-muted-foreground')}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dob ? format(dob, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={dob} onSelect={setDob} initialFocus className="pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Parent Information */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fatherName">Father's Name *</Label>
                  <Input
                    id="fatherName"
                    required
                    value={formData.fatherName}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motherName">Mother's Name</Label>
                  <Input
                    id="motherName"
                    value={formData.motherName}
                    onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                  />
                </div>
              </div>

              {/* CNIC Information */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fatherCnic">Father's CNIC *</Label>
                  <Input
                    id="fatherCnic"
                    placeholder="12345-1234567-1"
                    required
                    value={formData.fatherCnic}
                    onChange={(e) => setFormData({ ...formData, fatherCnic: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motherCnic">Mother's CNIC</Label>
                  <Input
                    id="motherCnic"
                    placeholder="12345-1234567-1"
                    value={formData.motherCnic}
                    onChange={(e) => setFormData({ ...formData, motherCnic: e.target.value })}
                  />
                </div>
              </div>

              {/* B-Form */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="bForm">B-Form Number *</Label>
                  <Input
                    id="bForm"
                    placeholder="B-2020-001234"
                    required
                    value={formData.bFormNumber}
                    onChange={(e) => setFormData({ ...formData, bFormNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="previousSchool">Previous School</Label>
                  <Input
                    id="previousSchool"
                    value={formData.previousSchool}
                    onChange={(e) => setFormData({ ...formData, previousSchool: e.target.value })}
                  />
                </div>
              </div>

              {/* Academic Information */}
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="class">Class *</Label>
                  <Select required value={formData.class} onValueChange={(val) => setFormData({ ...formData, class: val })}>
                    <SelectTrigger>
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="section">Section *</Label>
                  <Select required value={formData.section} onValueChange={(val) => setFormData({ ...formData, section: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">Section A</SelectItem>
                      <SelectItem value="B">Section B</SelectItem>
                      <SelectItem value="C">Section C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="group">Group</Label>
                  <Select value={formData.group} onValueChange={(val) => setFormData({ ...formData, group: val })}>
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
                  <Label htmlFor="rollNumber">Roll Number *</Label>
                  <Input
                    id="rollNumber"
                    type="number"
                    required
                    value={formData.rollNumber}
                    onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    placeholder="0300-1234567"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alternatePhone">Alternate Phone</Label>
                  <Input
                    id="alternatePhone"
                    placeholder="0321-7654321"
                    value={formData.alternatePhone}
                    onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                />
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
                      Save Student
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
