import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import AddStudent from "./pages/AddStudent";
import Admissions from "./pages/Admissions";
import FeeCollection from "./pages/FeeCollection";
import Staff from "./pages/Staff";
import Payroll from "./pages/Payroll";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import StudentLedger from "./pages/StudentLedger";
import FeeVouchers from "./pages/FeeVouchers";
import FeeConfiguration from "./pages/FeeConfiguration";
import FeeReports from "./pages/FeeReports";
import SalaryStructures from "./pages/SalaryStructures";
import BulkMessaging from "./pages/BulkMessaging";
import NotificationLogs from "./pages/NotificationLogs";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/students" element={<Students />} />
          <Route path="/students/add" element={<AddStudent />} />
          <Route path="/admissions" element={<Admissions />} />
          <Route path="/fees/collect" element={<FeeCollection />} />
          <Route path="/fees/collection" element={<FeeCollection />} />
          <Route path="/fees/config" element={<FeeConfiguration />} />
          <Route path="/fees/ledger" element={<StudentLedger />} />
          <Route path="/fees/vouchers" element={<FeeVouchers />} />
          <Route path="/fees/salary-structures" element={<SalaryStructures />} />
          <Route path="/fees/reports" element={<FeeReports />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/payroll" element={<Payroll />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/notifications/whatsapp" element={<Notifications />} />
          <Route path="/notifications/bulk" element={<BulkMessaging />} />
          <Route path="/notifications/logs" element={<NotificationLogs />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
