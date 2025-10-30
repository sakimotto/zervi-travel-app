import React, { useState } from 'react';
import { useFlights } from '../hooks/useSupabase';
import { useAuth } from '../hooks/useAuth';
import {
  Plane, Plus, Search, Edit, Trash2, Calendar, Clock, MapPin,
  DollarSign, CreditCard, ArrowRight, Filter
} from 'lucide-react';
import Drawer from '../components/Drawer';
import FlightForm from '../components/FlightForm';
import { format } from 'date-fns';

interface Flight {
  id: string;
  user_id: string;
  traveler_name: string;
  airline: string;
  flight_number: string;
  confirmation_number: string;
  departure_airport: string;
  departure_city: string;
  arrival_airport: string;
  arrival_city: string;
  departure_date: string;
  departure_time: string;
  arrival_date: string;
  arrival_time: string;
  seat_number: string;
  class: string;
  cost: number;
  booking_reference: string;
  status: string;
  notes: string;
  created_at: string;
}

const FlightsPage: React.FC = () => {
  const { user } = useAuth();
  const { data: flights, loading, insert, update, remove } = useFlights();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const filteredFlights = flights.filter((flight: Flight) => {
    const matchesSearch =
      flight.traveler_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.airline.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.flight_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.departure_airport.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.arrival_airport.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || flight.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const sortedFlights = [...filteredFlights].sort((a, b) =>
    new Date(a.departure_date).getTime() - new Date(b.departure_date).getTime()
  );

  const handleAddFlight = async (flightData: Partial<Flight>) => {
    if (!user) return;

    try {
      await insert({
        ...flightData,
        user_id: user.id,
      } as any);

      setIsDrawerOpen(false);
    } catch (error) {
      logger.error('Error adding flight:', error);
    }
  };

  const handleUpdateFlight = async (id: string, flightData: Partial<Flight>) => {
    try {
      await update(id, flightData as any);
      setEditingFlight(null);
      setIsDrawerOpen(false);
    } catch (error) {
      logger.error('Error updating flight:', error);
    }
  };

  const handleDeleteFlight = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this flight?')) {
      try {
        await remove(id);
      } catch (error) {
        logger.error('Error deleting flight:', error);
      }
    }
  };

  const openEditDrawer = (flight: Flight) => {
    setEditingFlight(flight);
    setIsDrawerOpen(true);
  };

  const openAddDrawer = () => {
    setEditingFlight(null);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setEditingFlight(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      case 'Completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    total: flights.length,
    upcoming: flights.filter((f: Flight) => new Date(f.departure_date) > new Date() && f.status === 'Confirmed').length,
    totalCost: flights.reduce((sum: number, f: Flight) => sum + (f.cost || 0), 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading flights...</p>
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
              <Plane className="text-primary" />
              Flights
            </h1>
            <p className="text-gray-600 mt-1">
              Manage all your flight bookings
            </p>
          </div>
          <button
            onClick={openAddDrawer}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Add Flight
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Flights</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Plane className="text-gray-400" size={32} />
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
                <p className="text-sm text-gray-600">Total Cost</p>
                <p className="text-2xl font-bold text-green-600">${stats.totalCost.toLocaleString()}</p>
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
                placeholder="Search by traveler, airline, flight number, or airport..."
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
                <option value="Confirmed">Confirmed</option>
                <option value="Pending">Pending</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {sortedFlights.map((flight: Flight) => (
            <div key={flight.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{flight.airline}</h3>
                    {flight.flight_number && (
                      <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {flight.flight_number}
                      </span>
                    )}
                    <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(flight.status)}`}>
                      {flight.status}
                    </span>
                  </div>
                  <p className="text-gray-600 flex items-center gap-2">
                    <CreditCard size={16} />
                    Traveler: {flight.traveler_name}
                    {flight.confirmation_number && ` • Conf: ${flight.confirmation_number}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditDrawer(flight)}
                    className="text-primary hover:text-primary/80 p-1"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteFlight(flight.id)}
                    className="text-red-600 hover:text-red-700 p-1"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <MapPin size={16} />
                    <span>Departure</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{flight.departure_airport}</div>
                  {flight.departure_city && <div className="text-sm text-gray-600">{flight.departure_city}</div>}
                  <div className="flex items-center gap-2 text-sm text-gray-700 mt-2">
                    <Calendar size={14} />
                    {format(new Date(flight.departure_date), 'MMM dd, yyyy')}
                  </div>
                  {flight.departure_time && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Clock size={14} />
                      {flight.departure_time}
                    </div>
                  )}
                </div>

                <div className="flex justify-center">
                  <ArrowRight className="text-gray-400" size={32} />
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <MapPin size={16} />
                    <span>Arrival</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{flight.arrival_airport}</div>
                  {flight.arrival_city && <div className="text-sm text-gray-600">{flight.arrival_city}</div>}
                  <div className="flex items-center gap-2 text-sm text-gray-700 mt-2">
                    <Calendar size={14} />
                    {format(new Date(flight.arrival_date), 'MMM dd, yyyy')}
                  </div>
                  {flight.arrival_time && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Clock size={14} />
                      {flight.arrival_time}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-4 text-sm">
                {flight.seat_number && (
                  <span className="text-gray-700">
                    <strong>Seat:</strong> {flight.seat_number}
                  </span>
                )}
                {flight.class && (
                  <span className="text-gray-700">
                    <strong>Class:</strong> {flight.class}
                  </span>
                )}
                {flight.cost > 0 && (
                  <span className="text-gray-700 flex items-center gap-1">
                    <DollarSign size={14} />
                    <strong>Cost:</strong> ${flight.cost.toLocaleString()}
                  </span>
                )}
                {flight.booking_reference && (
                  <span className="text-gray-700">
                    <strong>Ref:</strong> {flight.booking_reference}
                  </span>
                )}
              </div>

              {flight.notes && (
                <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded">
                  <strong>Notes:</strong> {flight.notes}
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredFlights.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Plane size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No flights found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'All'
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first flight'}
            </p>
            {!searchTerm && statusFilter === 'All' && (
              <button
                onClick={openAddDrawer}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Add First Flight
              </button>
            )}
          </div>
        )}
      </div>

      <Drawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        title={editingFlight ? 'Edit Flight' : 'Add New Flight'}
        size="xl"
      >
        <FlightForm
          flight={editingFlight}
          onSubmit={(data) =>
            editingFlight
              ? handleUpdateFlight(editingFlight.id, data)
              : handleAddFlight(data)
          }
          onCancel={closeDrawer}
        />
      </Drawer>
    </div>
  );
};

export default FlightsPage;
