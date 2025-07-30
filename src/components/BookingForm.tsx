import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface BookingFormProps {
  selectedDates: { from: Date | undefined; to: Date | undefined };
  onBookingSuccess: () => void;
}

export const BookingForm = ({ selectedDates, onBookingSuccess }: BookingFormProps) => {
  const [formData, setFormData] = useState({
    user_name: '',
    user_email: '',
    user_phone: '',
    guests_count: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const isFormValid = () => {
    return (
      selectedDates.from &&
      selectedDates.to &&
      formData.user_name.trim() &&
      formData.user_email.trim() &&
      formData.user_phone.trim() &&
      formData.guests_count &&
      parseInt(formData.guests_count) > 0 &&
      parseInt(formData.guests_count) <= 6
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      toast({
        title: "Invalid Form",
        description: "Please fill in all required fields correctly.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('bookings')
        .insert({
          user_name: formData.user_name.trim(),
          user_email: formData.user_email.trim(),
          user_phone: formData.user_phone.trim(),
          start_date: format(selectedDates.from!, 'yyyy-MM-dd'),
          end_date: format(selectedDates.to!, 'yyyy-MM-dd'),
          guests_count: parseInt(formData.guests_count),
          notes: formData.notes.trim() || null,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Booking Submitted!",
        description: "Your booking request has been submitted and is pending approval."
      });

      // Reset form
      setFormData({
        user_name: '',
        user_email: '',
        user_phone: '',
        guests_count: '',
        notes: ''
      });

      onBookingSuccess();
    } catch (error: any) {
      console.error('Error creating booking:', error);
      toast({
        title: "Booking Failed",
        description: error.message || "There was an error submitting your booking.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!selectedDates.from || !selectedDates.to) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Please select your dates first to make a booking.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book Your Stay</CardTitle>
        <p className="text-sm text-muted-foreground">
          {format(selectedDates.from, 'MMM d')} - {format(selectedDates.to, 'MMM d, yyyy')}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="user_name">Full Name *</Label>
              <Input
                id="user_name"
                value={formData.user_name}
                onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
                placeholder="Enter your full name"
                required
              />
            </div>
            <div>
              <Label htmlFor="user_email">Email *</Label>
              <Input
                id="user_email"
                type="email"
                value={formData.user_email}
                onChange={(e) => setFormData({ ...formData, user_email: e.target.value })}
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="user_phone">Phone Number *</Label>
              <Input
                id="user_phone"
                type="tel"
                value={formData.user_phone}
                onChange={(e) => setFormData({ ...formData, user_phone: e.target.value })}
                placeholder="Enter your phone number"
                required
              />
            </div>
            <div>
              <Label htmlFor="guests_count">Number of Guests * (Max 6)</Label>
              <Select value={formData.guests_count} onValueChange={(value) => setFormData({ ...formData, guests_count: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select number of guests" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? 'guest' : 'guests'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any special requests or notes..."
              rows={3}
            />
          </div>

          <Button type="submit" disabled={!isFormValid() || loading} className="w-full">
            {loading ? "Submitting..." : "Submit Booking Request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};