import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO, isWithinInterval } from 'date-fns';

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
  updated_at: string;
}

interface BookingCalendarProps {
  onDateSelect: (dates: { from: Date | undefined; to: Date | undefined }) => void;
  selectedDates: { from: Date | undefined; to: Date | undefined };
  selectedCabin: string;
}

export const BookingCalendar = ({ onDateSelect, selectedDates, selectedCabin }: BookingCalendarProps) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, [selectedCabin]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('status', 'approved')
        .eq('cabin_name', selectedCabin)
        .order('start_date', { ascending: true });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const isDateBooked = (date: Date) => {
    return bookings.some(booking => {
      const startDate = parseISO(booking.start_date);
      const endDate = parseISO(booking.end_date);
      return isWithinInterval(date, { start: startDate, end: endDate });
    });
  };

  const getBookingForDate = (date: Date) => {
    return bookings.find(booking => {
      const startDate = parseISO(booking.start_date);
      const endDate = parseISO(booking.end_date);
      return isWithinInterval(date, { start: startDate, end: endDate });
    });
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading calendar...</div>;
  }

  const isGardbo = selectedCabin === 'Gårdbo';

  return (
    <div className="space-y-6">
      <Card className={isGardbo ? 'border-[#80DEEA]' : ''} style={isGardbo ? { backgroundColor: '#E0F7FA' } : {}}>
        <CardHeader>
          <CardTitle className={isGardbo ? 'text-[#004D40]' : ''}>Select Your Dates - {selectedCabin}</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="range"
            selected={selectedDates}
            onSelect={(range) => onDateSelect({ from: range?.from, to: range?.to })}
            disabled={isDateBooked}
            weekStartsOn={1}
            modifiers={{
              booked: isDateBooked
            }}
            modifiersClassNames={{
              booked: "bg-red-500 text-white hover:bg-red-600"
            }}
            className={`rounded-md border ${isGardbo ? 'border-[#80DEEA]' : ''}`}
            style={isGardbo ? {
              backgroundColor: '#E0F7FA',
              color: '#004D40'
            } : {}}
            modifiersStyles={isGardbo ? {
              selected: {
                backgroundColor: '#26C6DA',
                color: 'white'
              },
              range_start: {
                backgroundColor: '#26C6DA',
                color: 'white'
              },
              range_end: {
                backgroundColor: '#26C6DA', 
                color: 'white'
              },
              range_middle: {
                backgroundColor: '#80DEEA',
                color: '#004D40'
              }
            } : {}}
          />
        </CardContent>
      </Card>

      <Card className={isGardbo ? 'border-[#80DEEA]' : ''} style={isGardbo ? { backgroundColor: '#E0F7FA' } : {}}>
        <CardHeader>
          <CardTitle className={isGardbo ? 'text-[#004D40]' : ''}>Current Bookings - {selectedCabin}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {bookings.length === 0 ? (
              <p className={`${isGardbo ? 'text-[#004D40]' : 'text-muted-foreground'}`}>No current bookings</p>
            ) : (
              bookings.map((booking) => (
                <div key={booking.id} className={`flex items-center justify-between p-3 border rounded-lg ${isGardbo ? 'border-[#80DEEA] bg-white/50' : ''}`}>
                  <div className="flex-1">
                    <p className={`font-medium ${isGardbo ? 'text-[#004D40]' : ''}`}>{booking.user_name}</p>
                    <p className={`text-sm ${isGardbo ? 'text-[#004D40]/70' : 'text-muted-foreground'}`}>
                      {format(parseISO(booking.start_date), 'MMM d')} - {format(parseISO(booking.end_date), 'MMM d, yyyy')}
                    </p>
                    {booking.notes && (
                      <p className={`text-sm mt-1 italic ${isGardbo ? 'text-[#004D40]/70' : 'text-muted-foreground'}`}>
                        Note: {booking.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Badge variant="secondary">{booking.guests_count} guests</Badge>
                    <Badge variant="default">Approved</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};