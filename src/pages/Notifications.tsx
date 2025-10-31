import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Send, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const notificationLogs = [
  { id: 1, date: '2025-01-15', recipient: '25 students', message: 'Fee reminder - Due in 2 days', status: 'sent' },
  { id: 2, date: '2025-01-14', recipient: '45 students', message: 'Monthly fee voucher', status: 'sent' },
  { id: 3, date: '2025-01-13', recipient: '15 students', message: 'Overdue payment notice', status: 'sent' },
  { id: 4, date: '2025-01-12', recipient: '60 students', message: 'Exam schedule notification', status: 'failed' },
];

const Notifications = () => {
  const handleSendMessage = () => {
    toast({
      title: 'Messages Sent',
      description: 'Bulk messages have been sent successfully.',
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notifications Center</h1>
          <p className="text-muted-foreground">Send WhatsApp reminders and bulk messages</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                WhatsApp Reminder
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reminderType">Reminder Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">7 Days Before Due</SelectItem>
                    <SelectItem value="2days">2 Days Before Due</SelectItem>
                    <SelectItem value="duedate">On Due Date</SelectItem>
                    <SelectItem value="overdue">Overdue Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="class">Target Class</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {Array.from({ length: 8 }, (_, i) => (
                      <SelectItem key={i + 5} value={String(i + 5)}>
                        Class {i + 5}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Message Template</Label>
                <Textarea
                  defaultValue="Dear {father_name}, this is a reminder that {student_name}'s fee of PKR {amount_due} is due on {due_date}. Please pay on time. - Abroad School"
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Available tags: {'{student_name}'}, {'{father_name}'}, {'{amount_due}'}, {'{due_date}'}
                </p>
              </div>
              <Button onClick={handleSendMessage} className="w-full gap-2 bg-gradient-success">
                <Send className="h-4 w-4" />
                Send Reminders
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Bulk Messaging
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipients">Recipients</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select recipients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Students</SelectItem>
                    <SelectItem value="class">Specific Class</SelectItem>
                    <SelectItem value="defaulters">Fee Defaulters</SelectItem>
                    <SelectItem value="custom">Custom List</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="Message subject" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bulkMessage">Message</Label>
                <Textarea
                  id="bulkMessage"
                  placeholder="Type your message here..."
                  rows={5}
                />
              </div>
              <Button onClick={handleSendMessage} className="w-full gap-2 bg-gradient-primary">
                <Send className="h-4 w-4" />
                Send to All
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Notification Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notificationLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{new Date(log.date).toLocaleDateString()}</TableCell>
                    <TableCell>{log.recipient}</TableCell>
                    <TableCell className="max-w-md truncate">{log.message}</TableCell>
                    <TableCell>
                      {log.status === 'sent' ? (
                        <Badge className="gap-1 bg-success text-success-foreground">
                          <CheckCircle className="h-3 w-3" />
                          Sent
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="gap-1">
                          <XCircle className="h-3 w-3" />
                          Failed
                        </Badge>
                      )}
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

export default Notifications;
