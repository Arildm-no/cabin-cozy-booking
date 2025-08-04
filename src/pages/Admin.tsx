import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface Booking {
  id: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  start_date: string;
  end_date: string;
  guests_count: number;
  status: string;
  notes: string | null;
  created_at: string;
}

const Admin = () => {
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingBookings();
  }, []);

  const fetchPendingBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setPendingBookings(data || []);
    } catch (error) {
      console.error('Error fetching pending bookings:', error);
      toast({
        title: "Error",
        description: "Failed to load pending bookings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBookingAction = async (bookingId: string, action: 'approved' | 'declined') => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: action })
        .eq('id', bookingId);

      if (error) throw error;

      setPendingBookings(prev => prev.filter(booking => booking.id !== bookingId));
      
      toast({
        title: "Success",
        description: `Booking ${action} successfully`,
      });
    } catch (error) {
      console.error('Error updating booking:', error);
      toast({
        title: "Error",
        description: `Failed to ${action.slice(0, -1)} booking`,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Loading pending bookings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Admin Panel</h1>
          <p className="text-xl text-muted-foreground">Manage booking requests</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pending Bookings ({pendingBookings.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingBookings.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No pending bookings</p>
            ) : (
              <div className="space-y-4">
                {pendingBookings.map((booking) => (
                  <div key={booking.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{booking.user_name}</h3>
                        <p className="text-sm text-muted-foreground">{booking.user_email}</p>
                        <p className="text-sm text-muted-foreground">{booking.user_phone}</p>
                      </div>
                      <Badge variant="secondary">{booking.guests_count} guests</Badge>
                    </div>
                    
                    <div className="bg-muted/50 p-3 rounded">
                      <p className="font-medium">
                        {format(parseISO(booking.start_date), 'MMM d, yyyy')} - {format(parseISO(booking.end_date), 'MMM d, yyyy')}
                      </p>
                      {booking.notes && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Notes: {booking.notes}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Requested: {format(parseISO(booking.created_at), 'MMM d, yyyy HH:mm')}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleBookingAction(booking.id, 'approved')}
                        variant="default"
                        size="sm"
                      >
                        Accept
                      </Button>
                      <Button 
                        onClick={() => handleBookingAction(booking.id, 'declined')}
                        variant="destructive"
                        size="sm"
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;