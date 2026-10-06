import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
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
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Loader2, Pencil } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { feeHeadApi } from "@/api/fees.api";
import type { FeeHead } from "@/types";
import { validateRequired, hasErrors } from "@/lib/validation";
import FeePlanManagement from "@/components/settings/FeePlanManagement";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

interface FormErrors {
  name?: string;
  amount?: string;
}

const FeeConfiguration = () => {
  const [feeHeads, setFeeHeads] = useState<FeeHead[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingHead, setEditingHead] = useState<FeeHead | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    admissionOnly: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    fetchFeeHeads();
  }, []);

  const fetchFeeHeads = async () => {
    setLoading(true);
    try {
      const data = await feeHeadApi.getAll();
      setFeeHeads(data);
    } catch (error) {
      console.error("Failed to fetch fee heads:", error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const nameError = validateRequired(formData.name, "Fee head name");
    if (nameError) {
      newErrors.name = nameError;
    } else if (formData.name.length < 2) {
      newErrors.name = "Fee head name must be at least 2 characters";
    }

    const amount = parseFloat(formData.amount);
    if (!formData.amount) {
      newErrors.amount = "Amount is required";
    } else if (isNaN(amount) || amount <= 0) {
      newErrors.amount = "Amount must be a positive number";
    } else if (amount > 10000000) {
      newErrors.amount = "Amount seems too high";
    }

    setErrors(newErrors);
    return !hasErrors(newErrors);
  };

  const resetForm = () => {
    setFormData({ name: "", amount: "", admissionOnly: false });
    setEditingHead(null);
    setErrors({});
  };

  const handleOpenDialog = (feeHead?: FeeHead) => {
    if (feeHead) {
      setEditingHead(feeHead);
      setFormData({
        name: feeHead.name,
        amount: feeHead.amount?.toString() || "",
        admissionOnly: feeHead.admissionOnly || false,
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
      const payload: FeeHead = {
        name: formData.name,
        amount: parseFloat(formData.amount),
        active: true,
        admissionOnly: formData.admissionOnly,
      };

      if (editingHead?.id) {
        await feeHeadApi.update(editingHead.id, payload);
        toast({
          title: "Success",
          description: "Fee head updated successfully",
        });
      } else {
        await feeHeadApi.create(payload);
        toast({ title: "Success", description: "Fee head added successfully" });
      }

      setDialogOpen(false);
      resetForm();
      fetchFeeHeads();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save fee head",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFeeHead = async (id: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this fee head? It may affect existing fee plans.",
      )
    )
      return;

    try {
      await feeHeadApi.delete(id);
      toast({ title: "Success", description: "Fee head deleted successfully" });
      fetchFeeHeads();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete fee head",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (feeHead: FeeHead) => {
    if (!feeHead.id) return;
    try {
      await feeHeadApi.update(feeHead.id, {
        ...feeHead,
        active: !feeHead.active,
        // feeHead.active = true mene not opeartor sy guzara to ye hogya false
      });
      fetchFeeHeads();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update fee head",
        variant: "destructive",
      });
    }
  };

  const updateField = (field: "name" | "amount", value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Fee Configuration
          </h1>
          <p className="text-muted-foreground">
            Manage fee heads and create fee plans to assign to students
          </p>
        </div>

        {/* Fee Heads Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Fee Heads</CardTitle>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <Button onClick={() => handleOpenDialog()} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Fee Head
                </Button>
                <DialogContent className="sm:max-w-[450px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingHead ? "Edit Fee Head" : "Add Fee Head"}
                    </DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label className={errors.name ? "text-destructive" : ""}>
                        Fee Head Name{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        placeholder="e.g., Tuition Fee"
                        value={formData.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        className={errors.name ? "border-destructive" : ""}
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        className={errors.amount ? "text-destructive" : ""}
                      >
                        Amount (PKR) <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        type="number"
                        placeholder="e.g., 5000"
                        value={formData.amount}
                        onChange={(e) => updateField("amount", e.target.value)}
                        className={errors.amount ? "border-destructive" : ""}
                      />
                      {errors.amount && (
                        <p className="text-sm text-destructive">
                          {errors.amount}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Admission Only</Label>
                        <p className="text-sm text-muted-foreground">
                          Sirf admission voucher mein aayega
                        </p>
                      </div>
                      <Switch
                        checked={formData.admissionOnly}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, admissionOnly: checked })
                        }
                      />
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
                      {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : null}
                      {editingHead ? "Update" : "Add"}
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
                    <TableHead>Fee Head</TableHead>
                    <TableHead>Amount (PKR)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feeHeads.map((feeHead) => (
                    <TableRow key={feeHead.id}>
                      <TableCell className="font-medium">
                        {feeHead.name}
                      </TableCell>
                      <TableCell>
                        PKR {feeHead.amount?.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={feeHead.active}
                            onCheckedChange={() => handleToggleActive(feeHead)}
                          />
                          <span className="text-sm text-muted-foreground">
                            {feeHead.active ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {feeHead.admissionOnly ? (
                          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                            Admission Only
                          </span>
                        ) : (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            Monthly
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(feeHead)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            feeHead.id && handleDeleteFeeHead(feeHead.id)
                          }
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {feeHeads.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No fee heads configured. Add fee heads to create fee
                        plans.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Fee Plans Section */}
        <FeePlanManagement />
      </div>
    </DashboardLayout>
  );
};

export default FeeConfiguration;
