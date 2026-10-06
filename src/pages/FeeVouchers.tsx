import { useState, useEffect, useMemo, useRef } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  FileText,
  Download,
  Plus,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Users,
  Calendar,
  Search,
  CheckCircle2,
  Clock,
  Receipt,
  Wallet,
  Printer,
  ChevronDown,
  Filter,
  X,
  Zap,
  BadgeCheck,
} from "lucide-react";

import { downloadPdf } from "@/api/donwloadPdf";
import { voucherApi } from "@/api/voucher.api";
import { studentApi } from "@/api/student.api";
import { toast } from "@/hooks/use-toast";
import type { Voucher, Student } from "@/types";

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────

const formatPKR = (amount: number | undefined) =>
  `PKR ${Number(amount || 0).toLocaleString("en-PK")}`;

const formatMonth = (month?: string) => {
  if (!month) return "—";
  try {
    const [y, m] = month.split("-");
    return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  } catch {
    return month;
  }
};

// ─────────────────────────────────────────────────────────
// Status Badge
// ─────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status?: string }) => {
  const s = (status || "PENDING").toUpperCase();
  if (s === "PAID")
    return (
      <Badge className="bg-green-500/15 text-green-600 dark:text-green-400 border-green-300/40 gap-1">
        <BadgeCheck className="h-3 w-3" /> Paid
      </Badge>
    );
  if (s === "OVERDUE")
    return (
      <Badge variant="destructive" className="gap-1">
        <AlertTriangle className="h-3 w-3" /> Overdue
      </Badge>
    );
  return (
    <Badge className="bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-300/40 gap-1">
      <Clock className="h-3 w-3" /> Pending
    </Badge>
  );
};

// ─────────────────────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
  loading?: boolean;
}
const StatCard = ({ label, value, icon, iconBg, loading }: StatCardProps) => (
  <Card>
    <CardContent className="p-5 flex items-center gap-4">
      <div
        className={`h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin mt-1 text-muted-foreground" />
        ) : (
          <p className="text-2xl font-bold truncate">{value}</p>
        )}
      </div>
    </CardContent>
  </Card>
);

// ─────────────────────────────────────────────────────────
// Generate All Progress Dialog
// ─────────────────────────────────────────────────────────

interface GenerateAllDialogProps {
  open: boolean;
  total: number;
  progress: number;
  success: number;
  failed: number;
  done: boolean;
  onClose: () => void;
}
const GenerateAllDialog = ({
  open,
  total,
  progress,
  success,
  failed,
  done,
  onClose,
}: GenerateAllDialogProps) => (
  <Dialog open={open} onOpenChange={(o) => !o && done && onClose()}>
    <DialogContent
      className="sm:max-w-sm"
      onInteractOutside={(e) => !done && e.preventDefault()}
    >
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Generating Vouchers
        </DialogTitle>
        <DialogDescription>
          Processing all active students for the current month.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-2">
        <Progress
          value={total > 0 ? (progress / total) * 100 : 0}
          className="h-2"
        />

        <div className="grid grid-cols-3 text-center text-sm gap-2">
          <div className="rounded-lg bg-muted/60 p-2">
            <p className="text-muted-foreground text-xs">Total</p>
            <p className="font-bold text-lg">{total}</p>
          </div>
          <div className="rounded-lg bg-green-500/10 p-2">
            <p className="text-green-600 text-xs">Done</p>
            <p className="font-bold text-lg text-green-600">{success}</p>
          </div>
          <div className="rounded-lg bg-destructive/10 p-2">
            <p className="text-destructive text-xs">Skipped</p>
            <p className="font-bold text-lg text-destructive">{failed}</p>
          </div>
        </div>

        {done && (
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-950/30 rounded-lg px-3 py-2">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            Generation complete!
          </div>
        )}
      </div>

      {done && (
        <DialogFooter>
          <Button onClick={onClose}>Done</Button>
        </DialogFooter>
      )}
    </DialogContent>
  </Dialog>
);

// ─────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────

const FeeVouchers = () => {
  // ── Data ─────────────────────────────────────────────

  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Search & Filter ──────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "PENDING" | "OVERDUE" | "PAID"
  >("ALL");

  // ── Generate All ─────────────────────────────────────
  const [genAllDialogOpen, setGenAllDialogOpen] = useState(false);
  const [genAllProgress, setGenAllProgress] = useState(0);
  const [genAllSuccess, setGenAllSuccess] = useState(0);
  const [genAllFailed, setGenAllFailed] = useState(0);
  const [genAllDone, setGenAllDone] = useState(false);
  const [confirmGenAllOpen, setConfirmGenAllOpen] = useState(false);
  // ADDING THINGS FOR ADMISSION VOUCHER GENRATEION
  const [confirmAdmissionOpen, setConfirmAdmissionOpen] = useState(false);
  const [admissionProgress, setAdmissionProgress] = useState(0);
  const [admissionSuccess, setAdmissionSuccess] = useState(0);
  const [admissionFailed, setAdmissionFailed] = useState(0);
  const [admissionDone, setAdmissionDone] = useState(false);
  const [admissionDialogOpen, setAdmissionDialogOpen] = useState(false);

  // ── Late Fees ────────────────────────────────────────
  const [applyingLateFees, setApplyingLateFees] = useState(false);
  const [confirmLateFeesOpen, setConfirmLateFeesOpen] = useState(false);

  // ── Mark Paid ────────────────────────────────────────
  const [markingPaid, setMarkingPaid] = useState<number | null>(null);

  // ── Downloading ──────────────────────────────────────
  const [downloading, setDownloading] = useState<number | null>(null);

  const [voucherView, setVoucherView] = useState<"MONTHLY" | "ADMISSION">(
    "MONTHLY",
  );

  // ─────────────────────────────────────────────────────
  // Fetch
  // ─────────────────────────────────────────────────────

  const fetchData = async () => {
    setLoading(true);
    // fetch data ka kaam sirf itna hai ky studentsData and voucherData ko get krna hai and then log krna hai bas
    try {
      const [vouchersData, studentsData] = await Promise.all([
        // unpaid vouchers ka number ajayega
        voucherApi.getUnpaid().catch(() => []),
        studentApi.getAll().catch(() => []),
      ]);

      const validStudents = studentsData.filter(
        (std: any) => std.id,
      ) as Student[];
      setVouchers(vouchersData);
      setStudents(validStudents);

      validStudents.forEach((e) => {});
    } catch {
      toast({ title: "Failed to fetch data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ─────────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────────

  const handleMarkPaid = async (id: number) => {
    setMarkingPaid(id);
    try {
      await voucherApi.markPaid(id);
      setVouchers((prev) => prev.filter((v) => v.id !== id));
      toast({ title: "✓ Voucher marked as paid" });
    } catch {
      toast({ title: "Failed to update voucher", variant: "destructive" });
    } finally {
      setMarkingPaid(null);
    }
  };

  const handleDownload = async (id: number) => {
    setDownloading(id);
    try {
      const blob = await voucherApi.getPdf(id);
      downloadPdf(blob, `voucher-${id}.pdf`);
    } catch {
      toast({ title: "Failed to download PDF", variant: "destructive" });
    } finally {
      setDownloading(null);
    }
  };

  const handlePrintPreview = async (id: number) => {
    try {
      const blob = await voucherApi.getPdf(id);
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch {
      toast({ title: "Failed to open PDF", variant: "destructive" });
    }
  };

  const handleGenerateAll = async () => {
    setConfirmGenAllOpen(false);
    setGenAllProgress(0);
    setGenAllSuccess(0);
    setGenAllFailed(0);
    setGenAllDone(false);
    setGenAllDialogOpen(true);

    const currentMonth = new Date().toISOString().slice(0, 7);
    let success = 0;
    let failed = 0;

    let freshStudents: Student[] = [];
    try {
      const data = await studentApi.getAll();
      freshStudents = data.filter((s: any) => s.id) as Student[];
      setStudents(freshStudents);
    } catch (error) {
      toast({ title: "Failed to fetch students", variant: "destructive" });
      setGenAllDone(true);
      return;
    }

    for (let i = 0; i < freshStudents.length; i++) {
      const student = freshStudents[i];
      if (student.id) {
        try {
          await voucherApi.create({
            studentId: student.id,
            month: currentMonth,
            totalAmount: 0,
          });
          success++;
        } catch {
          failed++;
        }
      }
      setGenAllProgress(i + 1);
      setGenAllSuccess(success);
      setGenAllFailed(failed);
    }

    setGenAllDone(true);
    fetchData();
  };

  const handleGenerateAdmissionVouchers = async () => {
    setConfirmAdmissionOpen(false);

    setAdmissionProgress(0);
    setAdmissionSuccess(0);
    setAdmissionFailed(0);
    setAdmissionDone(false);

    setAdmissionDialogOpen(true);

    let success = 0;
    let failed = 0;

    let freshStudents: Student[] = [];

    try {
      const data = await studentApi.getAll();

      freshStudents = data.filter((s: any) => s.id) as Student[];

      setStudents(freshStudents);
    } catch {
      toast({
        title: "Failed to fetch students",
        variant: "destructive",
      });

      setAdmissionDone(true);

      return;
    }

    for (let i = 0; i < freshStudents.length; i++) {
      const student = freshStudents[i];

      if (student.id) {
        try {
          const blob = await voucherApi.generateAdmissionVoucher(student.id);

          success++;
        } catch {
          failed++;
        }
      }

      setAdmissionProgress(i + 1);

      setAdmissionSuccess(success);

      setAdmissionFailed(failed);
    }

    setAdmissionDone(true);
    fetchData();
    toast({
      title: "Admission vouchers generated",
      description: `Done ${success}, Skipped ${failed}`,
    });
  };

  const handleApplyLateFees = async () => {
    setConfirmLateFeesOpen(false);
    setApplyingLateFees(true);
    try {
      await voucherApi.applyLateFees();
      toast({ title: "✓ Late fees applied where applicable" });
      fetchData();
    } catch {
      toast({ title: "Failed to apply late fees", variant: "destructive" });
    } finally {
      setApplyingLateFees(false);
    }
  };

  // ─────────────────────────────────────────────────────
  // Computed
  // ─────────────────────────────────────────────────────

  const monthOptions = useMemo(() => {
    const options: { value: string; label: string }[] = [];
    const now = new Date();
    for (let i = -12; i <= 3; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const value = d.toISOString().slice(0, 7);
      const label = d.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
      options.push({ value, label });
    }
    return options;
  }, []);

  const filteredVouchers = useMemo(() => {
    let result = [...vouchers];

    // =========================
    // VOUCHER TYPE FILTER
    // =========================

    result = result.filter((v: any) => {
      const type = (v.voucherType || "").toUpperCase();

      if (voucherView === "MONTHLY") {
        return type === "MONTHLY";
      }

      return type === "ADMISSION";
    });

    // =========================
    // SEARCH FILTER
    // =========================

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();

      result = result.filter(
        (v: any) =>
          v.studentName?.toLowerCase().includes(q) ||
          v.student?.fullName?.toLowerCase().includes(q) ||
          v.grNumber?.toLowerCase().includes(q) ||
          String(v.id).includes(q),
      );
    }

    // =========================
    // STATUS FILTER
    // =========================

    if (statusFilter !== "ALL") {
      result = result.filter((v: any) => {
        const status = v.paid ? "PAID" : "PENDING";

        return status === statusFilter;
      });
    }

    return result;
  }, [vouchers, voucherView, searchQuery, statusFilter]);

  const totalPending = useMemo(
    () => vouchers.reduce((s, v) => s + Number(v.totalAmount || 0), 0),
    [vouchers],
  );

  const overdueCount = useMemo(
    () =>
      vouchers.filter((v: any) => (v.status || "").toUpperCase() === "OVERDUE")
        .length,
    [vouchers],
  );

  const currentMonthLabel = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // ─────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────

  return (
    <DashboardLayout>
      <TooltipProvider>
        <div className="space-y-6 animate-fade-in pb-10">
          {/* ── Header ──────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Fee Vouchers
              </h1>
              <p className="text-muted-foreground mt-1">
                Generate, manage, and track monthly fee vouchers
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Refresh */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={fetchData}
                    disabled={loading}
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Refresh data</TooltipContent>
              </Tooltip>

              {/* Apply Late Fees */}
              <Tooltip>
                <TooltipTrigger asChild>
                  {voucherView === "MONTHLY" && (
                    <Button
                      variant="outline"
                      onClick={() => setConfirmLateFeesOpen(true)}
                      disabled={applyingLateFees}
                      className="gap-2 text-orange-600 border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-950/30"
                    >
                      {applyingLateFees ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <AlertTriangle className="h-4 w-4" />
                      )}
                      Apply Late Fees
                    </Button>
                  )}
                </TooltipTrigger>
                <TooltipContent>
                  Apply late fees to all pending overdue vouchers
                </TooltipContent>
              </Tooltip>

              {/* Generate All */}
              {voucherView === "MONTHLY" && (
                <Button
                  variant="outline"
                  onClick={() => setConfirmGenAllOpen(true)}
                  disabled={loading || students.length === 0}
                  className="gap-2"
                >
                  <Zap className="h-4 w-4" />
                  Generate Monthly
                  <Badge
                    variant="secondary"
                    className="ml-1 h-5 px-1.5 text-xs"
                  >
                    {students.length}
                  </Badge>
                </Button>
              )}

              {/* GENERATE ADMISSION VOUCHER */}
              {voucherView === "ADMISSION" && (
                <Button
                  variant="outline"
                  onClick={() => setConfirmAdmissionOpen(true)}
                  disabled={loading || students.length === 0}
                  className="gap-2"
                >
                  <Receipt className="h-4 w-4" />
                  Admission Vouchers
                  <Badge
                    variant="secondary"
                    className="ml-1 h-5 px-1.5 text-xs"
                  >
                    {students.length}
                  </Badge>
                </Button>
              )}
            </div>
          </div>

          {/* ── Stats ───────────────────────────────────── */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Unpaid Vouchers"
              value={vouchers.length}
              icon={<Receipt className="h-5 w-5 text-primary" />}
              iconBg="bg-primary/10"
              loading={loading}
            />
            <StatCard
              label="Total Pending"
              value={formatPKR(totalPending)}
              icon={<Wallet className="h-5 w-5 text-destructive" />}
              iconBg="bg-destructive/10"
              loading={loading}
            />
            <StatCard
              label="Overdue"
              value={overdueCount}
              icon={<AlertTriangle className="h-5 w-5 text-orange-500" />}
              iconBg="bg-orange-500/10"
              loading={loading}
            />
            <StatCard
              label="Active Students"
              value={students.length}
              icon={<Users className="h-5 w-5 text-blue-500" />}
              iconBg="bg-blue-500/10"
              loading={loading}
            />
          </div>

          {/* ── Table Card ──────────────────────────────── */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <CardTitle>
                  Voucher List
                  {filteredVouchers.length !== vouchers.length && (
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      ({filteredVouchers.length} of {vouchers.length})
                    </span>
                  )}
                </CardTitle>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center rounded-lg border p-1 bg-muted/40">
                    <Button
                      size="sm"
                      variant={voucherView === "MONTHLY" ? "default" : "ghost"}
                      onClick={() => setVoucherView("MONTHLY")}
                      className="h-8"
                    >
                      Fee Vouchers
                    </Button>

                    <Button
                      size="sm"
                      variant={
                        voucherView === "ADMISSION" ? "default" : "ghost"
                      }
                      onClick={() => setVoucherView("ADMISSION")}
                      className="h-8"
                    >
                      Admission Vouchers
                    </Button>
                  </div>
                  {/* Status Filter */}
                  <Select
                    value={statusFilter}
                    onValueChange={(v) => setStatusFilter(v as any)}
                  >
                    <SelectTrigger className="w-36 h-9">
                      <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Status</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="OVERDUE">Overdue</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                    <Input
                      placeholder="Search name, GR, month…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 h-9 w-52"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <p className="text-sm">Loading vouchers…</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="pl-6 w-16">#</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Month</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Late Fee</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right pr-6">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVouchers.map((v: any) => (
                        <TableRow
                          key={v.id}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          <TableCell className="pl-6 font-mono text-xs text-muted-foreground">
                            {v.id}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2.5">
                              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                                {(
                                  v.studentName ||
                                  v.student?.fullName ||
                                  "?"
                                ).charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-sm leading-tight truncate max-w-[140px]">
                                  {v.studentName || v.student?.fullName}
                                </p>
                                {(v.grNumber || v.student?.grNumber) && (
                                  <p className="text-xs text-muted-foreground">
                                    GR: {v.grNumber || v.student?.grNumber}
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5 text-sm">
                              <Calendar className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />

                              {new Date(
                                v.voucherYear,
                                v.voucherMonth - 1,
                              ).toLocaleString("default", {
                                month: "long",
                                year: "numeric",
                              })}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-sm">
                              {formatPKR(v.totalAmount)}
                            </span>
                          </TableCell>
                          <TableCell>
                            {v.lateFee ? (
                              <span className="text-sm text-orange-500 font-medium">
                                +{formatPKR(v.lateFee)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-sm">
                                —
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {v.dueDate
                                ? new Date(v.dueDate).toLocaleDateString(
                                    "en-PK",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    },
                                  )
                                : "—"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={v.paid ? "PAID" : "PENDING"} />
                          </TableCell>
                          <TableCell className="pr-6">
                            <div className="flex items-center justify-end gap-1">
                              {/* Print */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() =>
                                      v.id && handlePrintPreview(v.id)
                                    }
                                  >
                                    <Printer className="h-3.5 w-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Preview PDF</TooltipContent>
                              </Tooltip>

                              {/* Download */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => v.id && handleDownload(v.id)}
                                    disabled={downloading === v.id}
                                  >
                                    {downloading === v.id ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <Download className="h-3.5 w-3.5" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Download PDF</TooltipContent>
                              </Tooltip>

                              {/* Mark Paid */}
                              {!v.paid && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 gap-1.5 text-green-600 border-green-300 hover:bg-green-50 dark:hover:bg-green-950/30"
                                  onClick={() => v.id && handleMarkPaid(v.id)}
                                  disabled={markingPaid === v.id}
                                >
                                  {markingPaid === v.id ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                  )}
                                  Mark Paid
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}

                      {filteredVouchers.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-16">
                            <div className="flex flex-col items-center gap-3 text-muted-foreground">
                              <FileText className="h-10 w-10 opacity-30" />
                              <p className="font-medium">
                                {searchQuery || statusFilter !== "ALL"
                                  ? "No matching vouchers found"
                                  : "No unpaid vouchers at this time"}
                              </p>
                              {(searchQuery || statusFilter !== "ALL") && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSearchQuery("");
                                    setStatusFilter("ALL");
                                  }}
                                >
                                  <X className="h-3.5 w-3.5 mr-1.5" />
                                  Clear filters
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ─────────────────────────────────────────────── */}
        {/* Generate Single Voucher Dialog                 */}
        {/* ─────────────────────────────────────────────── */}

        {/* ─────────────────────────────────────────────── */}
        {/* Confirm Generate All                           */}
        {/* ─────────────────────────────────────────────── */}
        <AlertDialog
          open={confirmGenAllOpen}
          onOpenChange={setConfirmGenAllOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Generate Vouchers for All Students?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This will generate <strong>{students.length} vouchers</strong>{" "}
                for <strong>{currentMonthLabel}</strong>. Students who already
                have a voucher for this month will be skipped automatically.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleGenerateAll}>
                Yes, Generate All
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* ─────────────────────────────────────────────── */}
        {/* Generate All Progress Dialog                   */}
        {/* ─────────────────────────────────────────────── */}
        <GenerateAllDialog
          open={genAllDialogOpen}
          total={students.length}
          progress={genAllProgress}
          success={genAllSuccess}
          failed={genAllFailed}
          done={genAllDone}
          onClose={() => setGenAllDialogOpen(false)}
        />

        {/* GENERATE ADMISSION PROGRESS DIALOG */}
        <GenerateAllDialog
          open={admissionDialogOpen}
          total={students.length}
          progress={admissionProgress}
          success={admissionSuccess}
          failed={admissionFailed}
          done={admissionDone}
          onClose={() => setAdmissionDialogOpen(false)}
        />

        {/* ─────────────────────────────────────────────── */}
        {/* Confirm Apply Late Fees                        */}
        {/* ─────────────────────────────────────────────── */}
        <AlertDialog
          open={confirmLateFeesOpen}
          onOpenChange={setConfirmLateFeesOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Apply Late Fees?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This will apply late fee charges to all overdue unpaid vouchers.
                This action cannot be undone. Make sure all due dates are
                correct before proceeding.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleApplyLateFees}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                Apply Late Fees
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Admission Vouhcer  */}
        <AlertDialog
          open={confirmAdmissionOpen}
          onOpenChange={setConfirmAdmissionOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-blue-500" />
                Generate Admission Vouchers?
              </AlertDialogTitle>

              <AlertDialogDescription>
                This will generate admission vouchers for all students. Existing
                vouchers may be skipped automatically.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>

              <AlertDialogAction onClick={handleGenerateAdmissionVouchers}>
                Generate Admission Vouchers
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TooltipProvider>
    </DashboardLayout>
  );
};

export default FeeVouchers;
