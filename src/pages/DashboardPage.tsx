import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Dashboard from '../components/Dashboard';
import Footer from '../components/Footer';
import SampleDataLoader from '../components/SampleDataLoader';
import {
  useItineraryItems,
  useSuppliers,
  useBusinessContacts,
  useExpenses,
  useTodos,
  useAppointments,
  useTrips,
  useFlights,
  useHotels,
  useCars,
  useMeetings
} from '../hooks/useSupabase';
import {
  MapPin, Plus, Calendar, DollarSign, Plane, Hotel, Car, Users,
  ArrowRight, AlertCircle, CheckCircle, Clock
} from 'lucide-react';
import { format, parseISO, isAfter, isBefore, isWithinInterval, addDays } from 'date-fns';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  // Use Supabase hooks for real-time data
  const { data: itinerary } = useItineraryItems();
  const { data: suppliers } = useSuppliers();
  const { data: contacts } = useBusinessContacts();
  const { data: expenses } = useExpenses();
  const { data: todos } = useTodos();
  const { data: appointments } = useAppointments();
  const { data: trips } = useTrips();
  const { data: flights } = useFlights();
  const { data: hotels } = useHotels();
  const { data: cars } = useCars();
  const { data: meetings } = useMeetings();

  // Get active and upcoming trips
  const now = new Date();
  const upcomingTrips = trips
    .filter((trip: any) => {
      const startDate = parseISO(trip.start_date);
      return isAfter(startDate, now) || isWithinInterval(now, {
        start: parseISO(trip.start_date),
        end: parseISO(trip.end_date)
      });
    })
    .sort((a: any, b: any) =>
      new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    )
    .slice(0, 3);

  const getTripStats = (tripId: string) => {
    return {
      flights: flights.filter((f: any) => f.trip_id === tripId).length,
      hotels: hotels.filter((h: any) => h.trip_id === tripId).length,
      cars: cars.filter((c: any) => c.trip_id === tripId).length,
      meetings: meetings.filter((m: any) => m.trip_id === tripId).length,
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'text-green-600 bg-green-100';
      case 'Planning': return 'text-blue-600 bg-blue-100';
      case 'In Progress': return 'text-yellow-600 bg-yellow-100';
      case 'Completed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Welcome to your travel command center</p>
          </div>

          {/* Trips Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <MapPin className="mr-2 text-primary" size={24} />
                  Your Trips
                </h2>
                <p className="text-sm text-gray-600 mt-1">Active and upcoming business trips</p>
              </div>
              <button
                onClick={() => navigate('/trips')}
                className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus size={20} className="mr-2" />
                Create Trip
              </button>
            </div>

            {trips.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No trips yet</h3>
                <p className="text-gray-600 mb-6">Create your first trip to get started</p>
                <button
                  onClick={() => navigate('/trips')}
                  className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Plus size={20} className="mr-2" />
                  Create Your First Trip
                </button>
              </div>
            ) : upcomingTrips.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
                <p className="text-gray-700">No upcoming trips</p>
                <Link to="/trips" className="text-primary hover:underline text-sm mt-2 inline-block">
                  View all trips →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingTrips.map((trip: any) => {
                  const stats = getTripStats(trip.id);
                  const daysUntil = Math.ceil(
                    (new Date(trip.start_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                  );

                  return (
                    <div
                      key={trip.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => navigate('/trips')}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{trip.trip_name}</h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(trip.status)}`}>
                              {trip.status}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600 space-x-4 mb-3">
                            <span className="flex items-center">
                              <MapPin size={16} className="mr-1" />
                              {trip.destination_city}, {trip.destination_country}
                            </span>
                            <span className="flex items-center">
                              <Calendar size={16} className="mr-1" />
                              {format(parseISO(trip.start_date), 'MMM d')} - {format(parseISO(trip.end_date), 'MMM d, yyyy')}
                            </span>
                            {daysUntil > 0 && (
                              <span className="flex items-center text-blue-600 font-medium">
                                <Clock size={16} className="mr-1" />
                                In {daysUntil} days
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm">
                            {stats.flights > 0 && (
                              <span className="flex items-center text-gray-700">
                                <Plane size={16} className="mr-1 text-blue-500" />
                                {stats.flights} {stats.flights === 1 ? 'Flight' : 'Flights'}
                              </span>
                            )}
                            {stats.hotels > 0 && (
                              <span className="flex items-center text-gray-700">
                                <Hotel size={16} className="mr-1 text-green-500" />
                                {stats.hotels} {stats.hotels === 1 ? 'Hotel' : 'Hotels'}
                              </span>
                            )}
                            {stats.cars > 0 && (
                              <span className="flex items-center text-gray-700">
                                <Car size={16} className="mr-1 text-purple-500" />
                                {stats.cars} {stats.cars === 1 ? 'Car' : 'Cars'}
                              </span>
                            )}
                            {stats.meetings > 0 && (
                              <span className="flex items-center text-gray-700">
                                <Users size={16} className="mr-1 text-orange-500" />
                                {stats.meetings} {stats.meetings === 1 ? 'Meeting' : 'Meetings'}
                              </span>
                            )}
                          </div>
                        </div>
                        <ArrowRight className="text-gray-400 flex-shrink-0 ml-4" size={20} />
                      </div>
                    </div>
                  );
                })}

                <Link
                  to="/trips"
                  className="block text-center text-primary hover:text-primary/80 font-medium text-sm py-2"
                >
                  View all trips →
                </Link>
              </div>
            )}
          </div>

          {/* Original Dashboard Component */}
          <Dashboard
            itinerary={itinerary}
            suppliers={suppliers}
            contacts={contacts}
            expenses={expenses}
            todos={todos}
            appointments={appointments}
          />

          <div className="mt-8">
            <SampleDataLoader />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DashboardPage;