import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  UserPlus,
  Search,
  Filter,
  Eye,
  MoreHorizontal,
  Loader2,
  UserCheck,
  UserX,
} from "lucide-react";
import { studentApi } from "@/api/student.api";
import { toast } from "@/hooks/use-toast";
import type { StudentDTO } from "@/types";
import StudentDetailsDialog from "@/components/students/StudentDetailsDialog";

type StudentStatus = "ACTIVE" | "INACTIVE" | "LEFT";
const Students = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [students, setStudents] = useState<StudentDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    null,
  );
  const [detailsOpen, setDetailsOpen] = useState(false);
  const itemsPerPage = 10;

  // Fetch students on mount and when search changes
  useEffect(() => {
    let mounted = true;

    const loadStudents = async () => {
      setLoading(true);

      try {
        let data: StudentDTO[] = [];

        if (!searchQuery.trim()) {
          data = await studentApi.getAll();
        } else {
          data = await studentApi.search(searchQuery);

          setCurrentPage(1);

          if (data.length === 0 && searchQuery.length > 2) {
            toast({
              title: "Not Found",

              description: "No student found",
            });
          }
        }

        if (mounted) {
          setStudents(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (!searchQuery.trim()) {
      loadStudents();

      return () => {
        mounted = false;
      };
    }

    const delay = setTimeout(loadStudents, 500);

    return () => {
      mounted = false;

      clearTimeout(delay);
    };
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [classFilter, statusFilter]);

  const handleStatusChange = async (
    studentId: number,
    newStatus: StudentStatus,
  ) => {
    try {
      await studentApi.updateStatus(studentId, newStatus);

      toast({
        title: "Success",

        description: `Student status changed to ${newStatus}`,
      });

      setStudents((prev) =>
        prev.map((student) =>
          student.id === studentId
            ? {
                ...student,
                studentStatus: newStatus,
              }
            : student,
        ),
      );
    } catch (error) {
      toast({
        title: "Error",

        description: "Failed to update status",

        variant: "destructive",
      });
    }
  };

  const handleViewStudent = (studentId: number) => {
    setSelectedStudentId(studentId);
    setDetailsOpen(true);
  };

  // Filter students
  const filteredStudents = students.filter((student) => {
    const matchesClass =
      classFilter === "all" || student.className === classFilter;
    const matchesStatus =
      statusFilter === "all" || student.studentStatus === statusFilter;
    return matchesClass && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStudents = filteredStudents.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // Get unique classes
  const classes = Array.from(
    new Set(students.map((s) => s.className).filter(Boolean)),
  ).sort((a, b) => parseInt(a || "0") - parseInt(b || "0"));

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge className="bg-success text-success-foreground">Active</Badge>
        );
      case "INACTIVE":
        return <Badge variant="secondary">Inactive</Badge>;
      case "LEFT":
        return <Badge variant="destructive">Left</Badge>;
      default:
        return <Badge variant="outline">{status || "Unknown"}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Students Management
            </h1>
            <p className="text-muted-foreground">
              Manage student records and information
            </p>
          </div>
          <Link to="/students/add">
            <Button className="gap-2 bg-gradient-primary">
              <UserPlus className="h-4 w-4" />
              Add New Student
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by GR, Name, CNIC, Phone, B-Form..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls} value={cls || ""}>
                      Class {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="LEFT">Left</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Students List ({filteredStudents.length} students)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>GR Number</TableHead>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Father Name</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Section</TableHead>
                        <TableHead>Roll No</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedStudents.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">
                            {student.grNumber}
                          </TableCell>
                          <TableCell>{student.fullName}</TableCell>
                          <TableCell>{student.fatherName}</TableCell>
                          <TableCell>{student.className}</TableCell>
                          <TableCell>{student.section}</TableCell>
                          <TableCell>{student.rollNumber}</TableCell>
                          <TableCell>{student.parentContact1}</TableCell>
                          <TableCell>
                            {getStatusBadge(student.studentStatus)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                title="View Details"
                                onClick={() =>
                                  student.id && handleViewStudent(student.id)
                                }
                              >
                                <Eye className="h-4 w-4" />
                              </Button>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {student.studentStatus === "ACTIVE" ? (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        student.id &&
                                        handleStatusChange(
                                          student.id,
                                          "INACTIVE",
                                        )
                                      }
                                      className="text-destructive"
                                    >
                                      <UserX className="h-4 w-4 mr-2" />
                                      Mark as Inactive
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        student.id &&
                                        handleStatusChange(student.id, "ACTIVE")
                                      }
                                      className="text-success"
                                    >
                                      <UserCheck className="h-4 w-4 mr-2" />
                                      Mark as Active
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem
                                    onClick={() =>
                                      student.id &&
                                      handleStatusChange(student.id, "LEFT")
                                    }
                                  >
                                    <UserX className="h-4 w-4 mr-2" />
                                    Mark as Left
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {paginatedStudents.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={9}
                            className="text-center py-8 text-muted-foreground"
                          >
                            No students found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {filteredStudents.length > 0 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                      Showing {startIndex + 1} to{" "}
                      {Math.min(
                        startIndex + itemsPerPage,
                        filteredStudents.length,
                      )}{" "}
                      of {filteredStudents.length} students
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Student Details Dialog */}
        <StudentDetailsDialog
          studentId={selectedStudentId}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          onStatusChange={async () => {
            const data = await studentApi.getAll();

            setStudents(data);
          }}
        />
      </div>
    </DashboardLayout>
  );
};

export default Students;
