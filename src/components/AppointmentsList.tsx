import React, { useState } from 'react';
import { Appointment, Supplier, BusinessContact, ItineraryItem } from '../types';
import { format, parseISO, isToday, isTomorrow } from 'date-fns';
import { Plus, Clock, MapPin, Users, Edit, Trash2, Bell, Plane, Hotel, Car, Building2 } from 'lucide-react';
import AddAppointmentModal from './AddAppointmentModal';
import { useAppointments } from '../hooks/useSupabase';

interface AppointmentsListProps {
  appointments: Appointment[];
  onAppointmentsChange: (appointments: Appointment[]) => void;
  suppliers: Supplier[];
  contacts: BusinessContact[];
  selectedDate: Date;
  itinerary: ItineraryItem[];
}

const AppointmentsList: React.FC<AppointmentsListProps> = ({ 
  appointments: propAppointments, 
  onAppointmentsChange: propOnAppointmentsChange, 
  suppliers, 
  contacts, 
  selectedDate,
  itinerary
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  
  // Use Supabase backend for all data operations
  const { data: appointments, loading, insert, update, remove, refetch } = useAppointments();

  const onAppointmentsChange = (newAppointments: Appointment[]) => {
    // Keep compatibility with parent component
    propOnAppointmentsChange(newAppointments);
  };

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const filteredAppointments = appointments.filter(apt => apt.start_date === selectedDateStr);
  const selectedDateItinerary = itinerary.filter(item => item.startDate === selectedDateStr);

  const getItineraryIcon = (type: string) => {
    switch (type) {
      case 'Flight': return <Plane size={14} className="text-blue-500" />;
      case 'Hotel': return <Hotel size={14} className="text-indigo-500" />;
      case 'Taxi': return <Car size={14} className="text-yellow-500" />;
      case 'TradeShow': return <Building2 size={14} className="text-green-500" />;
      case 'BusinessVisit': return <Building2 size={14} className="text-purple-500" />;
      default: return <MapPin size={14} className="text-gray-500" />;
    }
  };
  const deleteAppointment = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await remove(id);
        onAppointmentsChange(appointments.filter(apt => apt.id !== id));
      } catch (error) {
        console.error('Error deleting appointment:', error);
        alert('Failed to delete appointment. Please try again.');
      }
    }
  };

  const handleSaveAppointment = async (appointment: Appointment) => {
    if (editingAppointment) {
      try {
        await update(appointment.id, appointment);
      } catch (error) {
        console.error('Error updating appointment:', error);
        alert('Failed to update appointment. Please try again.');
      }
      setEditingAppointment(null);
    } else {
      try {
        await insert(appointment);
      } catch (error) {
        console.error('Error creating appointment:', error);
        alert('Failed to create appointment. Please try again.');
      }
    }
    setShowAddModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'bg-green-100 text-green-800';
      case 'Scheduled': return 'bg-blue-100 text-blue-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      case 'Completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Meeting': return 'bg-blue-100 text-blue-800';
      case 'Call': return 'bg-green-100 text-green-800';
      case 'Factory Visit': return 'bg-purple-100 text-purple-800';
      case 'Supplier Meeting': return 'bg-yellow-100 text-yellow-800';
      case 'Conference': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Schedule - {format(selectedDate, 'MMM dd')}
        </h3>
        <button
          onClick={() => {
            setEditingAppointment(null);
            setShowAddModal(true);
          }}
          className="flex items-center text-primary hover:text-primary/80 text-sm"
        >
          <Plus size={16} className="mr-1" />
          Add Appointment
        </button>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {(filteredAppointments.length > 0 || selectedDateItinerary.length > 0) ? (
          <div className="space-y-3">
            {/* Travel/Itinerary Items */}
            {selectedDateItinerary
              .sort((a, b) => (a.departureTime || a.checkInTime || '00:00').localeCompare(b.departureTime || b.checkInTime || '00:00'))
              .map(item => (
              <div key={`itinerary-${item.id}`} className="border border-green-200 rounded-lg p-4 bg-green-50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getItineraryIcon(item.type)}
                      <h4 className="font-medium text-gray-900">{item.title}</h4>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        {item.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      {(item.departureTime || item.checkInTime) && (
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {item.departureTime || item.checkInTime}
                        </span>
                      )}
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        item.confirmed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.confirmed ? 'Confirmed' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <MapPin size={14} />
                  {item.location}
                </div>
              </div>
            ))}

            {/* Appointments */}
            {filteredAppointments
              .sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''))
              .map(appointment => (
              <div
                key={`appointment-${appointment.id}`}
                className="border border-blue-200 rounded-lg p-4 bg-blue-50 hover:border-blue-300 transition-colors"
              >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">{appointment.title}</h4>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {appointment.start_time}
                      {appointment.end_time && ` - ${appointment.end_time}`}
                    </span>
                    {appointment.reminder && (
                      <span className="flex items-center gap-1">
                        <Bell size={14} />
                        {appointment.reminder}min
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setEditingAppointment(appointment);
                      setShowAddModal(true);
                    }}
                    className="p-1 text-gray-400 hover:text-blue-600"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => deleteAppointment(appointment.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {appointment.description && (
                <p className="text-sm text-gray-600 mb-2">{appointment.description}</p>
              )}

              {appointment.location && (
                <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                  <MapPin size={14} />
                  {appointment.location}
                </div>
              )}

              {appointment.attendees && appointment.attendees.length > 0 && (
                <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                  <Users size={14} />
                  {appointment.attendees.join(', ')}
                </div>
              )}

              <div className="flex items-center gap-2 mt-3">
                <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(appointment.type)}`}>
                  {appointment.type}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(appointment.status)}`}>
                  {appointment.status}
                </span>
              </div>

              {appointment.notes && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600">
                  <strong>Notes:</strong> {appointment.notes}
                </div>
              )}
            </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No events scheduled for this date.</p>
            <button
              onClick={() => {
                setEditingAppointment(null);
                setShowAddModal(true);
              }}
              className="mt-2 text-primary hover:text-primary/80 text-sm"
            >
              Schedule your first appointment
            </button>
          </div>
        )}
      </div>

      {showAddModal && (
        <AddAppointmentModal
          onClose={() => {
            setShowAddModal(false);
            setEditingAppointment(null);
          }}
          onSave={handleSaveAppointment}
          editAppointment={editingAppointment}
          suppliers={suppliers}
          contacts={contacts}
          selectedDate={selectedDate}
        />
      )}
    </div>
  );
};

export default AppointmentsList;