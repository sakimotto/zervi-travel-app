import React, { useState, useEffect } from 'react';
import { Appointment, Supplier, BusinessContact } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { X, Plus, Trash2 } from 'lucide-react';
import TravelerSelector from './TravelerSelector';

interface AddAppointmentModalProps {
  onClose: () => void;
  onSave: (appointment: Appointment) => void;
  editAppointment: Appointment | null;
  suppliers: Supplier[];
  contacts: BusinessContact[];
  selectedDate: Date;
}

const AddAppointmentModal: React.FC<AddAppointmentModalProps> = ({ 
  onClose, 
  onSave, 
  editAppointment, 
  suppliers, 
  contacts, 
  selectedDate 
}) => {
  const [formData, setFormData] = useState<Appointment>({
    id: '',
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    start_time: '',
    end_time: '',
    location: '',
    attendees: [''],
    type: 'Meeting',
    status: 'Scheduled',
    reminder: 15,
    notes: '',
    assigned_to: 'Both',
  });

  const [attendees, setAttendees] = useState<string[]>(['']);

  useEffect(() => {
    if (editAppointment) {
      setFormData(editAppointment);
      setAttendees(editAppointment.attendees || ['']);
    } else {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      setFormData({
        id: uuidv4(),
        title: '',
        description: '',
        start_date: dateStr,
        end_date: dateStr,
        start_time: '09:00',
        end_time: '10:00',
        location: '',
        attendees: [''],
        type: 'Meeting',
        status: 'Scheduled',
        reminder: 15,
        notes: '',
        assigned_to: 'Both',
      });
      setAttendees(['']);
    }
  }, [editAppointment, selectedDate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAttendeeChange = (index: number, value: string) => {
    const newAttendees = [...attendees];
    newAttendees[index] = value;
    setAttendees(newAttendees);
  };

  const addAttendee = () => {
    setAttendees([...attendees, '']);
  };

  const removeAttendee = (index: number) => {
    if (attendees.length > 1) {
      const newAttendees = [...attendees];
      newAttendees.splice(index, 1);
      setAttendees(newAttendees);
    }
  };

  const handleSupplierSelect = (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    if (supplier) {
      setFormData(prev => ({
        ...prev,
        title: `Meeting with ${supplier.company_name}`,
        location: `${supplier.address}, ${supplier.city}`,
        type: 'Supplier Meeting',
        supplier_id: supplier.id,
      }));
      
      // Add supplier contact to attendees if not already there
      if (!attendees.includes(supplier.contact_person)) {
        setAttendees([...attendees.filter(a => a), supplier.contact_person]);
      }
    }
  };

  const handleContactSelect = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    if (contact) {
      setFormData(prev => ({
        ...prev,
        title: `Meeting with ${contact.name}`,
        location: `${contact.company}, ${contact.city}`,
        contact_id: contact.id,
      }));
      
      // Add contact to attendees if not already there
      if (!attendees.includes(contact.name)) {
        setAttendees([...attendees.filter(a => a), contact.name]);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const filteredAttendees = attendees.filter(attendee => attendee.trim() !== '');
    
    // Ensure all required fields have proper values
    const appointmentData = {
      ...formData,
      id: formData.id || uuidv4(),
      attendees: filteredAttendees,
      description: formData.description || '',
      location: formData.location || '',
      notes: formData.notes || '',
      reminder: formData.reminder || 15,
      end_date: formData.end_date || formData.start_date,
    };
    
    logger.debug('Submitting appointment data:', appointmentData);
    onSave(appointmentData);
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-semibold text-gray-900">
            {editAppointment ? 'Edit Appointment' : 'Add New Appointment'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Quick Select Options */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Select</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Select Supplier</label>
                <select
                  onChange={(e) => e.target.value && handleSupplierSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  value=""
                >
                  <option value="">Choose a supplier...</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.company_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Select Contact</label>
                <select
                  onChange={(e) => e.target.value && handleContactSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  value=""
                >
                  <option value="">Choose a contact...</option>
                  {contacts.map(contact => (
                    <option key={contact.id} value={contact.id}>
                      {contact.name} - {contact.company}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Meeting title"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={2}
              placeholder="Meeting description"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
               name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
               name="end_date"
                value={formData.end_date || formData.start_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time *
              </label>
              <input
                type="time"
               name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <input
                type="time"
               name="end_time"
                value={formData.end_time || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Meeting location"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Attendees
            </label>
            {attendees.map((attendee, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={attendee}
                  onChange={(e) => handleAttendeeChange(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Attendee name"
                />
                <button
                  type="button"
                  onClick={() => removeAttendee(index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                  disabled={attendees.length <= 1}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addAttendee}
              className="mt-2 flex items-center text-secondary hover:text-primary"
            >
              <Plus size={18} className="mr-1" /> Add Attendee
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="Meeting">Meeting</option>
                <option value="Call">Call</option>
                <option value="Factory Visit">Factory Visit</option>
                <option value="Supplier Meeting">Supplier Meeting</option>
                <option value="Conference">Conference</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="Scheduled">Scheduled</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reminder (minutes)
              </label>
              <input
                type="number"
                name="reminder"
                value={formData.reminder || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="0"
                placeholder="15"
              />
            </div>

            <div>
              <TravelerSelector
                value={formData.assigned_to || 'Both'}
                onChange={(value) => setFormData(prev => ({ ...prev, assigned_to: value }))}
                label="Assigned To"
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={3}
              placeholder="Additional notes"
            />
          </div>

          <div className="flex justify-end space-x-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/90"
            >
              {editAppointment ? 'Update Appointment' : 'Add Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAppointmentModal;