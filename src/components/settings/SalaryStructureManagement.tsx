import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Plus, Trash2, Loader2, Pencil, DollarSign } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { staffApi } from "@/api/staff.api";
import type { SalaryStructure, SalaryStructureDTO } from "@/types";

interface FormErrors {
  name?: string;
  basicPay?: string;
  allowances?: string;
  deductions?: string;
  tax?: string;
}

const SalaryStructureManagement = () => {
  const [structures, setStructures] = useState<SalaryStructure[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStructure, setEditingStructure] =
    useState<SalaryStructure | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<SalaryStructureDTO>({
    name: "",
    basicPay: 0,
    allowances: 0,
    deductions: 0,
    tax: 0,
  });

  useEffect(() => {
    fetchStructures();
  }, []);

  const fetchStructures = async () => {
    setLoading(true);
    try {
      const data = await staffApi.getSalaryStructures();
      setStructures(data);
    } catch (error) {
      console.error("Failed to fetch salary structures:", error);
      toast({
        title: "Error",
        description: "Failed to load salary structures",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Structure name is required";
    } else if (formData.name.length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }

    if (formData.basicPay <= 0) {
      newErrors.basicPay = "Basic pay must be greater than 0";
    } else if (formData.basicPay > 10000000) {
      newErrors.basicPay = "Basic pay seems too high";
    }

    if (formData.allowances < 0) {
      newErrors.allowances = "Allowances cannot be negative";
    }

    if (formData.deductions < 0) {
      newErrors.deductions = "Deductions cannot be negative";
    }

    if (formData.tax < 0) {
      newErrors.tax = "Tax cannot be negative";
    } else if (formData.tax > 100) {
      newErrors.tax = "Tax percentage cannot exceed 100%";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      name: "",
      basicPay: 0,
      allowances: 0,
      deductions: 0,
      tax: 0,
    });
    setEditingStructure(null);
    setErrors({});
  };

  const handleOpenDialog = (structure?: SalaryStructure) => {
    if (structure) {
      setEditingStructure(structure);
      setFormData({
        name: structure.name,
        basicPay: structure.basicPay,
        allowances: structure.allowances,
        deductions: structure.deductions,
        tax: structure.tax,
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      if (editingStructure?.id) {
        await staffApi.updateSalaryStructure(editingStructure.id, formData);
        toast({
          title: "Success",
          description: "Salary structure updated successfully",
        });
      } else {
        await staffApi.createSalaryStructure(formData);
        toast({
          title: "Success",
          description: "Salary structure created successfully",
        });
      }

      setDialogOpen(false);
      resetForm();
      fetchStructures();
    } catch (error) {
      console.error("Failed to save salary structure:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to save salary structure",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this salary structure?"))
      return;

    try {
      await staffApi.deactivate(id);
      toast({
        title: "Success",
        description: "Salary structure deleted successfully",
      });
      fetchStructures();
    } catch (error) {
      console.error("Failed to delete salary structure:", error);
      toast({
        title: "Error",
        description:
          "Failed to delete salary structure. It may be assigned to staff.",
        variant: "destructive",
      });
    }
  };

  const calculateNetSalary = (
    structure: SalaryStructure | SalaryStructureDTO,
  ) => {
    const gross = structure.basicPay + structure.allowances;
    const taxAmount = (gross * structure.tax) / 100;
    return gross - structure.deductions - taxAmount;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Salary Structures
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Structure
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingStructure
                    ? "Edit Salary Structure"
                    : "Create Salary Structure"}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Structure Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Senior Teacher Package"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className={errors.name ? "border-destructive" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="basicPay">Basic Pay (PKR) *</Label>
                    <Input
                      id="basicPay"
                      type="number"
                      placeholder="e.g., 50000"
                      value={formData.basicPay || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          basicPay: parseFloat(e.target.value) || 0,
                        })
                      }
                      className={errors.basicPay ? "border-destructive" : ""}
                    />
                    {errors.basicPay && (
                      <p className="text-sm text-destructive">
                        {errors.basicPay}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="allowances">Allowances (PKR)</Label>
                    <Input
                      id="allowances"
                      type="number"
                      placeholder="e.g., 10000"
                      value={formData.allowances || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          allowances: parseFloat(e.target.value) || 0,
                        })
                      }
                      className={errors.allowances ? "border-destructive" : ""}
                    />
                    {errors.allowances && (
                      <p className="text-sm text-destructive">
                        {errors.allowances}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="deductions">Deductions (PKR)</Label>
                    <Input
                      id="deductions"
                      type="number"
                      placeholder="e.g., 2000"
                      value={formData.deductions || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          deductions: parseFloat(e.target.value) || 0,
                        })
                      }
                      className={errors.deductions ? "border-destructive" : ""}
                    />
                    {errors.deductions && (
                      <p className="text-sm text-destructive">
                        {errors.deductions}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tax">Tax (%)</Label>
                    <Input
                      id="tax"
                      type="number"
                      placeholder="e.g., 5"
                      value={formData.tax || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tax: parseFloat(e.target.value) || 0,
                        })
                      }
                      className={errors.tax ? "border-destructive" : ""}
                    />
                    {errors.tax && (
                      <p className="text-sm text-destructive">{errors.tax}</p>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Calculated Net Salary
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    PKR {calculateNetSalary(formData).toLocaleString()}
                  </p>
                </div>
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="gap-2"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {editingStructure ? "Update" : "Create"}
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
                <TableHead>Name</TableHead>
                <TableHead>Basic Pay</TableHead>
                <TableHead>Allowances</TableHead>
                <TableHead>Deductions</TableHead>
                <TableHead>Tax %</TableHead>
                <TableHead>Net Salary</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {structures.map((structure) => (
                <TableRow key={structure.id}>
                  <TableCell className="font-medium">
                    {structure.name}
                  </TableCell>
                  <TableCell>
                    PKR {structure.basicPay?.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    PKR {structure.allowances?.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    PKR {structure.deductions?.toLocaleString()}
                  </TableCell>
                  <TableCell>{structure.tax}%</TableCell>
                  <TableCell className="font-medium text-primary">
                    PKR {calculateNetSalary(structure).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(structure)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(structure.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {structures.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No salary structures configured. Create one to assign to
                    staff members.
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

export default SalaryStructureManagement;
