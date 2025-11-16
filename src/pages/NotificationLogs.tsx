import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Download, Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const NotificationLogs = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock notification logs
  const mockLogs = [
    {
      id: '1',
      date: '2025-01-15 10:30 AM',
      type: 'WhatsApp',
      recipient: 'Ahmed Ali Khan (GR-2025-0001)',
      message: 'Fee reminder for January 2025',
      status: 'delivered' as const,
    },
    {
      id: '2',
      date: '2025-01-15 10:28 AM',
      type: 'SMS',
      recipient: 'Sara Malik (GR-2025-0002)',
      message: 'Admission confirmation',
      status: 'delivered' as const,
    },
    {
      id: '3',
      date: '2025-01-15 10:25 AM',
      type: 'Email',
      recipient: 'Ali Hassan (GR-2025-0003)',
      message: 'Monthly progress report',
      status: 'failed' as const,
    },
    {
      id: '4',
      date: '2025-01-15 10:20 AM',
      type: 'WhatsApp',
      recipient: 'Bulk: Class 10-A',
      message: 'Exam schedule notification',
      status: 'pending' as const,
    },
    {
      id: '5',
      date: '2025-01-15 10:15 AM',
      type: 'SMS',
      recipient: 'Fatima Khan (GR-2025-0005)',
      message: 'Fee overdue reminder',
      status: 'delivered' as const,
    },
  ];

  const filteredLogs = mockLogs.filter((log) => {
    const matchesSearch =
      searchQuery === '' ||
      log.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || log.type.toLowerCase() === filterType;
    const matchesStatus = filterStatus === 'all' || log.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadge = (status: 'delivered' | 'pending' | 'failed') => {
    const variants = {
      delivered: 'bg-success text-success-foreground',
      pending: 'bg-warning text-warning-foreground',
      failed: 'bg-destructive text-destructive-foreground',
    };
    return <Badge className={variants[status]}>{status.toUpperCase()}</Badge>;
  };

  const handleExportLogs = () => {
    toast({
      title: 'Exporting Logs',
      description: 'Your notification logs are being prepared for download',
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notification Logs</h1>
          <p className="text-muted-foreground">View history of all sent notifications</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Filter Logs</CardTitle>
              <Button onClick={handleExportLogs} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export Logs
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by recipient or message..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Message Type</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.date}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.type}</Badge>
                    </TableCell>
                    <TableCell>{log.recipient}</TableCell>
                    <TableCell className="max-w-xs truncate">{log.message}</TableCell>
                    <TableCell>{getStatusBadge(log.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" title="View Details">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default NotificationLogs;
