import React, { useState } from 'react';
import { Plane, Calendar, Clock, MapPin, DollarSign, CreditCard, User } from 'lucide-react';
import { useTrips } from '../hooks/useSupabase';

interface Flight {
  id?: string;
  user_id?: string;
  trip_id?: string | null;
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
}

interface FlightFormProps {
  flight?: Flight | null;
  onSubmit: (data: Partial<Flight>) => void | Promise<void>;
  onCancel: () => void;
  selectedTripId?: string | null;
}

const FlightForm: React.FC<FlightFormProps> = ({ flight, onSubmit, onCancel, selectedTripId }) => {
  const { data: trips } = useTrips();
  const [formData, setFormData] = useState<Partial<Flight>>({
    traveler_name: flight?.traveler_name || '',
    airline: flight?.airline || '',
    flight_number: flight?.flight_number || '',
    confirmation_number: flight?.confirmation_number || '',
    departure_airport: flight?.departure_airport || '',
    departure_city: flight?.departure_city || '',
    arrival_airport: flight?.arrival_airport || '',
    arrival_city: flight?.arrival_city || '',
    departure_date: flight?.departure_date || '',
    departure_time: flight?.departure_time || '',
    arrival_date: flight?.arrival_date || '',
    arrival_time: flight?.arrival_time || '',
    seat_number: flight?.seat_number || '',
    class: flight?.class || 'Economy',
    cost: flight?.cost || 0,
    booking_reference: flight?.booking_reference || '',
    status: flight?.status || 'Confirmed',
    notes: flight?.notes || '',
    trip_id: flight?.trip_id || selectedTripId || null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User size={20} />
          Traveler Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Traveler Name *
            </label>
            <input
              type="text"
              required
              value={formData.traveler_name}
              onChange={(e) => setFormData({ ...formData, traveler_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assign to Trip
            </label>
            <select
              value={formData.trip_id || ''}
              onChange={(e) => setFormData({ ...formData, trip_id: e.target.value || null })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="">No Trip (Unassigned)</option>
              {trips.map((trip: any) => (
                <option key={trip.id} value={trip.id}>
                  {trip.trip_name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Link this flight to a specific trip</p>
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Plane size={20} />
          Flight Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Airline *
            </label>
            <input
              type="text"
              required
              value={formData.airline}
              onChange={(e) => setFormData({ ...formData, airline: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Thai Airways"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Flight Number
            </label>
            <input
              type="text"
              value={formData.flight_number}
              onChange={(e) => setFormData({ ...formData, flight_number: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="TG123"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <CreditCard size={14} className="inline mr-1" />
              Confirmation Number
            </label>
            <input
              type="text"
              value={formData.confirmation_number}
              onChange={(e) => setFormData({ ...formData, confirmation_number: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="ABC123"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Booking Reference
            </label>
            <input
              type="text"
              value={formData.booking_reference}
              onChange={(e) => setFormData({ ...formData, booking_reference: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="REF12345"
            />
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin size={20} />
          Departure
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Airport Code *
            </label>
            <input
              type="text"
              required
              value={formData.departure_airport}
              onChange={(e) => setFormData({ ...formData, departure_airport: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="BKK"
              maxLength={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              value={formData.departure_city}
              onChange={(e) => setFormData({ ...formData, departure_city: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Bangkok"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar size={14} className="inline mr-1" />
              Date *
            </label>
            <input
              type="date"
              required
              value={formData.departure_date}
              onChange={(e) => setFormData({ ...formData, departure_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Clock size={14} className="inline mr-1" />
              Time
            </label>
            <input
              type="time"
              value={formData.departure_time}
              onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin size={20} />
          Arrival
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Airport Code *
            </label>
            <input
              type="text"
              required
              value={formData.arrival_airport}
              onChange={(e) => setFormData({ ...formData, arrival_airport: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="LAX"
              maxLength={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              value={formData.arrival_city}
              onChange={(e) => setFormData({ ...formData, arrival_city: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Los Angeles"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar size={14} className="inline mr-1" />
              Date *
            </label>
            <input
              type="date"
              required
              value={formData.arrival_date}
              onChange={(e) => setFormData({ ...formData, arrival_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Clock size={14} className="inline mr-1" />
              Time
            </label>
            <input
              type="time"
              value={formData.arrival_time}
              onChange={(e) => setFormData({ ...formData, arrival_time: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Booking Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Seat Number
            </label>
            <input
              type="text"
              value={formData.seat_number}
              onChange={(e) => setFormData({ ...formData, seat_number: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="12A"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class
            </label>
            <select
              value={formData.class}
              onChange={(e) => setFormData({ ...formData, class: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="Economy">Economy</option>
              <option value="Premium Economy">Premium Economy</option>
              <option value="Business">Business</option>
              <option value="First">First Class</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <DollarSign size={14} className="inline mr-1" />
              Cost (USD)
            </label>
            <input
              type="number"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="1200"
            />
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
              <option value="Confirmed">Confirmed</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Special requests, meal preferences, etc."
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t sticky bottom-0 bg-white">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          {flight ? 'Update Flight' : 'Add Flight'}
        </button>
      </div>
    </form>
  );
};

export default FlightForm;
