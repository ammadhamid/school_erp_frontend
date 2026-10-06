import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  FileText,
  Download,
  Loader2,
  User,
  Wallet,
  TrendingDown,
  TrendingUp,
  Printer,
} from "lucide-react";
import { studentApi } from "@/api/student.api";
import { ledgerApi } from "@/api/ledger.api";
import { toast } from "@/hooks/use-toast";
import type { Student, LedgerEntry } from "@/types";

const StudentLedger = () => {
  const [searchResults, setSearchResults] = useState<Student[]>([]);

  const [showResults, setShowResults] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [ledger, setLedger] = useState<LedgerEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Please enter a search query",
        description: "Search by name or GR number",
        variant: "destructive",
      });

      return;
    }

    setLoading(true);

    setSelectedStudent(null);

    setLedger(null);

    try {
      const students = await studentApi.search(searchQuery);

      if (!students || students.length === 0) {
        setSearchResults([]);

        setShowResults(false);

        toast({
          title: "No Students Found",
          description: "No matching students were found.",
          variant: "destructive",
        });

        return;
      }

      setSearchResults(students as Student[]);

      setShowResults(true);
    } catch (error) {
      console.error(error);

      toast({
        title: "Search Failed",
        description: "Something went wrong while searching.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStudent = async (student: Student) => {
    setSelectedStudent(student);
    setShowResults(false);
    setSearchQuery(`${student.fullName} (${student.grNumber})`);
    try {
      const [ledgerData, txData] = await Promise.all([
        ledgerApi.getByStudent(student.id!),
        ledgerApi.getTransactions(student.id!),
      ]);
      setLedger(ledgerData);
      setTransactions(txData);
    } catch {
      toast({
        title: "No Ledger Found",
        description: "This student does not have a ledger yet.",
        variant: "destructive",
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Student Ledger
            </h1>
            <p className="text-muted-foreground mt-1">
              Search and manage complete fee histories and balances.
            </p>
          </div>
          {selectedStudent && ledger && (
            <Button
              onClick={handlePrint}
              variant="outline"
              className="gap-2 print:hidden"
            >
              <Printer className="h-4 w-4" />
              Print Ledger
            </Button>
          )}
        </div>

        {/* Search Card */}
        <Card className="print:hidden border-primary/10 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Enter GR Number or Full Name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10 h-12 text-lg w-full"
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={loading}
                size="lg"
                className="w-full sm:w-auto h-12 px-8"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Search Records"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
        {showResults && searchResults.length > 0 && (
          <div className="mt-2 rounded-lg border border-border bg-card shadow-lg overflow-hidden">
            {searchResults.map((student) => (
              <button
                key={student.id}
                onClick={() => handleSelectStudent(student)}
                className="w-full px-4 py-3 text-left hover:bg-muted transition border-b border-border last:border-b-0"
              >
                <div className="font-medium">{student.fullName}</div>

                <div className="text-sm text-muted-foreground">
                  GR: {student.grNumber}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Results Section */}
        {selectedStudent && ledger && (
          <div className="space-y-6 animate-fade-in">
            {/* Student Identity Card */}
            <Card className="overflow-hidden border-l-4 border-l-primary">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row items-start md:items-center p-6 gap-6 bg-secondary/10">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        GR Number
                      </p>
                      <p className="text-lg font-bold">
                        {selectedStudent.grNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        Student Name
                      </p>
                      <p className="text-lg font-bold">
                        {selectedStudent.fullName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        Class & Section
                      </p>
                      <p className="text-lg font-bold">
                        {selectedStudent.className} - {selectedStudent.section}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        Contact
                      </p>
                      <p className="text-lg font-bold">
                        {selectedStudent.parentContact1}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Summary KPIs */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-t-4 border-t-destructive shadow-sm">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 bg-destructive/10 rounded-full">
                    <TrendingDown className="h-6 w-6 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Due
                    </p>
                    <p className="text-3xl font-bold tracking-tight">
                      PKR {ledger.totalDue?.toLocaleString() || 0}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-t-success shadow-sm">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 bg-success/10 rounded-full">
                    <TrendingUp className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Paid
                    </p>
                    <p className="text-3xl font-bold tracking-tight text-success">
                      PKR {ledger.totalPaid?.toLocaleString() || 0}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-t-orange-500 shadow-sm">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 bg-orange-500/10 rounded-full">
                    <Wallet className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Current Balance
                    </p>
                    <p className="text-3xl font-bold tracking-tight text-orange-600">
                      PKR {ledger.balance?.toLocaleString() || 0}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Transactions Table */}
            <Card className="shadow-sm">
              <CardHeader className="bg-secondary/5 border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Detailed Transaction History
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {transactions && transactions.length > 0 ?  (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary/10 hover:bg-secondary/10">
                        <TableHead className="w-[150px] font-semibold">
                          Date
                        </TableHead>
                        <TableHead className="font-semibold">
                          Description
                        </TableHead>
                        <TableHead className="text-right font-semibold">
                          Debit (Fee)
                        </TableHead>
                        <TableHead className="text-right font-semibold">
                          Credit (Paid)
                        </TableHead>
                        <TableHead className="text-right font-semibold pr-6">
                          Running Balance
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((t, i) => (
                        <TableRow
                          key={i}
                          className="hover:bg-secondary/5 transition-colors"
                        >
                          <TableCell className="font-medium">
                            {new Date(t.date).toLocaleDateString("en-US", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </TableCell>
                          <TableCell>{t.description}</TableCell>
                          <TableCell className="text-right text-destructive font-medium">
                            {t.debit ? `PKR ${t.debit.toLocaleString()}` : "-"}
                          </TableCell>
                          <TableCell className="text-right text-success font-medium">
                            {t.credit
                              ? `PKR ${t.credit.toLocaleString()}`
                              : "-"}
                          </TableCell>
                          <TableCell className="text-right font-bold pr-6">
                            PKR {t.balance?.toLocaleString() || 0}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium text-foreground">
                      No Transactions Yet
                    </h3>
                    <p className="text-muted-foreground mt-1">
                      This student's ledger is currently empty.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty State */}
        {!selectedStudent && !loading && (
          <Card className="border-dashed border-2 bg-transparent shadow-none print:hidden">
            <CardContent className="p-16 text-center">
              <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
                <Search className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                Search to View Ledger
              </h2>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Enter a student's GR number or full name in the search bar above
                to instantly pull up their complete financial history.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentLedger;
