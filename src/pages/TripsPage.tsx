import React, { useState } from 'react';
import { useTrips, useFlights, useHotels, useCars, useMeetings } from '../hooks/useSupabase';
import { useAuth } from '../hooks/useAuth';
import {
  MapPin, Plus, Search, Edit, Trash2, Calendar, DollarSign,
  Plane, Hotel, Car, Users, Filter, TrendingUp
} from 'lucide-react';
import Drawer from '../components/Drawer';
import { format } from 'date-fns';
import type { Trip } from '../types';

const TripsPage: React.FC = () => {
  const { user } = useAuth();
  const { data: trips, loading, insert, update, remove } = useTrips();
  const { data: flights } = useFlights();
  const { data: hotels } = useHotels();
  const { data: cars } = useCars();
  const { data: meetings } = useMeetings();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const [formData, setFormData] = useState({
    trip_name: '',
    purpose: 'Business',
    destination_city: '',
    destination_country: '',
    start_date: '',
    end_date: '',
    status: 'Planning',
    budget: 0,
    notes: '',
  });

  const filteredTrips = trips.filter((trip: any) => {
    const matchesSearch =
      trip.trip_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.destination_city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.destination_country?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || trip.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const sortedTrips = [...filteredTrips].sort((a, b) =>
    new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
  );

  const getTripCounts = (tripId: string) => {
    return {
      flights: flights.filter((f: any) => f.trip_id === tripId).length,
      hotels: hotels.filter((h: any) => h.trip_id === tripId).length,
      cars: cars.filter((c: any) => c.trip_id === tripId).length,
      meetings: meetings.filter((m: any) => m.trip_id === tripId).length,
    };
  };

  const getTripCost = (tripId: string) => {
    const flightCost = flights
      .filter((f: any) => f.trip_id === tripId)
      .reduce((sum: number, f: any) => sum + (f.cost || 0), 0);
    const hotelCost = hotels
      .filter((h: any) => h.trip_id === tripId)
      .reduce((sum: number, h: any) => sum + (h.total_cost || 0), 0);
    const carCost = cars
      .filter((c: any) => c.trip_id === tripId)
      .reduce((sum: number, c: any) => sum + (c.total_cost || 0), 0);
    return flightCost + hotelCost + carCost;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (editingTrip) {
        await update(editingTrip.id, formData as any);
      } else {
        await insert({ ...formData, user_id: user.id } as any);
      }
      closeDrawer();
    } catch (error) {
      logger.error('Error saving trip:', error);
    }
  };

  const openAddDrawer = () => {
    setEditingTrip(null);
    setFormData({
      trip_name: '',
      purpose: 'Business',
      destination_city: '',
      destination_country: '',
      start_date: '',
      end_date: '',
      status: 'Planning',
      budget: 0,
      notes: '',
    });
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (trip: any) => {
    setEditingTrip(trip);
    setFormData({
      trip_name: trip.trip_name,
      purpose: trip.purpose,
      destination_city: trip.destination_city || '',
      destination_country: trip.destination_country || '',
      start_date: trip.start_date,
      end_date: trip.end_date,
      status: trip.status,
      budget: trip.budget || 0,
      notes: trip.notes || '',
    });
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setEditingTrip(null);
  };

  const handleDeleteTrip = async (id: string) => {
    if (window.confirm('Delete this trip? Associated bookings will be unlinked but not deleted.')) {
      try {
        await remove(id);
      } catch (error) {
        logger.error('Error deleting trip:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'bg-green-100 text-green-800';
      case 'Planning': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-purple-100 text-purple-800';
      case 'Completed': return 'bg-gray-100 text-gray-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    total: trips.length,
    upcoming: trips.filter((t: any) => new Date(t.start_date) > new Date() && t.status !== 'Cancelled').length,
    totalBudget: trips.reduce((sum: number, t: any) => sum + (t.budget || 0), 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading trips...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="text-primary" />
              Trips
            </h1>
            <p className="text-gray-600 mt-1">
              Organize all your travel - flights, hotels, cars & meetings
            </p>
          </div>
          <button
            onClick={openAddDrawer}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Add Trip
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Trips</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <MapPin className="text-gray-400" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-blue-600">{stats.upcoming}</p>
              </div>
              <Calendar className="text-blue-400" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Budget</p>
                <p className="text-2xl font-bold text-green-600">${stats.totalBudget.toLocaleString()}</p>
              </div>
              <DollarSign className="text-green-400" size={32} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search trips by name or destination..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary appearance-none"
              >
                <option value="All">All Status</option>
                <option value="Planning">Planning</option>
                <option value="Confirmed">Confirmed</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedTrips.map((trip: any) => {
            const counts = getTripCounts(trip.id);
            const actualCost = getTripCost(trip.id);
            const isOverBudget = actualCost > (trip.budget || 0);

            return (
              <div key={trip.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{trip.trip_name}</h3>
                    <p className="text-gray-600 text-sm flex items-center gap-1">
                      <MapPin size={14} />
                      {trip.destination_city}, {trip.destination_country}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditDrawer(trip)}
                      className="text-primary hover:text-primary/80 p-1"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteTrip(trip.id)}
                      className="text-red-600 hover:text-red-700 p-1"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                    <Calendar size={14} />
                    {format(new Date(trip.start_date), 'MMM dd')} - {format(new Date(trip.end_date), 'MMM dd, yyyy')}
                  </div>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(trip.status)}`}>
                    {trip.status}
                  </span>
                  {trip.purpose && (
                    <span className="ml-2 inline-block px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                      {trip.purpose}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Plane size={14} />
                    {counts.flights} Flights
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Hotel size={14} />
                    {counts.hotels} Hotels
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Car size={14} />
                    {counts.cars} Cars
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Users size={14} />
                    {counts.meetings} Meetings
                  </div>
                </div>

                {trip.budget > 0 && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Budget:</span>
                      <span className="font-medium">${trip.budget.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Actual:</span>
                      <span className={`font-medium ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                        ${actualCost.toLocaleString()}
                      </span>
                    </div>
                    {isOverBudget && (
                      <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
                        <TrendingUp size={12} />
                        Over budget by ${(actualCost - trip.budget).toLocaleString()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredTrips.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <MapPin size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No trips found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'All'
                ? 'Try adjusting your search or filters'
                : 'Start planning your next business trip'}
            </p>
            {!searchTerm && statusFilter === 'All' && (
              <button
                onClick={openAddDrawer}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Plan First Trip
              </button>
            )}
          </div>
        )}
      </div>

      <Drawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        title={editingTrip ? 'Edit Trip' : 'Add New Trip'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trip Name *
            </label>
            <input
              type="text"
              required
              value={formData.trip_name}
              onChange={(e) => setFormData({ ...formData, trip_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="SEMA 2025"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purpose
              </label>
              <select
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="Business">Business</option>
                <option value="Leisure">Leisure</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="Planning">Planning</option>
                <option value="Confirmed">Confirmed</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destination City *
              </label>
              <input
                type="text"
                required
                value={formData.destination_city}
                onChange={(e) => setFormData({ ...formData, destination_city: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Las Vegas"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country *
              </label>
              <input
                type="text"
                required
                value={formData.destination_country}
                onChange={(e) => setFormData({ ...formData, destination_country: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="United States"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date *
              </label>
              <input
                type="date"
                required
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Budget (USD)
            </label>
            <input
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="4000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Trip details, objectives, special requirements..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={closeDrawer}
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              {editingTrip ? 'Update Trip' : 'Create Trip'}
            </button>
          </div>
        </form>
      </Drawer>
    </div>
  );
};

export default TripsPage;
