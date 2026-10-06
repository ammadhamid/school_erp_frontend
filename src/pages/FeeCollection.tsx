import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Search,
  Loader2,
  DollarSign,
  Printer,
  Receipt,
  Users,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  BookOpen,
  ChevronRight,
  X,
  RefreshCw,
  TrendingUp,
  CalendarDays,
  Phone,
  GraduationCap,
  Banknote,
  History,
  AlertCircle,
  Plus,
  Filter,
} from "lucide-react";

import { studentApi } from "@/api/student.api";
import { voucherApi } from "@/api/voucher.api";
import { feeHeadApi } from "@/api/fees.api";

import { toast } from "@/hooks/use-toast";

import type { StudentDTO, Voucher, PaymentRequest, Payment } from "@/types";

/* ────────────────────────────────────────────────────────────
   Types & Utilities
   ──────────────────────────────────────────────────────────── */

interface LedgerEntry {
  id: number;
  totalCharged: number;
  totalPaid: number;
  totalDue: number;
  lastUpdated?: string;
}

const formatPKR = (amount: number | string | undefined | null) =>
  `PKR ${Number(amount || 0).toLocaleString("en-PK")}`;

const formatDate = (d?: string) =>
  d
    ? new Date(d).toLocaleDateString("en-PK", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

/* ────────────────────────────────────────────────────────────
   Stat Card
   ──────────────────────────────────────────────────────────── */

type Accent = "default" | "destructive" | "warning" | "success" | "blue";

const accentClasses: Record<Accent, string> = {
  default: "text-primary bg-primary/10",
  destructive: "text-destructive bg-destructive/10",
  warning: "text-yellow-600 bg-yellow-500/10",
  success: "text-green-600 bg-green-500/10",
  blue: "text-blue-600 bg-blue-500/10",
};

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon: React.ReactNode;
  accent?: Accent;
  loading?: boolean;
}

const StatCard = ({
  label,
  value,
  hint,
  icon,
  accent = "default",
  loading = false,
}: StatCardProps) => (
  <Card className="overflow-hidden transition-all hover:shadow-md">
    <CardContent className="p-5 flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
          {label}
        </p>
        {loading ? (
          <Skeleton className="h-7 w-24 mt-2" />
        ) : (
          <p className="text-2xl font-bold mt-1 truncate">{value}</p>
        )}
        {hint && !loading && (
          <p className="text-xs text-muted-foreground mt-1">{hint}</p>
        )}
      </div>
      <div
        className={`h-12 w-12 rounded-xl grid place-items-center shrink-0 ${accentClasses[accent]}`}
      >
        {icon}
      </div>
    </CardContent>
  </Card>
);

/* ────────────────────────────────────────────────────────────
   Payment Dialog
   ──────────────────────────────────────────────────────────── */

interface PaymentDialogProps {
  open: boolean;
  voucher: Voucher | null;
  student: StudentDTO | null;
  discount: number;
  collecting: boolean;
  onDiscountChange: (v: number) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const PaymentDialog = ({
  open,
  voucher,
  student,
  discount,
  collecting,
  onDiscountChange,
  onConfirm,
  onCancel,
}: PaymentDialogProps) => {
  const gross = Number((voucher as any)?.totalAmount || 0);
  const net = Math.max(0, gross - discount);
  const discountPct = gross > 0 ? ((discount / gross) * 100).toFixed(1) : "0";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Collect Payment
          </DialogTitle>
          <DialogDescription>
            Review and confirm payment for{" "}
            <span className="font-medium text-foreground">
              {student?.fullName}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-lg border bg-muted/30 p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Voucher #</span>
              <span className="font-mono font-medium">{voucher?.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Month</span>
              <span className="font-medium">
                {(voucher as any)?.month || "Monthly Fee"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gross Amount</span>
              <span className="font-semibold">{formatPKR(gross)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center justify-between">
              <span>Discount (PKR)</span>
              {discount > 0 && (
                <span className="text-xs text-muted-foreground">
                  {discountPct}% off
                </span>
              )}
            </label>
            <Input
              type="number"
              min={0}
              max={gross}
              value={discount}
              onChange={(e) =>
                onDiscountChange(
                  Math.min(gross, Math.max(0, Number(e.target.value))),
                )
              }
              placeholder="Enter discount amount"
            />
            <div className="flex gap-2 flex-wrap">
              {[0, 100, 500, 1000].map((d) => (
                <Button
                  key={d}
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => onDiscountChange(Math.min(gross, d))}
                >
                  {d === 0 ? "Reset" : `−${formatPKR(d)}`}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between rounded-lg bg-primary/5 border border-primary/20 p-4">
            <span className="font-semibold">Final Amount</span>
            <span className="text-2xl font-bold text-primary">
              {formatPKR(net)}
            </span>
          </div>

          {discount > 0 && (
            <div className="flex items-start gap-2 text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-md p-2.5">
              <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span>
                Discount of {formatPKR(discount)} ({discountPct}%) will be
                applied to this payment.
              </span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onCancel} disabled={collecting}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={collecting || !voucher}>
            {collecting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4 mr-2" />
            )}
            Confirm Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/* ────────────────────────────────────────────────────────────
   Main Page
   ──────────────────────────────────────────────────────────── */

const FeeCollection = () => {
  // ── Search ─────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<StudentDTO[]>([]);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // ── Selected Student ───────────────────────────────────
  const [selectedStudent, setSelectedStudent] = useState<StudentDTO | null>(
    null,
  );
  const [studentLoading, setStudentLoading] = useState(false);
  const [studentDue, setStudentDue] = useState(0);
  const [studentPayments, setStudentPayments] = useState<Payment[]>([]);
  const [studentLedger, setStudentLedger] = useState<LedgerEntry | null>(null);

  // ── Vouchers ───────────────────────────────────────────
  const [unpaidVouchers, setUnpaidVouchers] = useState<Voucher[]>([]);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [classFilter, setClassFilter] = useState<string>("all");

  // ── Payment dialog ─────────────────────────────────────
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [discount, setDiscount] = useState(0);
  const [collecting, setCollecting] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  // ── Late fees ──────────────────────────────────────────
  const [applyingLateFees, setApplyingLateFees] = useState(false);

  /* ─── Close search dropdown on outside click ─── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchResults([]);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ─── Initial load ─── */
  useEffect(() => {
    loadDashboardData();
  }, []);

  /* ─── Live search (debounced) ─── */
  useEffect(() => {
    if (!searchQuery.trim() || selectedStudent?.fullName === searchQuery) {
      if (!searchQuery.trim()) setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await studentApi.search(searchQuery);
        setSearchResults(results || []);
      } catch {
        /* silent */
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedStudent]);

  /* ─── Data loaders ─── */
  const loadDashboardData = useCallback(async () => {
    setDashboardLoading(true);
    try {
      const vouchers = await voucherApi.getUnpaid();
      setUnpaidVouchers(vouchers || []);
    } catch {
      toast({
        title: "Failed to load vouchers",
        variant: "destructive",
      });
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  const loadStudentDetails = useCallback(async (studentId: number) => {
    setStudentLoading(true);
    try {
      const [due, payments, ledger] = await Promise.allSettled([
        studentApi.getStudentDue(studentId),
        feeHeadApi.getStudentPayments(studentId),
        fetch(`/api/ledger/student/${studentId}`).then((r) =>
          r.ok ? r.json() : null,
        ),
      ]);

      setStudentDue(due.status === "fulfilled" ? Number(due.value) : 0);
      setStudentPayments(
        payments.status === "fulfilled" ? payments.value || [] : [],
      );
      setStudentLedger(
        ledger.status === "fulfilled" && ledger.value ? ledger.value : null,
      );
    } catch {
      toast({
        title: "Failed to load student data",
        variant: "destructive",
      });
    } finally {
      setStudentLoading(false);
    }
  }, []);

  /* ─── Select student ─── */
  const handleSelectStudent = useCallback(
    async (student: StudentDTO) => {
      setSelectedStudent(student);
      setSearchQuery(student.fullName || "");
      setSearchResults([]);
      setSelectedVoucher(null);
      setDiscount(0);
      setStudentLedger(null);
      setStudentPayments([]);
      setStudentDue(0);

      if (student.id) await loadStudentDetails(student.id);
    },
    [loadStudentDetails],
  );

  const handleClearStudent = () => {
    setSelectedStudent(null);
    setSearchQuery("");
    setStudentDue(0);
    setStudentPayments([]);
    setStudentLedger(null);
    setSelectedVoucher(null);
  };

  /* ─── Collect payment ─── */
  const handleCollectPayment = async () => {
    if (!selectedStudent?.id || !selectedVoucher?.id) return;
    setCollecting(true);
    try {
      const gross = Number((selectedVoucher as any).totalAmount || 0);
      const paymentData: PaymentRequest = {
        studentId: selectedStudent.id,
        feePlanId: (selectedStudent as any).feePlanId || 1,
        amountPaid: Math.max(0, gross - discount),
        discount,
      };

      await feeHeadApi.makePayments(paymentData);
      await voucherApi.markPaid(selectedVoucher.id);

      toast({
        title: "✓ Payment Collected",
        description: `${formatPKR(gross - discount)} received from ${selectedStudent.fullName}.`,
      });

      // Parallel refresh
      await Promise.all([
        loadDashboardData(),
        loadStudentDetails(selectedStudent.id),
      ]);

      setSelectedVoucher(null);
      setDiscount(0);
      setPaymentDialogOpen(false);
    } catch {
      toast({
        title: "Payment Failed",
        description: "Unable to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCollecting(false);
    }
  };

  /* ─── Apply late fees ─── */
  const handleApplyLateFees = async () => {
    setApplyingLateFees(true);
    try {
      const res = await fetch("/api/vouchers/apply-late-fees", {
        method: "POST",
      });
      if (!res.ok) throw new Error();
      toast({
        title: "Late fees applied",
        description: "All eligible pending students have been updated.",
      });
      await loadDashboardData();
      if (selectedStudent?.id) await loadStudentDetails(selectedStudent.id);
    } catch {
      toast({
        title: "Failed to apply late fees",
        variant: "destructive",
      });
    } finally {
      setApplyingLateFees(false);
    }
  };

  /* ─── PDF voucher ─── */
  const handlePrintVoucher = async (voucherId: number) => {
    try {
      const pdf = await voucherApi.getPdf(voucherId);
      const url = window.URL.createObjectURL(pdf);
      window.open(url, "_blank");
      setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
    } catch {
      toast({ title: "Failed to load PDF", variant: "destructive" });
    }
  };

  /* ─── Computed values ─── */
  const studentVouchers = useMemo(() => {
    if (!selectedStudent?.id) return [];
    return unpaidVouchers.filter(
      (v: any) => v.studentId === selectedStudent.id,
    );
  }, [selectedStudent, unpaidVouchers]);

  const pendingAmount = useMemo(
    () =>
      unpaidVouchers.reduce((s, v: any) => s + Number(v.totalAmount || 0), 0),
    [unpaidVouchers],
  );

  const totalCollections = useMemo(
    () =>
      studentPayments.reduce((s, p: any) => s + Number(p.amountPaid || 0), 0),
    [studentPayments],
  );

  const uniqueStudentsPending = useMemo(
    () => new Set(unpaidVouchers.map((v: any) => v.studentId)).size,
    [unpaidVouchers],
  );

  const classOptions = useMemo(() => {
    const set = new Set<string>();
    unpaidVouchers.forEach((v: any) => v.className && set.add(v.className));
    return ["all", ...Array.from(set).sort()];
  }, [unpaidVouchers]);

  const filteredVouchers = useMemo(() => {
    if (classFilter === "all") return unpaidVouchers;
    return unpaidVouchers.filter((v: any) => v.className === classFilter);
  }, [unpaidVouchers, classFilter]);

  /* ─────────────────────────────────────────────
     RENDER
     ───────────────────────────────────────────── */
  return (
    <DashboardLayout>
      <TooltipProvider>
        <div className="space-y-6 p-4 md:p-6 max-w-[1600px] mx-auto">
          {/* ── Header ───────────────────────────── */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Wallet className="h-7 w-7 text-primary" />
                Fee Collection Center
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage student dues, vouchers, and collections in one place.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={loadDashboardData}
                    disabled={dashboardLoading}
                  >
                    <RefreshCw
                      className={`h-4 w-4 mr-2 ${
                        dashboardLoading ? "animate-spin" : ""
                      }`}
                    />
                    Refresh
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reload all unpaid vouchers</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    onClick={handleApplyLateFees}
                    disabled={applyingLateFees}
                  >
                    {applyingLateFees ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 mr-2" />
                    )}
                    Apply Late Fees
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Apply late fees to all overdue students
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* ── Stats ────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Pending Vouchers"
              value={unpaidVouchers.length}
              hint={`${uniqueStudentsPending} students`}
              icon={<Receipt className="h-5 w-5" />}
              accent="default"
              loading={dashboardLoading}
            />
            <StatCard
              label="Total Outstanding"
              value={formatPKR(pendingAmount)}
              icon={<AlertTriangle className="h-5 w-5" />}
              accent="destructive"
              loading={dashboardLoading}
            />
            <StatCard
              label="Selected Student Due"
              value={selectedStudent ? formatPKR(studentDue) : "—"}
              hint={selectedStudent?.fullName}
              icon={<DollarSign className="h-5 w-5" />}
              accent="warning"
              loading={studentLoading}
            />
            <StatCard
              label="Students With Dues"
              value={uniqueStudentsPending}
              icon={<Users className="h-5 w-5" />}
              accent="blue"
              loading={dashboardLoading}
            />
          </div>

          {/* ── Search ───────────────────────────── */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Search className="h-4 w-4" />
                Find Student
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative" ref={searchRef}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or GR number…"
                  className="pl-10 pr-10 h-11"
                />
                {searching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
                {selectedStudent && !searching && (
                  <button
                    onClick={handleClearStudent}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Clear"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}

                {searchResults.length > 0 && (
                  <div className="absolute z-30 mt-2 w-full bg-popover border rounded-lg shadow-lg overflow-hidden">
                    <ScrollArea className="max-h-72">
                      {searchResults.map((student) => (
                        <button
                          key={student.id}
                          onClick={() => handleSelectStudent(student)}
                          className="w-full px-4 py-3 text-left hover:bg-muted border-b last:border-none transition-colors flex items-center gap-3"
                        >
                          <div className="h-10 w-10 rounded-full bg-primary/10 text-primary grid place-items-center font-semibold shrink-0">
                            {student.fullName?.charAt(0)?.toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">
                              {student.fullName}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {student.grNumber} · {student.className}
                              {(student as any).section
                                ? `-${(student as any).section}`
                                : ""}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {(student as any).studentStatus || "ACTIVE"}
                          </Badge>
                        </button>
                      ))}
                    </ScrollArea>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* ── Student Detail Section ───────────── */}
          {selectedStudent && (
            <div className="grid lg:grid-cols-3 gap-4">
              {/* Profile + Financial */}
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="h-14 w-14 rounded-full bg-primary/10 text-primary grid place-items-center font-bold text-xl shrink-0">
                        {selectedStudent.fullName?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold truncate">
                          {selectedStudent.fullName}
                        </h3>
                        <p className="text-xs text-muted-foreground font-mono">
                          {selectedStudent.grNumber}
                        </p>
                      </div>
                      {studentLoading && (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                    </div>

                    <Separator />

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <GraduationCap className="h-3.5 w-3.5" /> Class
                        </span>
                        <span className="font-medium">
                          {selectedStudent.className}
                          {(selectedStudent as any).section
                            ? `-${(selectedStudent as any).section}`
                            : ""}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5" /> Contact
                        </span>
                        <span className="font-medium">
                          {(selectedStudent as any).parentContact1 || "—"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <ShieldStatus />
                          Status
                        </span>
                        <Badge variant="outline">
                          {(selectedStudent as any).studentStatus || "ACTIVE"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Financial Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <Row
                      label="Outstanding Due"
                      value={formatPKR(studentDue)}
                      emphasis={studentDue > 0 ? "destructive" : "success"}
                      loading={studentLoading}
                    />
                    <Row
                      label="Total Paid"
                      value={formatPKR(totalCollections)}
                      emphasis="success"
                      loading={studentLoading}
                    />
                    {studentLedger && (
                      <>
                        <Row
                          label="Total Charged"
                          value={formatPKR(studentLedger.totalCharged)}
                        />
                        {studentLedger.lastUpdated && (
                          <p className="text-xs text-muted-foreground pt-1">
                            Updated {formatDate(studentLedger.lastUpdated)}
                          </p>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Vouchers + History */}
              <Card className="lg:col-span-2">
                <CardHeader className="pb-3">
                  <Tabs defaultValue="vouchers" className="w-full">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        Student Details
                      </CardTitle>
                      <TabsList>
                        <TabsTrigger value="vouchers" className="gap-1.5">
                          <FileText className="h-3.5 w-3.5" />
                          Vouchers
                          {studentVouchers.length > 0 && (
                            <Badge
                              variant="secondary"
                              className="ml-1 h-5 px-1.5 text-xs"
                            >
                              {studentVouchers.length}
                            </Badge>
                          )}
                        </TabsTrigger>
                        <TabsTrigger value="history" className="gap-1.5">
                          <History className="h-3.5 w-3.5" />
                          History
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    <TabsContent value="vouchers" className="mt-4">
                      {studentLoading ? (
                        <div className="space-y-2">
                          <Skeleton className="h-12 w-full" />
                          <Skeleton className="h-12 w-full" />
                          <Skeleton className="h-12 w-full" />
                        </div>
                      ) : studentVouchers.length === 0 ? (
                        <EmptyState
                          icon={
                            <CheckCircle2 className="h-10 w-10 text-green-500" />
                          }
                          title="All clear!"
                          subtitle="No unpaid vouchers for this student."
                        />
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Voucher</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">
                                Actions
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {studentVouchers.map((voucher: any) => (
                              <TableRow key={voucher.id}>
                                <TableCell>
                                  <div>
                                    <p className="font-mono font-medium">
                                      #{voucher.id}
                                    </p>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                      <CalendarDays className="h-3 w-3" />
                                      {voucher.month || "Monthly Fee"}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <span className="font-semibold">
                                    {formatPKR(voucher.totalAmount)}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant="destructive"
                                    className="gap-1"
                                  >
                                    <Clock className="h-3 w-3" />
                                    Unpaid
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-1.5">
                                    <Button
                                      size="sm"
                                      onClick={() => {
                                        setSelectedVoucher(voucher);
                                        setDiscount(0);
                                        setPaymentDialogOpen(true);
                                      }}
                                      className="gap-1.5"
                                    >
                                      <Banknote className="h-3.5 w-3.5" />
                                      Collect
                                    </Button>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() =>
                                            handlePrintVoucher(voucher.id)
                                          }
                                        >
                                          <Printer className="h-3.5 w-3.5" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        Print voucher PDF
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </TabsContent>

                    <TabsContent value="history" className="mt-4">
                      {studentLoading ? (
                        <div className="space-y-2">
                          <Skeleton className="h-12 w-full" />
                          <Skeleton className="h-12 w-full" />
                        </div>
                      ) : studentPayments.length === 0 ? (
                        <EmptyState
                          icon={
                            <BookOpen className="h-10 w-10 text-muted-foreground" />
                          }
                          title="No history"
                          subtitle="This student has no recorded payments yet."
                        />
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Amount Paid</TableHead>
                              <TableHead>Discount</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {studentPayments.map((payment: any) => (
                              <TableRow key={payment.id}>
                                <TableCell>
                                  {formatDate(payment.paymentDate)}
                                </TableCell>
                                <TableCell className="font-semibold text-green-600">
                                  {formatPKR(payment.amountPaid)}
                                </TableCell>
                                <TableCell>
                                  {payment.discount > 0 ? (
                                    <span className="text-yellow-600 font-medium">
                                      −{formatPKR(payment.discount)}
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground">
                                      —
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className="gap-1 text-green-600 border-green-600/30"
                                  >
                                    <CheckCircle2 className="h-3 w-3" />
                                    Paid
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardHeader>
              </Card>
            </div>
          )}

          {/* ── All Pending Vouchers ─────────────── */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="text-base">
                    Students With Pending Fees
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click a row to select the student and manage their payment
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {classOptions.length > 1 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                      {classOptions.slice(0, 6).map((c) => (
                        <Button
                          key={c}
                          size="sm"
                          variant={classFilter === c ? "default" : "outline"}
                          className="h-7 px-2.5 text-xs"
                          onClick={() => setClassFilter(c)}
                        >
                          {c === "all" ? "All" : c}
                        </Button>
                      ))}
                    </div>
                  )}
                  {!dashboardLoading && filteredVouchers.length > 0 && (
                    <Badge variant="secondary">{filteredVouchers.length}</Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {dashboardLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : filteredVouchers.length === 0 ? (
                <EmptyState
                  icon={<CheckCircle2 className="h-12 w-12 text-green-500" />}
                  title="All fees collected!"
                  subtitle="No outstanding vouchers at this time."
                />
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Voucher</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Month</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVouchers.slice(0, 25).map((voucher: any) => {
                        const isSelected =
                          selectedStudent?.id === voucher.studentId;
                        return (
                          <TableRow
                            key={voucher.id}
                            className={`cursor-pointer ${
                              isSelected ? "bg-primary/5" : ""
                            }`}
                            onClick={() => {
                              const s: StudentDTO = {
                                id: voucher.studentId,
                                fullName: voucher.studentName,
                                grNumber: voucher.grNumber,
                                className: voucher.className,
                                section: voucher.section,
                              } as StudentDTO;
                              handleSelectStudent(s);
                            }}
                          >
                            <TableCell>
                              <div className="flex items-center gap-2.5">
                                <div className="h-9 w-9 rounded-full bg-primary/10 text-primary grid place-items-center font-semibold text-sm shrink-0">
                                  {voucher.studentName
                                    ?.charAt(0)
                                    ?.toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium truncate">
                                    {voucher.studentName}
                                  </p>
                                  <p className="text-xs text-muted-foreground font-mono">
                                    {voucher.grNumber}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {voucher.className}
                                {voucher.section ? `-${voucher.section}` : ""}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="font-mono text-sm">
                                #{voucher.id}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="font-semibold">
                                {formatPKR(voucher.totalAmount)}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {voucher.month || "—"}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const s: StudentDTO = {
                                    id: voucher.studentId,
                                    fullName: voucher.studentName,
                                    grNumber: voucher.grNumber,
                                    className: voucher.className,
                                    section: voucher.section,
                                  } as StudentDTO;
                                  handleSelectStudent(s).then(() => {
                                    setSelectedVoucher(voucher);
                                    setPaymentDialogOpen(true);
                                  });
                                }}
                                className="gap-1"
                              >
                                Collect
                                <ChevronRight className="h-3.5 w-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  {filteredVouchers.length > 25 && (
                    <p className="text-xs text-muted-foreground text-center mt-3">
                      Showing 25 of {filteredVouchers.length} vouchers. Use
                      search or class filters to narrow results.
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <PaymentDialog
          open={paymentDialogOpen}
          voucher={selectedVoucher}
          student={selectedStudent}
          discount={discount}
          collecting={collecting}
          onDiscountChange={setDiscount}
          onConfirm={handleCollectPayment}
          onCancel={() => {
            setPaymentDialogOpen(false);
            setSelectedVoucher(null);
            setDiscount(0);
          }}
        />
      </TooltipProvider>
    </DashboardLayout>
  );
};

/* ────────────────────────────────────────────────────────────
   Small helper components
   ──────────────────────────────────────────────────────────── */

const ShieldStatus = () => <CheckCircle2 className="h-3.5 w-3.5" />;

const Row = ({
  label,
  value,
  emphasis,
  loading,
}: {
  label: string;
  value: string;
  emphasis?: "destructive" | "success";
  loading?: boolean;
}) => (
  <div className="flex items-center justify-between">
    <span className="text-muted-foreground">{label}</span>
    {loading ? (
      <Skeleton className="h-4 w-20" />
    ) : (
      <span
        className={`font-semibold ${
          emphasis === "destructive"
            ? "text-destructive"
            : emphasis === "success"
              ? "text-green-600"
              : ""
        }`}
      >
        {value}
      </span>
    )}
  </div>
);

const EmptyState = ({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="mb-3">{icon}</div>
    <p className="font-medium">{title}</p>
    {subtitle && (
      <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
    )}
  </div>
);

export default FeeCollection;
