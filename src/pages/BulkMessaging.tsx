import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Send, Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const BulkMessaging = () => {
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [messageType, setMessageType] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const recipientTypes = [
    { id: 'all-students', label: 'All Students' },
    { id: 'all-parents', label: 'All Parents' },
    { id: 'all-staff', label: 'All Staff' },
    { id: 'class-5', label: 'Class 5' },
    { id: 'class-6', label: 'Class 6' },
    { id: 'class-7', label: 'Class 7' },
    { id: 'class-8', label: 'Class 8' },
    { id: 'class-9', label: 'Class 9' },
    { id: 'class-10', label: 'Class 10' },
    { id: 'pending-fees', label: 'Pending Fees Students' },
  ];

  const handleRecipientToggle = (recipientId: string) => {
    setSelectedRecipients((prev) =>
      prev.includes(recipientId)
        ? prev.filter((id) => id !== recipientId)
        : [...prev, recipientId]
    );
  };

  const handleSendMessage = () => {
    if (selectedRecipients.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one recipient group',
        variant: 'destructive',
      });
      return;
    }

    if (!messageType || !message) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    // TODO: Call API to send bulk messages
    toast({
      title: 'Success',
      description: `Message sent to ${selectedRecipients.length} recipient group(s)`,
    });

    // Reset form
    setSelectedRecipients([]);
    setMessageType('');
    setSubject('');
    setMessage('');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bulk Messaging</h1>
          <p className="text-muted-foreground">Send messages to multiple recipients at once</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Compose Message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Message Type *</Label>
                <Select value={messageType} onValueChange={setMessageType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select message type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {messageType === 'email' && (
                <div className="space-y-2">
                  <Label>Subject *</Label>
                  <Input
                    placeholder="Enter email subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Message *</Label>
                <Textarea
                  placeholder="Type your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={8}
                />
                <p className="text-xs text-muted-foreground">
                  Available placeholders: {'{{studentName}}'}, {'{{grNumber}}'}, {'{{class}}'}, {'{{pendingAmount}}'}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Attachment (Optional)</Label>
                <div className="flex items-center gap-2">
                  <Input type="file" />
                  <Button variant="outline" size="icon">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSendMessage} size="lg" className="gap-2">
                  <Send className="h-4 w-4" />
                  Send Message
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Select Recipients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recipientTypes.map((recipient) => (
                  <div key={recipient.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={recipient.id}
                      checked={selectedRecipients.includes(recipient.id)}
                      onCheckedChange={() => handleRecipientToggle(recipient.id)}
                    />
                    <label
                      htmlFor={recipient.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {recipient.label}
                    </label>
                  </div>
                ))}
              </div>

              {selectedRecipients.length > 0 && (
                <div className="mt-4 p-3 bg-primary/10 rounded-md">
                  <p className="text-sm font-medium text-foreground">
                    {selectedRecipients.length} group(s) selected
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Estimated recipients: ~{selectedRecipients.length * 35}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BulkMessaging;
