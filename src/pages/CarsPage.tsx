import React, { useState } from 'react';
import { useCars, useTrips } from '../hooks/useSupabase';
import { useAuth } from '../hooks/useAuth';
import { Car, Plus, Search, Edit, Trash2, Calendar, MapPin, DollarSign, Filter } from 'lucide-react';
import Drawer from '../components/Drawer';
import { format } from 'date-fns';
import { logger } from '../utils/logger';

const CarsPage: React.FC = () => {
  const { user } = useAuth();
  const { data: cars, loading, insert, update, remove } = useCars();
  const { data: trips } = useTrips();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [tripFilter, setTripFilter] = useState<string>('All');

  const getTripName = (tripId: string | null | undefined) => {
    if (!tripId) return null;
    const trip = trips.find((t: any) => t.id === tripId);
    return trip ? trip.trip_name : null;
  };
  const [formData, setFormData] = useState({
    rental_company: '', confirmation_number: '', vehicle_type: '', vehicle_make_model: '',
    pickup_location: '', pickup_date: '', pickup_time: '', dropoff_location: '', dropoff_date: '',
    dropoff_time: '', driver_name: '', cost_per_day: 0, total_cost: 0, insurance_included: false,
    gps_included: false, status: 'Confirmed', notes: ''
  });

  const filteredCars = cars.filter((c: any) => {
    const matchesSearch = c.rental_company.toLowerCase().includes(searchTerm.toLowerCase()) || c.vehicle_type?.toLowerCase().includes(searchTerm.toLowerCase()) || c.driver_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTrip = tripFilter === 'All' || c.trip_id === tripFilter;
    return (statusFilter === 'All' || c.status === statusFilter) && matchesSearch && matchesTrip;
  }).sort((a, b) => new Date(a.pickup_date).getTime() - new Date(b.pickup_date).getTime());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      if (editingCar) { await update(editingCar.id, formData as any); } else { await insert({ ...formData, user_id: user.id } as any); }
      closeDrawer();
    } catch (error) { logger.error('Error saving car:', error); }
  };

  const openAddDrawer = () => { setEditingCar(null); setFormData({ rental_company: '', confirmation_number: '', vehicle_type: '', vehicle_make_model: '', pickup_location: '', pickup_date: '', pickup_time: '', dropoff_location: '', dropoff_date: '', dropoff_time: '', driver_name: '', cost_per_day: 0, total_cost: 0, insurance_included: false, gps_included: false, status: 'Confirmed', notes: '', trip_id: tripFilter !== 'All' ? tripFilter : null }); setIsDrawerOpen(true); };
  const openEditDrawer = (car: any) => { setEditingCar(car); setFormData({ rental_company: car.rental_company, confirmation_number: car.confirmation_number || '', vehicle_type: car.vehicle_type || '', vehicle_make_model: car.vehicle_make_model || '', pickup_location: car.pickup_location, pickup_date: car.pickup_date, pickup_time: car.pickup_time || '', dropoff_location: car.dropoff_location, dropoff_date: car.dropoff_date, dropoff_time: car.dropoff_time || '', driver_name: car.driver_name || '', cost_per_day: car.cost_per_day || 0, total_cost: car.total_cost || 0, insurance_included: car.insurance_included || false, gps_included: car.gps_included || false, status: car.status || 'Confirmed', notes: car.notes || '', trip_id: car.trip_id || null }); setIsDrawerOpen(true); };
  const closeDrawer = () => { setIsDrawerOpen(false); setEditingCar(null); };
  const handleDeleteCar = async (id: string) => { if (window.confirm('Delete this car rental?')) { try { await remove(id); } catch (error) { logger.error('Error deleting car:', error); } } };
  const getStatusColor = (status: string) => { switch (status) { case 'Confirmed': return 'bg-green-100 text-green-800'; case 'Pending': return 'bg-yellow-100 text-yellow-800'; case 'Cancelled': return 'bg-red-100 text-red-800'; case 'Completed': return 'bg-gray-100 text-gray-800'; default: return 'bg-gray-100 text-gray-800'; } };
  const stats = { total: cars.length, upcoming: cars.filter((c: any) => new Date(c.pickup_date) > new Date() && c.status === 'Confirmed').length, totalCost: cars.reduce((sum: number, c: any) => sum + (c.total_cost || 0), 0) };

  if (loading) return (<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div><p className="text-gray-600">Loading cars...</p></div></div>);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div><h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2"><Car className="text-primary" />Cars</h1><p className="text-gray-600 mt-1">Manage all your car rentals</p></div>
          <button onClick={openAddDrawer} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"><Plus size={20} />Add Car</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Total Cars</p><p className="text-2xl font-bold text-gray-900">{stats.total}</p></div><Car className="text-gray-400" size={32} /></div></div>
          <div className="bg-white rounded-lg shadow-sm p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Upcoming</p><p className="text-2xl font-bold text-blue-600">{stats.upcoming}</p></div><Calendar className="text-blue-400" size={32} /></div></div>
          <div className="bg-white rounded-lg shadow-sm p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Total Cost</p><p className="text-2xl font-bold text-green-600">${stats.totalCost.toLocaleString()}</p></div><DollarSign className="text-green-400" size={32} /></div></div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} /><input type="text" placeholder="Search by company, vehicle, or driver..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" /></div>
            <div className="relative"><Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} /><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary appearance-none"><option value="All">All Status</option><option value="Confirmed">Confirmed</option><option value="Pending">Pending</option><option value="Cancelled">Cancelled</option><option value="Completed">Completed</option></select></div>
            <div className="relative"><Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} /><select value={tripFilter} onChange={(e) => setTripFilter(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary appearance-none"><option value="All">All Trips</option>{trips.map((trip: any) => (<option key={trip.id} value={trip.id}>{trip.trip_name}</option>))}</select></div>
          </div>
        </div>
        <div className="space-y-4">
          {filteredCars.map((car: any) => (
            <div key={car.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{car.rental_company}</h3>
                    {car.confirmation_number && <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">{car.confirmation_number}</span>}
                    <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(car.status)}`}>{car.status}</span>
                  </div>
                  <p className="text-gray-600">{car.vehicle_type} {car.vehicle_make_model && `- ${car.vehicle_make_model}`}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEditDrawer(car)} className="text-primary hover:text-primary/80 p-1" title="Edit"><Edit size={18} /></button>
                  <button onClick={() => handleDeleteCar(car.id)} className="text-red-600 hover:text-red-700 p-1" title="Delete"><Trash2 size={18} /></button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div><div className="text-sm text-gray-600 mb-1">Pick-Up</div><div className="flex items-center gap-2 text-gray-900"><MapPin size={16} />{car.pickup_location}</div><div className="flex items-center gap-2 text-sm text-gray-700 mt-1"><Calendar size={14} />{format(new Date(car.pickup_date), 'MMM dd, yyyy')}</div></div>
                <div><div className="text-sm text-gray-600 mb-1">Drop-Off</div><div className="flex items-center gap-2 text-gray-900"><MapPin size={16} />{car.dropoff_location}</div><div className="flex items-center gap-2 text-sm text-gray-700 mt-1"><Calendar size={14} />{format(new Date(car.dropoff_date), 'MMM dd, yyyy')}</div></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm pt-4 border-t border-gray-200">
                {car.driver_name && <div className="text-gray-700"><strong>Driver:</strong> {car.driver_name}</div>}
                {car.cost_per_day > 0 && <div className="text-gray-700"><strong>Per Day:</strong> ${car.cost_per_day}</div>}
                {car.total_cost > 0 && <div className="text-gray-700 flex items-center gap-1"><DollarSign size={14} /><strong>Total:</strong> ${car.total_cost.toLocaleString()}</div>}
                {(car.insurance_included || car.gps_included) && <div className="text-gray-700"><strong>Extras:</strong> {[car.insurance_included && 'Insurance', car.gps_included && 'GPS'].filter(Boolean).join(', ')}</div>}
              </div>
              {car.notes && <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded"><strong>Notes:</strong> {car.notes}</div>}
            </div>
          ))}
        </div>
        {filteredCars.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Car size={64} className="mx-auto text-gray-400 mb-4" /><h3 className="text-xl font-semibold text-gray-900 mb-2">No cars found</h3>
            <p className="text-gray-600 mb-4">{searchTerm || statusFilter !== 'All' ? 'Try adjusting your search or filters' : 'Get started by adding your first car rental'}</p>
            {!searchTerm && statusFilter === 'All' && <button onClick={openAddDrawer} className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors">Add First Car</button>}
          </div>
        )}
      </div>
      <Drawer isOpen={isDrawerOpen} onClose={closeDrawer} title={editingCar ? 'Edit Car' : 'Add New Car'} size="xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div><h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><Car size={20} />Rental Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Rental Company *</label><input type="text" required value={formData.rental_company} onChange={(e) => setFormData({ ...formData, rental_company: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" placeholder="Enterprise" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Assign to Trip</label><select value={formData.trip_id || ''} onChange={(e) => setFormData({ ...formData, trip_id: e.target.value || null })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"><option value="">No Trip (Unassigned)</option>{trips.map((trip: any) => (<option key={trip.id} value={trip.id}>{trip.trip_name}</option>))}</select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Confirmation Number</label><input type="text" value={formData.confirmation_number} onChange={(e) => setFormData({ ...formData, confirmation_number: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" placeholder="ENT123" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label><select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"><option value="Confirmed">Confirmed</option><option value="Pending">Pending</option><option value="Cancelled">Cancelled</option><option value="Completed">Completed</option></select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label><input type="text" value={formData.vehicle_type} onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" placeholder="SUV" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Make/Model</label><input type="text" value={formData.vehicle_make_model} onChange={(e) => setFormData({ ...formData, vehicle_make_model: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" placeholder="Toyota RAV4" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Driver Name</label><input type="text" value={formData.driver_name} onChange={(e) => setFormData({ ...formData, driver_name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" placeholder="John Smith" /></div>
            </div>
          </div>
          <div className="border-t pt-6"><h3 className="text-lg font-semibold text-gray-900 mb-4">Pick-Up & Drop-Off</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Pick-Up Location *</label><input type="text" required value={formData.pickup_location} onChange={(e) => setFormData({ ...formData, pickup_location: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" placeholder="Las Vegas Airport" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Drop-Off Location *</label><input type="text" required value={formData.dropoff_location} onChange={(e) => setFormData({ ...formData, dropoff_location: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" placeholder="Las Vegas Airport" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Pick-Up Date *</label><input type="date" required value={formData.pickup_date} onChange={(e) => setFormData({ ...formData, pickup_date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Pick-Up Time</label><input type="time" value={formData.pickup_time} onChange={(e) => setFormData({ ...formData, pickup_time: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Drop-Off Date *</label><input type="date" required value={formData.dropoff_date} onChange={(e) => setFormData({ ...formData, dropoff_date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Drop-Off Time</label><input type="time" value={formData.dropoff_time} onChange={(e) => setFormData({ ...formData, dropoff_time: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" /></div>
            </div>
          </div>
          <div className="border-t pt-6"><h3 className="text-lg font-semibold text-gray-900 mb-4">Cost & Extras</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1"><DollarSign size={14} className="inline mr-1" />Cost per Day</label><input type="number" value={formData.cost_per_day} onChange={(e) => setFormData({ ...formData, cost_per_day: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" placeholder="50" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1"><DollarSign size={14} className="inline mr-1" />Total Cost</label><input type="number" value={formData.total_cost} onChange={(e) => setFormData({ ...formData, total_cost: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" placeholder="200" /></div>
              <div className="flex items-center gap-4"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={formData.insurance_included} onChange={(e) => setFormData({ ...formData, insurance_included: e.target.checked })} className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary" /><span className="text-sm text-gray-700">Insurance Included</span></label></div>
              <div className="flex items-center gap-4"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={formData.gps_included} onChange={(e) => setFormData({ ...formData, gps_included: e.target.checked })} className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary" /><span className="text-sm text-gray-700">GPS Included</span></label></div>
              <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Notes</label><textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" placeholder="Special requests, preferences..." /></div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t sticky bottom-0 bg-white">
            <button type="button" onClick={closeDrawer} className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">{editingCar ? 'Update Car' : 'Add Car'}</button>
          </div>
        </form>
      </Drawer>
    </div>
  );
};

export default CarsPage;
