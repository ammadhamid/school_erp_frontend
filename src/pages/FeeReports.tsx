// import { useState, useEffect } from 'react';
// import DashboardLayout from '@/components/layout/DashboardLayout';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Label } from '@/components/ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { Download, FileText, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
// import { reportApi, downloadPdf } from '@/services/api';
// import { toast } from '@/hooks/use-toast';

// const FeeReports = () => {
//   const [selectedMonth, setSelectedMonth] = useState('');
//   const [selectedClass, setSelectedClass] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [reportData, setReportData] = useState<any[]>([]);
//   const [summaryStats, setSummaryStats] = useState({
//     totalCollection: 0,
//     totalPending: 0,
//     averageCollectionRate: 0,
//     totalStudents: 0,
//   });

//   useEffect(() => {
//     fetchReportData();
//   }, [selectedMonth, selectedClass]);

//   const fetchReportData = async () => {
//     setLoading(true);
//     try {
//       const data = await reportApi.financialReport({
//         startDate: selectedMonth ? `${selectedMonth}-01` : undefined,
//         className: selectedClass !== 'all' ? selectedClass : undefined,
//       });
      
//       if (Array.isArray(data)) {
//         setReportData(data);
//         // Calculate summary
//         const totalCollection = data.reduce((sum: number, r: any) => sum + (r.feesCollected || 0), 0);
//         const totalPending = data.reduce((sum: number, r: any) => sum + (r.feesPending || 0), 0);
//         const totalStudents = data.reduce((sum: number, r: any) => sum + (r.totalStudents || 0), 0);
//         setSummaryStats({
//           totalCollection,
//           totalPending,
//           averageCollectionRate: totalCollection > 0 ? Math.round((totalCollection / (totalCollection + totalPending)) * 100) : 0,
//           totalStudents,
//         });
//       }
//     } catch (error) {
//       console.error('Failed to fetch report:', error);
//       // Use mock data as fallback
//       setReportData([
//         { id: '1', class: '10-A', totalStudents: 35, feesCollected: 280000, feesPending: 70000, collectionRate: 80 },
//         { id: '2', class: '9-B', totalStudents: 40, feesCollected: 300000, feesPending: 100000, collectionRate: 75 },
//         { id: '3', class: '8-A', totalStudents: 38, feesCollected: 266000, feesPending: 38000, collectionRate: 87 },
//       ]);
//       setSummaryStats({ totalCollection: 846000, totalPending: 208000, averageCollectionRate: 81, totalStudents: 113 });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleExportReport = async () => {
//     try {
//       const blob = await reportApi.generate('financial-classwise');
//       downloadPdf(blob, 'fee-collection-report.pdf');
//       toast({ title: 'Success', description: 'Report exported successfully' });
//     } catch (error) {
//       toast({ title: 'Info', description: 'Report export - connect to backend for full functionality' });
//     }
//   };

//   return (
//     <DashboardLayout>
//       <div className="space-y-6 animate-fade-in">
//         <div>
//           <h1 className="text-3xl font-bold text-foreground">Fee Reports</h1>
//           <p className="text-muted-foreground">View and export fee collection reports</p>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//           <Card>
//             <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Collection</CardTitle></CardHeader>
//             <CardContent>
//               <div className="flex items-center justify-between">
//                 <div className="text-2xl font-bold">PKR {summaryStats.totalCollection.toLocaleString()}</div>
//                 <TrendingUp className="h-8 w-8 text-success" />
//               </div>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Pending</CardTitle></CardHeader>
//             <CardContent>
//               <div className="flex items-center justify-between">
//                 <div className="text-2xl font-bold">PKR {summaryStats.totalPending.toLocaleString()}</div>
//                 <TrendingDown className="h-8 w-8 text-destructive" />
//               </div>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Collection Rate</CardTitle></CardHeader>
//             <CardContent><div className="text-2xl font-bold">{summaryStats.averageCollectionRate}%</div></CardContent>
//           </Card>
//           <Card>
//             <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle></CardHeader>
//             <CardContent><div className="text-2xl font-bold">{summaryStats.totalStudents}</div></CardContent>
//           </Card>
//         </div>

//         <Card>
//           <CardHeader><CardTitle>Filter Reports</CardTitle></CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div className="space-y-2">
//                 <Label>Month</Label>
//                 <Select value={selectedMonth} onValueChange={setSelectedMonth}>
//                   <SelectTrigger><SelectValue placeholder="Select month" /></SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="2025-01">January 2025</SelectItem>
//                     <SelectItem value="2025-02">February 2025</SelectItem>
//                     <SelectItem value="2025-03">March 2025</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div className="space-y-2">
//                 <Label>Class</Label>
//                 <Select value={selectedClass} onValueChange={setSelectedClass}>
//                   <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="all">All Classes</SelectItem>
//                     {Array.from({ length: 8 }, (_, i) => i + 5).map((cls) => (
//                       <SelectItem key={cls} value={cls.toString()}>Class {cls}</SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div className="flex items-end">
//                 <Button onClick={handleExportReport} className="w-full gap-2"><Download className="h-4 w-4" />Export Report</Button>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader><CardTitle>Class-wise Fee Collection Report</CardTitle></CardHeader>
//           <CardContent>
//             {loading ? (
//               <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
//             ) : (
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Class</TableHead>
//                     <TableHead>Total Students</TableHead>
//                     <TableHead>Fees Collected</TableHead>
//                     <TableHead>Fees Pending</TableHead>
//                     <TableHead>Collection Rate</TableHead>
//                     <TableHead className="text-right">Actions</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {reportData.map((report: any) => (
//                     <TableRow key={report.id}>
//                       <TableCell className="font-medium">{report.class}</TableCell>
//                       <TableCell>{report.totalStudents}</TableCell>
//                       <TableCell className="text-success font-medium">PKR {report.feesCollected?.toLocaleString()}</TableCell>
//                       <TableCell className="text-destructive font-medium">PKR {report.feesPending?.toLocaleString()}</TableCell>
//                       <TableCell>
//                         <div className="flex items-center gap-2">
//                           <div className="w-full bg-muted rounded-full h-2">
//                             <div className="bg-primary h-2 rounded-full" style={{ width: `${report.collectionRate}%` }} />
//                           </div>
//                           <span className="text-sm font-medium">{report.collectionRate}%</span>
//                         </div>
//                       </TableCell>
//                       <TableCell className="text-right">
//                         <Button variant="ghost" size="icon"><FileText className="h-4 w-4" /></Button>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </DashboardLayout>
//   );
// };

// export default FeeReports;
