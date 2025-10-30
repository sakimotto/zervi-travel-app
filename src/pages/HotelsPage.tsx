import React, { useState } from 'react';
import { useHotels } from '../hooks/useSupabase';
import { useAuth } from '../hooks/useAuth';
import { Hotel, Plus, Search, Edit, Trash2, Calendar, Clock, MapPin, DollarSign, CreditCard, User, Filter, Wifi, Coffee } from 'lucide-react';
import Drawer from '../components/Drawer';
import { format } from 'date-fns';

const HotelsPage: React.FC = () => {
  const { user } = useAuth();
  const { data: hotels, loading, insert, update, remove } = useHotels();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [formData, setFormData] = useState({
    hotel_name: '', confirmation_number: '', address: '', city: '', country: '', phone: '', email: '',
    check_in_date: '', check_in_time: '', check_out_date: '', check_out_time: '', room_type: '', room_number: '',
    guest_name: '', number_of_guests: 1, cost_per_night: 0, total_nights: 0, total_cost: 0,
    breakfast_included: false, wifi_included: true, status: 'Confirmed', notes: ''
  });

  const filteredHotels = hotels.filter((h: any) => {
    const matchesSearch = h.hotel_name.toLowerCase().includes(searchTerm.toLowerCase()) || h.city?.toLowerCase().includes(searchTerm.toLowerCase()) || h.guest_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || h.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => new Date(a.check_in_date).getTime() - new Date(b.check_in_date).getTime());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      if (editingHotel) { await update(editingHotel.id, formData as any); } else { await insert({ ...formData, user_id: user.id } as any); }
      closeDrawer();
    } catch (error) { logger.error('Error saving hotel:', error); }
  };

  const openAddDrawer = () => {
    setEditingHotel(null);
    setFormData({ hotel_name: '', confirmation_number: '', address: '', city: '', country: '', phone: '', email: '', check_in_date: '', check_in_time: '', check_out_date: '', check_out_time: '', room_type: '', room_number: '', guest_name: '', number_of_guests: 1, cost_per_night: 0, total_nights: 0, total_cost: 0, breakfast_included: false, wifi_included: true, status: 'Confirmed', notes: '' });
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (hotel: any) => {
    setEditingHotel(hotel);
    setFormData({ hotel_name: hotel.hotel_name, confirmation_number: hotel.confirmation_number || '', address: hotel.address || '', city: hotel.city || '', country: hotel.country || '', phone: hotel.phone || '', email: hotel.email || '', check_in_date: hotel.check_in_date, check_in_time: hotel.check_in_time || '', check_out_date: hotel.check_out_date, check_out_time: hotel.check_out_time || '', room_type: hotel.room_type || '', room_number: hotel.room_number || '', guest_name: hotel.guest_name || '', number_of_guests: hotel.number_of_guests || 1, cost_per_night: hotel.cost_per_night || 0, total_nights: hotel.total_nights || 0, total_cost: hotel.total_cost || 0, breakfast_included: hotel.breakfast_included || false, wifi_included: hotel.wifi_included || false, status: hotel.status || 'Confirmed', notes: hotel.notes || '' });
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => { setIsDrawerOpen(false); setEditingHotel(null); };
  const handleDeleteHotel = async (id: string) => { if (window.confirm('Delete this hotel booking?')) { try { await remove(id); } catch (error) { logger.error('Error deleting hotel:', error); } } };
  const getStatusColor = (status: string) => { switch (status) { case 'Confirmed': return 'bg-green-100 text-green-800'; case 'Pending': return 'bg-yellow-100 text-yellow-800'; case 'Cancelled': return 'bg-red-100 text-red-800'; case 'Completed': return 'bg-gray-100 text-gray-800'; default: return 'bg-gray-100 text-gray-800'; } };
  const stats = { total: hotels.length, upcoming: hotels.filter((h: any) => new Date(h.check_in_date) > new Date() && h.status === 'Confirmed').length, totalCost: hotels.reduce((sum: number, h: any) => sum + (h.total_cost || 0), 0) };

  if (loading) return (<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div><p className="text-gray-600">Loading hotels...</p></div></div>);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div><h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2"><Hotel className="text-primary" />Hotels</h1><p className="text-gray-600 mt-1">Manage all your hotel bookings</p></div>
          <button onClick={openAddDrawer} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"><Plus size={20} />Add Hotel</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Total Hotels</p><p className="text-2xl font-bold text-gray-900">{stats.total}</p></div><Hotel className="text-gray-400" size={32} /></div></div>
          <div className="bg-white rounded-lg shadow-sm p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Upcoming</p><p className="text-2xl font-bold text-blue-600">{stats.upcoming}</p></div><Calendar className="text-blue-400" size={32} /></div></div>
          <div className="bg-white rounded-lg shadow-sm p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Total Cost</p><p className="text-2xl font-bold text-green-600">${stats.totalCost.toLocaleString()}</p></div><DollarSign className="text-green-400" size={32} /></div></div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} /><input type="text" placeholder="Search by hotel, city, or guest..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" /></div>
            <div className="relative"><Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} /><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary appearance-none"><option value="All">All Status</option><option value="Confirmed">Confirmed</option><option value="Pending">Pending</option><option value="Cancelled">Cancelled</option><option value="Completed">Completed</option></select></div>
          </div>
        </div>

        <div className="space-y-4">
          {filteredHotels.map((hotel: any) => (
            <div key={hotel.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{hotel.hotel_name}</h3>
                    {hotel.confirmation_number && <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">{hotel.confirmation_number}</span>}
                    <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(hotel.status)}`}>{hotel.status}</span>
                  </div>
                  <p className="text-gray-600 flex items-center gap-2"><MapPin size={16} />{hotel.city && hotel.country ? `${hotel.city}, ${hotel.country}` : hotel.city || hotel.country || 'Location not specified'}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEditDrawer(hotel)} className="text-primary hover:text-primary/80 p-1" title="Edit"><Edit size={18} /></button>
                  <button onClick={() => handleDeleteHotel(hotel.id)} className="text-red-600 hover:text-red-700 p-1" title="Delete"><Trash2 size={18} /></button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div><div className="text-sm text-gray-600 mb-1">Check-In</div><div className="flex items-center gap-2 text-gray-900"><Calendar size={16} />{format(new Date(hotel.check_in_date), 'MMM dd, yyyy')}{hotel.check_in_time && <><Clock size={14} className="ml-2" />{hotel.check_in_time}</>}</div></div>
                <div><div className="text-sm text-gray-600 mb-1">Check-Out</div><div className="flex items-center gap-2 text-gray-900"><Calendar size={16} />{format(new Date(hotel.check_out_date), 'MMM dd, yyyy')}{hotel.check_out_time && <><Clock size={14} className="ml-2" />{hotel.check_out_time}</>}</div></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm pt-4 border-t border-gray-200">
                {hotel.guest_name && <div className="text-gray-700"><User size={14} className="inline mr-1" /><strong>Guest:</strong> {hotel.guest_name}</div>}
                {hotel.room_type && <div className="text-gray-700"><strong>Room:</strong> {hotel.room_type}</div>}
                {hotel.total_nights > 0 && <div className="text-gray-700"><strong>Nights:</strong> {hotel.total_nights}</div>}
                {hotel.total_cost > 0 && <div className="text-gray-700 flex items-center gap-1"><DollarSign size={14} /><strong>Total:</strong> ${hotel.total_cost.toLocaleString()}</div>}
              </div>
              {(hotel.breakfast_included || hotel.wifi_included) && (
                <div className="flex gap-3 mt-3 text-sm">
                  {hotel.breakfast_included && <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2 py-1 rounded"><Coffee size={14} />Breakfast</span>}
                  {hotel.wifi_included && <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-1 rounded"><Wifi size={14} />WiFi</span>}
                </div>
              )}
              {hotel.notes && <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded"><strong>Notes:</strong> {hotel.notes}</div>}
            </div>
          ))}
        </div>

        {filteredHotels.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Hotel size={64} className="mx-auto text-gray-400 mb-4" /><h3 className="text-xl font-semibold text-gray-900 mb-2">No hotels found</h3>
            <p className="text-gray-600 mb-4">{searchTerm || statusFilter !== 'All' ? 'Try adjusting your search or filters' : 'Get started by adding your first hotel booking'}</p>
            {!searchTerm && statusFilter === 'All' && <button onClick={openAddDrawer} className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors">Add First Hotel</button>}
          </div>
        )}
      </div>

      <Drawer isOpen={isDrawerOpen} onClose={closeDrawer} title={editingHotel ? 'Edit Hotel' : 'Add New Hotel'} size="xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><Hotel size={20} />Hotel Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Hotel Name *</label><input type="text" required value={formData.hotel_name} onChange={(e) => setFormData({ ...formData, hotel_name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" placeholder="Caesars Palace" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1"><CreditCard size={14} className="inline mr-1" />Confirmation Number</label><input type="text" value={formData.confirmation_number} onChange={(e) => setFormData({ ...formData, confirmation_number: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" placeholder="ABC123" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label><select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"><option value="Confirmed">Confirmed</option><option value="Pending">Pending</option><option value="Cancelled">Cancelled</option><option value="Completed">Completed</option></select></div>
              <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Address</label><input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" placeholder="3570 Las Vegas Blvd S" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">City</label><input type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" placeholder="Las Vegas" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Country</label><input type="text" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" placeholder="United States" /></div>
            </div>
          </div>
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Check-In & Check-Out</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Check-In Date *</label><input type="date" required value={formData.check_in_date} onChange={(e) => setFormData({ ...formData, check_in_date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Check-In Time</label><input type="time" value={formData.check_in_time} onChange={(e) => setFormData({ ...formData, check_in_time: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Check-Out Date *</label><input type="date" required value={formData.check_out_date} onChange={(e) => setFormData({ ...formData, check_out_date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Check-Out Time</label><input type="time" value={formData.check_out_time} onChange={(e) => setFormData({ ...formData, check_out_time: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" /></div>
            </div>
          </div>
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Room Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Guest Name</label><input type="text" value={formData.guest_name} onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" placeholder="John Smith" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Number of Guests</label><input type="number" value={formData.number_of_guests} onChange={(e) => setFormData({ ...formData, number_of_guests: parseInt(e.target.value) || 1 })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" min="1" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label><input type="text" value={formData.room_type} onChange={(e) => setFormData({ ...formData, room_type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" placeholder="Deluxe King" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label><input type="text" value={formData.room_number} onChange={(e) => setFormData({ ...formData, room_number: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" placeholder="1501" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1"><DollarSign size={14} className="inline mr-1" />Cost per Night</label><input type="number" value={formData.cost_per_night} onChange={(e) => setFormData({ ...formData, cost_per_night: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" placeholder="200" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Total Nights</label><input type="number" value={formData.total_nights} onChange={(e) => setFormData({ ...formData, total_nights: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" placeholder="4" /></div>
              <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1"><DollarSign size={14} className="inline mr-1" />Total Cost</label><input type="number" value={formData.total_cost} onChange={(e) => setFormData({ ...formData, total_cost: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" placeholder="800" /></div>
              <div className="flex items-center gap-4"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={formData.breakfast_included} onChange={(e) => setFormData({ ...formData, breakfast_included: e.target.checked })} className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary" /><span className="text-sm text-gray-700">Breakfast Included</span></label></div>
              <div className="flex items-center gap-4"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={formData.wifi_included} onChange={(e) => setFormData({ ...formData, wifi_included: e.target.checked })} className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary" /><span className="text-sm text-gray-700">WiFi Included</span></label></div>
              <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Notes</label><textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" placeholder="Special requests, preferences..." /></div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t sticky bottom-0 bg-white">
            <button type="button" onClick={closeDrawer} className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">{editingHotel ? 'Update Hotel' : 'Add Hotel'}</button>
          </div>
        </form>
      </Drawer>
    </div>
  );
};

export default HotelsPage;
