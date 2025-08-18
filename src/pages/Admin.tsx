import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { LoginForm } from '@/components/LoginForm';
import { Plus, Edit, Trash2, ShoppingCart, AlertTriangle, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProjectsForm from '@/components/ProjectsForm';
import ProjectsList from '@/components/ProjectsList';

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

interface CabinInfo {
  id: string;
  category: string;
  title: string;
  content: string;
  icon: string;
}

interface Supply {
  id: string;
  item_name: string;
  notes: string | null;
  is_urgent: boolean;
  created_at: string;
}

interface User {
  id: string;
  username: string;
  is_active: boolean;
  created_at: string;
}

const Admin = () => {
  const { isAuthenticated, logout } = useAuth();
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [approvedBookings, setApprovedBookings] = useState<Booking[]>([]);
  const [cabinInfo, setCabinInfo] = useState<CabinInfo[]>([]);
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingInfo, setEditingInfo] = useState<CabinInfo | null>(null);
  const [editingSupply, setEditingSupply] = useState<Supply | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isCreatingNewSupply, setIsCreatingNewSupply] = useState(false);
  const [newInfo, setNewInfo] = useState({ category: '', title: '', content: '', icon: 'info' });
  const [newSupply, setNewSupply] = useState({ item_name: '', notes: '', is_urgent: false });
  const [refreshProjects, setRefreshProjects] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      Promise.all([fetchPendingBookings(), fetchApprovedBookings(), fetchCabinInfo(), fetchSupplies(), fetchUsers()]);
    }
  }, [isAuthenticated]);

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

  const fetchApprovedBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('status', 'approved')
        .order('start_date', { ascending: true });

      if (error) throw error;
      setApprovedBookings(data || []);
    } catch (error) {
      console.error('Error fetching approved bookings:', error);
      toast({
        title: "Error",
        description: "Failed to load approved bookings",
        variant: "destructive",
      });
    }
  };

  const fetchCabinInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('cabin_info')
        .select('*')
        .order('category');

      if (error) throw error;
      setCabinInfo(data || []);
    } catch (error) {
      console.error('Error fetching cabin info:', error);
      toast({
        title: "Error",
        description: "Failed to load cabin information",
        variant: "destructive",
      });
    }
  };

  const fetchSupplies = async () => {
    try {
      const { data, error } = await supabase
        .from('supplies' as any)
        .select('*')
        .order('is_urgent', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;
      setSupplies((data as unknown as Supply[]) || []);
    } catch (error) {
      console.error('Error fetching supplies:', error);
      toast({
        title: "Error",
        description: "Failed to load supplies",
        variant: "destructive",
      });
    }
  };

  const handleBookingAction = async (bookingId: string, action: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: action })
        .eq('id', bookingId);

      if (error) throw error;

      setPendingBookings(prev => prev.filter(booking => booking.id !== bookingId));
      if (action === 'approved') {
        await fetchApprovedBookings();
      }
      
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

  const handleDeleteApprovedBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId);

      if (error) throw error;

      setApprovedBookings(prev => prev.filter(booking => booking.id !== bookingId));
      
      toast({
        title: "Success",
        description: "Booking deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast({
        title: "Error",
        description: "Failed to delete booking",
        variant: "destructive",
      });
    }
  };

  const handleSaveCabinInfo = async (info: CabinInfo) => {
    try {
      const { error } = await supabase
        .from('cabin_info')
        .update({
          category: info.category,
          title: info.title,
          content: info.content,
          icon: info.icon
        })
        .eq('id', info.id);

      if (error) throw error;

      await fetchCabinInfo();
      setEditingInfo(null);
      
      toast({
        title: "Success",
        description: "Cabin information updated successfully",
      });
    } catch (error) {
      console.error('Error updating cabin info:', error);
      toast({
        title: "Error",
        description: "Failed to update cabin information",
        variant: "destructive",
      });
    }
  };

  const handleCreateCabinInfo = async () => {
    if (!newInfo.category || !newInfo.title || !newInfo.content) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('cabin_info')
        .insert([newInfo]);

      if (error) throw error;

      await fetchCabinInfo();
      setIsCreatingNew(false);
      setNewInfo({ category: '', title: '', content: '', icon: 'info' });
      
      toast({
        title: "Success",
        description: "Cabin information added successfully",
      });
    } catch (error) {
      console.error('Error creating cabin info:', error);
      toast({
        title: "Error",
        description: "Failed to add cabin information",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCabinInfo = async (id: string) => {
    try {
      const { error } = await supabase
        .from('cabin_info')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchCabinInfo();
      
      toast({
        title: "Success",
        description: "Cabin information deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting cabin info:', error);
      toast({
        title: "Error",
        description: "Failed to delete cabin information",
        variant: "destructive",
      });
    }
  };

  const handleCreateSupply = async () => {
    if (!newSupply.item_name) {
      toast({
        title: "Error",
        description: "Please enter an item name",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('supplies' as any)
        .insert([newSupply]);

      if (error) throw error;

      await fetchSupplies();
      setIsCreatingNewSupply(false);
      setNewSupply({ item_name: '', notes: '', is_urgent: false });
      
      toast({
        title: "Success",
        description: "Supply item added successfully",
      });
    } catch (error) {
      console.error('Error creating supply:', error);
      toast({
        title: "Error",
        description: "Failed to add supply item",
        variant: "destructive",
      });
    }
  };

  const handleSaveSupply = async (supply: Supply) => {
    try {
      const { error } = await supabase
        .from('supplies' as any)
        .update({
          item_name: supply.item_name,
          notes: supply.notes,
          is_urgent: supply.is_urgent
        })
        .eq('id', supply.id);

      if (error) throw error;

      await fetchSupplies();
      setEditingSupply(null);
      
      toast({
        title: "Success",
        description: "Supply item updated successfully",
      });
    } catch (error) {
      console.error('Error updating supply:', error);
      toast({
        title: "Error",
        description: "Failed to update supply item",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSupply = async (id: string) => {
    try {
      const { error } = await supabase
        .from('supplies' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchSupplies();
      
      toast({
        title: "Success",
        description: "Supply item deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting supply:', error);
      toast({
        title: "Error",
        description: "Failed to delete supply item",
        variant: "destructive",
      });
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    }
  };

  const addUser = async () => {
    if (!newUsername.trim() || !newPassword.trim()) {
      toast({
        title: "Error",
        description: "Please enter both username and password",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .insert([{
          username: newUsername.trim(),
          password_hash: newPassword, // In production, this should be properly hashed
          is_active: true
        }]);

      if (error) throw error;

      await fetchUsers();
      setNewUsername('');
      setNewPassword('');
      
      toast({
        title: "Success",
        description: "User added successfully",
      });
    } catch (error) {
      console.error('Error adding user:', error);
      toast({
        title: "Error",
        description: "Failed to add user. Username might already exist.",
        variant: "destructive",
      });
    }
  };

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: isActive })
        .eq('id', userId);

      if (error) throw error;

      await fetchUsers();
      
      toast({
        title: "Success",
        description: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      await fetchUsers();
      
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Loading admin panel...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Admin Panel</h1>
          <p className="text-xl text-muted-foreground">Manage bookings and cabin information</p>
          <div className="mt-4 flex gap-2 justify-center">
            <Link to="/">
              <Button variant="outline" size="sm">Home</Button>
            </Link>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <Tabs defaultValue="bookings" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="bookings">Pending Bookings</TabsTrigger>
            <TabsTrigger value="approved-bookings">Approved Bookings</TabsTrigger>
            <TabsTrigger value="cabin-info">Cabin Information</TabsTrigger>
            <TabsTrigger value="supplies">Supplies</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>
          
          <TabsContent value="bookings">
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
                            onClick={() => handleBookingAction(booking.id, 'rejected')}
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
          </TabsContent>

          <TabsContent value="approved-bookings">
            <Card>
              <CardHeader>
                <CardTitle>Approved Bookings ({approvedBookings.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {approvedBookings.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No approved bookings</p>
                ) : (
                  <div className="space-y-4">
                    {approvedBookings.map((booking) => (
                      <div key={booking.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{booking.user_name}</h3>
                            <p className="text-sm text-muted-foreground">{booking.user_email}</p>
                            <p className="text-sm text-muted-foreground">{booking.user_phone}</p>
                          </div>
                          <Badge variant="default">{booking.guests_count} guests</Badge>
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
                            Approved: {format(parseISO(booking.created_at), 'MMM d, yyyy HH:mm')}
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleDeleteApprovedBooking(booking.id)}
                            variant="destructive"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Booking
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cabin-info">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Cabin Information</CardTitle>
                <Button onClick={() => setIsCreatingNew(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New
                </Button>
              </CardHeader>
              <CardContent>
                {isCreatingNew && (
                  <div className="border rounded-lg p-4 mb-4 bg-muted/50">
                    <h3 className="font-semibold mb-3">Add New Information</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <Select value={newInfo.category} onValueChange={(value) => setNewInfo({...newInfo, category: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="key">Key</SelectItem>
                          <SelectItem value="kitchen">Kitchen</SelectItem>
                          <SelectItem value="bathroom">Bathroom</SelectItem>
                          <SelectItem value="general">General</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={newInfo.icon} onValueChange={(value) => setNewInfo({...newInfo, icon: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select icon" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="key">Key</SelectItem>
                          <SelectItem value="utensils">Utensils</SelectItem>
                          <SelectItem value="droplets">Droplets</SelectItem>
                          <SelectItem value="bed">Bed</SelectItem>
                          <SelectItem value="coffee">Coffee</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Input
                      placeholder="Title"
                      value={newInfo.title}
                      onChange={(e) => setNewInfo({...newInfo, title: e.target.value})}
                      className="mb-4"
                    />
                    <Textarea
                      placeholder="Content"
                      value={newInfo.content}
                      onChange={(e) => setNewInfo({...newInfo, content: e.target.value})}
                      className="mb-4"
                      rows={4}
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleCreateCabinInfo} size="sm">
                        Create
                      </Button>
                      <Button 
                        onClick={() => {
                          setIsCreatingNew(false);
                          setNewInfo({ category: '', title: '', content: '', icon: 'info' });
                        }} 
                        variant="outline" 
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {cabinInfo.map((info) => (
                    <div key={info.id} className="border rounded-lg p-4">
                      {editingInfo?.id === info.id ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <Select value={editingInfo.category} onValueChange={(value) => setEditingInfo({...editingInfo, category: value})}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="key">Key</SelectItem>
                                <SelectItem value="kitchen">Kitchen</SelectItem>
                                <SelectItem value="bathroom">Bathroom</SelectItem>
                                <SelectItem value="general">General</SelectItem>
                              </SelectContent>
                            </Select>
                            <Select value={editingInfo.icon} onValueChange={(value) => setEditingInfo({...editingInfo, icon: value})}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="key">Key</SelectItem>
                                <SelectItem value="utensils">Utensils</SelectItem>
                                <SelectItem value="droplets">Droplets</SelectItem>
                                <SelectItem value="bed">Bed</SelectItem>
                                <SelectItem value="coffee">Coffee</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Input
                            value={editingInfo.title}
                            onChange={(e) => setEditingInfo({...editingInfo, title: e.target.value})}
                          />
                          <Textarea
                            value={editingInfo.content}
                            onChange={(e) => setEditingInfo({...editingInfo, content: e.target.value})}
                            rows={4}
                          />
                          <div className="flex gap-2">
                            <Button onClick={() => handleSaveCabinInfo(editingInfo)} size="sm">
                              Save
                            </Button>
                            <Button onClick={() => setEditingInfo(null)} variant="outline" size="sm">
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">{info.category}</Badge>
                              <Badge variant="secondary">{info.icon}</Badge>
                            </div>
                            <h3 className="font-semibold mb-2">{info.title}</h3>
                            <p className="text-sm text-muted-foreground whitespace-pre-line">{info.content}</p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button onClick={() => setEditingInfo(info)} variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button onClick={() => handleDeleteCabinInfo(info.id)} variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="supplies">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Shopping List
                </CardTitle>
                <Button onClick={() => setIsCreatingNewSupply(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </CardHeader>
              <CardContent>
                {isCreatingNewSupply && (
                  <div className="border rounded-lg p-4 mb-4 bg-muted/50">
                    <h3 className="font-semibold mb-3">Add New Supply Item</h3>
                    <Input
                      placeholder="Item name (e.g., Toilet Paper, Dish Soap)"
                      value={newSupply.item_name}
                      onChange={(e) => setNewSupply({...newSupply, item_name: e.target.value})}
                      className="mb-4"
                    />
                    <Textarea
                      placeholder="Notes (optional)"
                      value={newSupply.notes}
                      onChange={(e) => setNewSupply({...newSupply, notes: e.target.value})}
                      className="mb-4"
                      rows={2}
                    />
                    <div className="flex items-center gap-2 mb-4">
                      <input
                        type="checkbox"
                        id="urgent"
                        checked={newSupply.is_urgent}
                        onChange={(e) => setNewSupply({...newSupply, is_urgent: e.target.checked})}
                        className="rounded"
                      />
                      <label htmlFor="urgent" className="text-sm flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        Mark as urgent
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleCreateSupply} size="sm">
                        Add Item
                      </Button>
                      <Button 
                        onClick={() => {
                          setIsCreatingNewSupply(false);
                          setNewSupply({ item_name: '', notes: '', is_urgent: false });
                        }} 
                        variant="outline" 
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {supplies.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No supplies needed</p>
                  ) : (
                    supplies.map((supply) => (
                      <div key={supply.id} className="border rounded-lg p-4">
                        {editingSupply?.id === supply.id ? (
                          <div className="space-y-4">
                            <Input
                              value={editingSupply.item_name}
                              onChange={(e) => setEditingSupply({...editingSupply, item_name: e.target.value})}
                            />
                            <Textarea
                              value={editingSupply.notes || ''}
                              onChange={(e) => setEditingSupply({...editingSupply, notes: e.target.value})}
                              rows={2}
                            />
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`urgent-${supply.id}`}
                                checked={editingSupply.is_urgent}
                                onChange={(e) => setEditingSupply({...editingSupply, is_urgent: e.target.checked})}
                                className="rounded"
                              />
                              <label htmlFor={`urgent-${supply.id}`} className="text-sm flex items-center gap-1">
                                <AlertTriangle className="h-4 w-4 text-destructive" />
                                Mark as urgent
                              </label>
                            </div>
                            <div className="flex gap-2">
                              <Button onClick={() => handleSaveSupply(editingSupply)} size="sm">
                                Save
                              </Button>
                              <Button onClick={() => setEditingSupply(null)} variant="outline" size="sm">
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold">{supply.item_name}</h3>
                                {supply.is_urgent && (
                                  <Badge variant="destructive" className="flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3" />
                                    Urgent
                                  </Badge>
                                )}
                              </div>
                              {supply.notes && (
                                <p className="text-sm text-muted-foreground">{supply.notes}</p>
                              )}
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button onClick={() => setEditingSupply(supply)} variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button onClick={() => handleDeleteSupply(supply.id)} variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects">
            <div className="grid gap-6 md:grid-cols-2">
              <ProjectsForm 
                onProjectAdded={() => {
                  setRefreshProjects(true);
                }}
              />
              <ProjectsList 
                refresh={refreshProjects}
                onRefreshComplete={() => setRefreshProjects(false)}
              />
            </div>
          </TabsContent>

          <TabsContent value="users">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Add New User
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Username</label>
                      <Input
                        placeholder="Enter username"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Password</label>
                      <Input
                        type="password"
                        placeholder="Enter password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    <Button 
                      onClick={addUser}
                      disabled={!newUsername.trim() || !newPassword.trim()}
                      className="w-full"
                    >
                      Add User
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Existing Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {users.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No users found</p>
                    ) : (
                      users.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{user.username}</h3>
                              <Badge variant={user.is_active ? "default" : "destructive"}>
                                {user.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Created: {format(parseISO(user.created_at), 'MMM d, yyyy')}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant={user.is_active ? "destructive" : "default"}
                              onClick={() => toggleUserStatus(user.id, !user.is_active)}
                            >
                              {user.is_active ? "Deactivate" : "Activate"}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteUser(user.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;