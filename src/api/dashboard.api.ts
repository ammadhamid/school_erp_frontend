import api from "./axios";

import { studentApi } from "./student.api";
import { staffApi } from "./staff.api";
import { voucherApi } from "./voucher.api";
import { ledgerApi } from "./ledger.api";
import { feeHeadApi } from "./fees.api";

import {
  DashboardStats,
  MonthlyCollectionData,
  ClassWiseStudentData,
  FeeStatusData,
  RecentActivity,
  Student,
  Staff,
  Voucher,
  LedgerEntry,
  Payment,
} from "@/types";

export const dashboardApi = {
  _getVoucherAmount: (voucher: unknown): number => {
    const v: any = voucher;

    const raw =
      v?.totalAmount ??
      v?.totalFee ??
      v?.amount ??
      v?.dueAmount ??
      v?.totalDue ??
      0;

    const n = typeof raw === "string" ? Number(raw) : raw;

    return Number.isFinite(n) ? n : 0;
  },

  _getVoucherStatus: (voucher: unknown): string => {
    const v: any = voucher;

    return String(
      v?.status ?? v?.voucherStatus ?? v?.state ?? "",
    ).toUpperCase();
  },

  getStats: async (): Promise<DashboardStats> => {
    try {
      const [students, staff, vouchers, ledgers] = await Promise.all([
        studentApi.getAll().catch(() => []),
        staffApi.getAll().catch(() => []),
        voucherApi.getUnpaid().catch(() => []),
        ledgerApi.getAll().catch(() => []),
      ]);

      let monthlyCollection = 0;
      ledgers.forEach((l: LedgerEntry) => {
        monthlyCollection += l.totalPaid || 0;
      });

      let pendingFees = 0;

      vouchers.forEach((v: Voucher) => {
        pendingFees += dashboardApi._getVoucherAmount(v);
      });

      let totalRevenue = 0;

      ledgers.forEach((l: LedgerEntry) => {
        totalRevenue += l.totalPaid || 0;
      });

      const now = new Date();

      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const newAdmissions = students.filter((s: Student) => {
        if (!s.admissionDate) return false;

        const d = new Date(s.admissionDate);

        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      }).length;

      return {
        totalStudents: students.length,
        totalStaff: staff.length,
        totalRevenue,
        pendingFees,
        monthlyCollection,
        newAdmissions,
      };
    } catch (error) {
      console.error("Failed to fetch dashboard stats", error);

      return {
        totalStudents: 0,
        totalStaff: 0,
        totalRevenue: 0,
        pendingFees: 0,
        monthlyCollection: 0,
        newAdmissions: 0,
      };
    }
  },

  getMonthlyCollections: async (): Promise<MonthlyCollectionData[]> => {
    try {
      const ledgers = await ledgerApi.getAll().catch(() => []);

      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const now = new Date();
      const monthlyData: Record<string, number> = {};

      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        monthlyData[months[d.getMonth()]] = 0;
      }

      // Ledger se total paid nikaalo current month ke liye
      const currentMonthKey = months[now.getMonth()];
      let total = 0;
      ledgers.forEach((l: LedgerEntry) => {
        total += l.totalPaid || 0;
      });
      monthlyData[currentMonthKey] = total;

      return Object.entries(monthlyData).map(([month, collections]) => ({
        month,
        collections,
      }));
    } catch (error) {
      console.error("Failed to fetch monthly collections", error);

      return [];
    }
  },

  getClassWiseStudents: async (): Promise<ClassWiseStudentData[]> => {
    try {
      const students = await studentApi.getAll();

      const classData: Record<string, number> = {};

      students.forEach((student: Student) => {
        const className = student.className || "Unknown";

        classData[className] = (classData[className] || 0) + 1;
      });

      return Object.entries(classData).map(([className, total]) => ({
        class: className,
        students: total,
      }));
    } catch (error) {
      console.error("Failed to fetch class wise students", error);

      return [];
    }
  },

  getFeeStatus: async (): Promise<FeeStatusData[]> => {
    try {
      const [unpaidVouchers, ledgers] = await Promise.all([
        voucherApi.getUnpaid().catch(() => []),
        ledgerApi.getAll().catch(() => []),
      ]);

      let paid = 0;
      let pending = 0;
      let overdue = 0;

      // Paid = students jinka balance 0 hai
      ledgers.forEach((l: LedgerEntry) => {
        if ((l.balance || 0) <= 0) paid++;
      });

      // Pending/Overdue = unpaid vouchers
      unpaidVouchers.forEach((voucher: Voucher) => {
        const status = dashboardApi._getVoucherStatus(voucher);
        if (status === "OVERDUE") overdue++;
        else pending++;
      });

      const total = paid + pending + overdue || 1;

      return [
        {
          name: "Paid",
          value: Math.round((paid / total) * 100),
          color: "hsl(var(--success))",
        },
        {
          name: "Pending",
          value: Math.round((pending / total) * 100),
          color: "hsl(142, 76%, 45%)",
        },
        {
          name: "Overdue",
          value: Math.round((overdue / total) * 100),
          color: "hsl(var(--destructive))",
        },
      ];
    } catch (error) {
      console.error("Failed to fetch fee status", error);
      return [];
    }
  },

  getRecentActivities: async (): Promise<RecentActivity[]> => {
    try {
      const activities: RecentActivity[] = [];

      const students = await studentApi.getAll();

      const recentStudents = students
        .filter((s: Student) => s.admissionDate)
        .sort(
          (a: Student, b: Student) =>
            new Date(b.admissionDate!).getTime() -
            new Date(a.admissionDate!).getTime(),
        )
        .slice(0, 3);

      recentStudents.forEach((student: Student, i) => {
        activities.push({
          id: i + 1,
          text: `New student admitted: ${student.fullName}`,
          time: student.admissionDate || "Recently",
          type: "admission",
        });
      });

      const vouchers = await voucherApi.getUnpaid();

      vouchers.slice(0, 2).forEach((voucher: Voucher, i) => {
        activities.push({
          id: 100 + i,
          text: `Pending fee voucher - PKR ${voucher.totalAmount}`,
          time: voucher.dueDate || "Due soon",
          type: "voucher",
        });
      });

      return activities;
    } catch (error) {
      console.error("Failed to fetch recent activities", error);

      return [];
    }
  },
};
