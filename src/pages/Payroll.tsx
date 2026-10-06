// import { useState, useEffect } from 'react';
// import DashboardLayout from '@/components/layout/DashboardLayout';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { Download, Send, FileText, Loader2 } from 'lucide-react';
// import { staffApi } from '@/api/staff.api';
// import { downloadPdf } from '@/api/donwloadPdf';
// import {  payrollApi } from '@/services/api';
// import { toast } from '@/hooks/use-toast';
// import type { Staff, Payroll, PayrollRequestDTO } from '@/types';

// const PayrollPage = () => {
//   const [staffList, setStaffList] = useState<Staff[]>([]);
//   const [payrollRecords, setPayrollRecords] = useState<Payroll[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [processing, setProcessing] = useState(false);
//   const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString());

//   const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       const [staff, payroll] = await Promise.all([staffApi.getActive(), payrollApi.getAll()]);
//       setStaffList(staff);
//       setPayrollRecords(payroll);
//     } catch (error) {
//       console.error('Failed to fetch data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleProcessPayroll = async (staffId: number) => {
//     setProcessing(true);
//     try {
//       const now = new Date();
//       const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
//       const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

//       const data: PayrollRequestDTO = { staffId, periodStart, periodEnd };
//       await payrollApi.process(data);
//       toast({ title: 'Payroll Processed', description: `Payroll for ${currentMonth} processed.` });
//       fetchData();
//     } catch (error) {
//       toast({ title: 'Error', description: 'Failed to process payroll', variant: 'destructive' });
//     } finally {
//       setProcessing(false);
//     }
//   };

//   const handleDownloadSlip = async (payrollId: number) => {
//     try {
//       const blob = await payrollApi.generateSlip(payrollId);
//       downloadPdf(blob, `salary-slip-${payrollId}.pdf`);
//     } catch (error) {
//       toast({ title: 'Error', description: 'Failed to download slip', variant: 'destructive' });
//     }
//   };

//   return (
//     <DashboardLayout>
//       <div className="space-y-6 animate-fade-in">
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl font-bold text-foreground">Payroll Management</h1>
//             <p className="text-muted-foreground">Process and manage staff salaries</p>
//           </div>
//           <Select value={selectedMonth} onValueChange={setSelectedMonth}>
//             <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
//             <SelectContent>
//               {Array.from({ length: 12 }, (_, i) => (
//                 <SelectItem key={i} value={i.toString()}>{new Date(2025, i).toLocaleString('default', { month: 'long' })}</SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>

//         <div className="grid gap-4 md:grid-cols-4">
//           <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Total Staff</p><p className="text-3xl font-bold">{staffList.length}</p></CardContent></Card>
//           <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Processed</p><p className="text-3xl font-bold">{payrollRecords.length}</p></CardContent></Card>
//           <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Pending</p><p className="text-3xl font-bold">{Math.max(0, staffList.length - payrollRecords.length)}</p></CardContent></Card>
//           <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Total Paid</p><p className="text-3xl font-bold">PKR {payrollRecords.reduce((s, p) => s + (p.netPay || 0), 0).toLocaleString()}</p></CardContent></Card>
//         </div>

//         <Card>
//           <CardHeader><CardTitle>Staff Payroll - {currentMonth}</CardTitle></CardHeader>
//           <CardContent>
//             {loading ? (
//               <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
//             ) : (
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>ID</TableHead>
//                     <TableHead>Name</TableHead>
//                     <TableHead>Designation</TableHead>
//                     <TableHead className="text-right">Actions</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {staffList.map((staff) => {
//                     const staffPayroll = payrollRecords.find(p => p.staff?.id === staff.id);
//                     return (
//                       <TableRow key={staff.id}>
//                         <TableCell>{staff.id}</TableCell>
//                         <TableCell>{staff.fullName}</TableCell>
//                         <TableCell>{staff.designation}</TableCell>
//                         <TableCell className="text-right space-x-2">
//                           {staffPayroll ? (
//                             <Button size="sm" variant="outline" onClick={() => handleDownloadSlip(staffPayroll.id)}>
//                               <Download className="h-4 w-4 mr-1" />Slip
//                             </Button>
//                           ) : (
//                             <Button size="sm" variant="outline" onClick={() => staff.id && handleProcessPayroll(staff.id)} disabled={processing}>
//                               <FileText className="h-4 w-4 mr-1" />Process
//                             </Button>
//                           )}
//                         </TableCell>
//                       </TableRow>
//                     );
//                   })}
//                 </TableBody>
//               </Table>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </DashboardLayout>
//   );
// };

// export default PayrollPage;

import { useState, useEffect } from "react";

import DashboardLayout from "@/components/layout/DashboardLayout";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

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

import { Download, FileText, Loader2 } from "lucide-react";

import { staffApi } from "@/api/staff.api";

import { downloadPdf } from "@/api/donwloadPdf";

import { toast } from "@/hooks/use-toast";

import type { Staff, Payroll, PayrollRequestDTO } from "@/types";

const PayrollPage = () => {
  const [staffList, setStaffList] = useState<Staff[]>([]);

  const [payrollRecords, setPayrollRecords] = useState<Payroll[]>([]);

  const [loading, setLoading] = useState(true);

  const [processing, setProcessing] = useState(false);

  const [selectedMonth, setSelectedMonth] = useState(
    new Date().getMonth().toString(),
  );

  const currentMonth = new Date().toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    try {
      const [staff, payrolls] = await Promise.all([
        staffApi.getAll(),
        staffApi.getAllPayrolls(),
      ]);

      setStaffList(staff);
      setPayrollRecords(payrolls);
    } catch (error) {
      console.error(error);

      toast({
        title: "Error",
        description: "Failed to fetch payroll data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayroll = async (staffId: number) => {
    setProcessing(true);

    try {
      const now = new Date();

      const periodStart = new Date(now.getFullYear(), Number(selectedMonth), 1)
        .toISOString()
        .split("T")[0];

      const periodEnd = new Date(
        now.getFullYear(),
        Number(selectedMonth) + 1,
        0,
      )
        .toISOString()
        .split("T")[0];

      const payload: PayrollRequestDTO = {
        staffId,
        periodStart,
        periodEnd,
      };

      await staffApi.processPayroll(payload);

      toast({
        title: "Payroll Processed",
        description: "Salary processed successfully",
      });

      fetchData();
    } catch (error) {
      console.error(error);

      toast({
        title: "Error",
        description: "Failed to process payroll",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadSlip = async (payrollId: number) => {
    try {
      const blob = await staffApi.getSalarySlip(payrollId);

      downloadPdf(blob, `salary-slip-${payrollId}.pdf`);
    } catch (error) {
      console.error(error);

      toast({
        title: "Error",
        description: "Failed to download slip",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Payroll Management
            </h1>

            <p className="text-muted-foreground">
              Process and manage staff salaries
            </p>
          </div>

          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => (
                <SelectItem key={i} value={i.toString()}>
                  {new Date(2025, i).toLocaleString("default", {
                    month: "long",
                  })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Total Staff</p>

              <p className="text-3xl font-bold">{staffList.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Processed</p>

              <p className="text-3xl font-bold">{payrollRecords.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Pending</p>

              <p className="text-3xl font-bold">
                {Math.max(0, staffList.length - payrollRecords.length)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Total Paid</p>

              <p className="text-3xl font-bold">
                PKR{" "}
                {payrollRecords
                  .reduce((sum, payroll) => sum + (payroll.netPay || 0), 0)
                  .toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Staff Payroll - {currentMonth}</CardTitle>
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
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Designation</TableHead>

                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {staffList.map((staff) => {
                    const payroll = payrollRecords.find(
                      (p) => p.staff?.id === staff.id,
                    );

                    return (
                      <TableRow key={staff.id}>
                        <TableCell>{staff.id}</TableCell>

                        <TableCell>{staff.fullName}</TableCell>

                        <TableCell>{staff.designation}</TableCell>

                        <TableCell className="text-right space-x-2">
                          {payroll ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadSlip(payroll.id)}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Slip
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={processing}
                              onClick={() =>
                                staff.id && handleProcessPayroll(staff.id)
                              }
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              Process
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PayrollPage;
