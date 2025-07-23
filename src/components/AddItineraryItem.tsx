import React, { useState, useEffect } from 'react';
import { ItineraryItem, ItineraryItemType, Traveler } from '../types';
import { v4 as uuidv4 } from 'uuid';
import TravelerSelector from './TravelerSelector';
import { 
  X, Plane, Hotel, Car, Briefcase, Building, Calendar, Clock,
  LandPlot, Map, Clock3, Train, Bus
} from 'lucide-react';

interface AddItineraryItemProps {
  onClose: () => void;
  onSave: (item: ItineraryItem) => void;
  editItem: ItineraryItem | null;
}

const AddItineraryItem: React.FC<AddItineraryItemProps> = ({ onClose, onSave, editItem }) => {
  const [formData, setFormData] = useState<ItineraryItem>({
    id: '',
    type: 'Flight',
    title: '',
    description: '',
    start_date: '',
    location: '',
    assigned_to: 'Both',
    confirmed: false,
  });

  useEffect(() => {
    if (editItem) {
      console.log('Loading edit item:', editItem);
      
      // Flatten type_specific_data fields to form level
      const flattenedItem: any = {
        ...editItem,
        // Flatten type_specific_data to top level
        ...(editItem.type_specific_data || {})
      };
      
      console.log('Flattened item for form:', flattenedItem);
      setFormData(flattenedItem);
    } else {
      // Initialize with today's date
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        id: uuidv4(),
        type: 'Flight',
        title: '',
        description: '',
        start_date: today,
        location: '',
        assigned_to: 'Both',
        confirmed: false,
      });
    }
  }, [editItem]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: value,
      // Also update the flattened type-specific fields
      ...(name.startsWith('type_specific_') ? {} : { [name]: value })
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare data exactly matching database schema
    const itemData: any = {
      id: formData.id || uuidv4(),
      type: formData.type,
      title: formData.title,
      description: formData.description,
      start_date: formData.start_date,
      end_date: formData.end_date || null,
      location: formData.location,
      assigned_to: formData.assigned_to,
      confirmed: formData.confirmed,
      notes: formData.notes || null
    };

    // Add time fields - use null for empty values
    itemData.start_time = formData.start_time || null;

    // Collect type-specific data
    const typeSpecificData: any = {};
    
    // Flight fields
    if (formData.airline) typeSpecificData.airline = formData.airline;
    if (formData.flightNumber) typeSpecificData.flightNumber = formData.flightNumber;
    if (formData.departureTime) typeSpecificData.departureTime = formData.departureTime;
    if (formData.arrivalTime) typeSpecificData.arrivalTime = formData.arrivalTime;
    
    // Hotel fields
    if (formData.hotelName) typeSpecificData.hotelName = formData.hotelName;
    if (formData.roomType) typeSpecificData.roomType = formData.roomType;
    if (formData.checkInTime) typeSpecificData.checkInTime = formData.checkInTime;
    if (formData.checkOutTime) typeSpecificData.checkOutTime = formData.checkOutTime;
    
    // Business visit fields
    if (formData.contactName) typeSpecificData.contactName = formData.contactName;
    if (formData.contactPhone) typeSpecificData.contactPhone = formData.contactPhone;
    if (formData.companyName) typeSpecificData.companyName = formData.companyName;
    
    // Train fields
    if (formData.trainNumber) typeSpecificData.trainNumber = formData.trainNumber;
    if (formData.trainClass) typeSpecificData.trainClass = formData.trainClass;
    if (formData.platform) typeSpecificData.platform = formData.platform;
    
    // Bus fields
    if (formData.busNumber) typeSpecificData.busNumber = formData.busNumber;
    if (formData.busCompany) typeSpecificData.busCompany = formData.busCompany;
    if (formData.busStop) typeSpecificData.busStop = formData.busStop;
    
    // Sightseeing fields
    if (formData.entranceFee) typeSpecificData.entranceFee = formData.entranceFee;
    if (formData.openingHours) typeSpecificData.openingHours = formData.openingHours;
    if (formData.tourDuration) typeSpecificData.tourDuration = formData.tourDuration;
    if (formData.tourGuide) typeSpecificData.tourGuide = formData.tourGuide;
    
    // Meeting fields
    if (formData.meetingRoom) typeSpecificData.meetingRoom = formData.meetingRoom;
    if (formData.meetingType) typeSpecificData.meetingType = formData.meetingType;
    if (formData.agenda) typeSpecificData.agenda = formData.agenda;
    
    // Conference fields
    if (formData.conferenceHall) typeSpecificData.conferenceHall = formData.conferenceHall;
    if (formData.registrationRequired !== undefined) typeSpecificData.registrationRequired = formData.registrationRequired;
    
    // Factory visit fields
    if (formData.factoryType) typeSpecificData.factoryType = formData.factoryType;
    if (formData.safetyRequirements) typeSpecificData.safetyRequirements = formData.safetyRequirements;
    if (formData.tourGuideRequired !== undefined) typeSpecificData.tourGuideRequired = formData.tourGuideRequired;
    
    // Always include type_specific_data (empty object if no data)
    itemData.type_specific_data = typeSpecificData;
    
    console.log('Saving itinerary item:', itemData);

    onSave(itemData);
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-semibold text-gray-900">
            {editItem ? 'Edit Itinerary Item' : 'Add New Itinerary Item'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type of Item
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="Flight">Flight</option>
                <option value="Hotel">Hotel</option>
                <option value="Taxi">Taxi</option>
                <option value="Train">Fast Train</option>
                <option value="Bus">Bus</option>
                <option value="TradeShow">Trade Show</option>
                <option value="BusinessVisit">Business Visit</option>
                <option value="Meeting">Meeting</option>
                <option value="Conference">Conference</option>
                <option value="Factory Visit">Factory Visit</option>
                <option value="Sightseeing">Sightseeing</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <TravelerSelector
                value={formData.assigned_to}
               onChange={(value) => setFormData(prev => ({ ...prev, assigned_to: value }))}
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="E.g., Flight to Shanghai, Grand Hotel Stay"
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
              placeholder="Brief description of this itinerary item"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
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
                End Date (if applicable)
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="City, venue, or address"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                name="start_time"
                value={formData.start_time || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., 09:00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time (if applicable)
              </label>
              <input
                type="time"
                name="end_time"
                value={formData.end_time || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., 17:00"
              />
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={2}
              placeholder="Any additional information"
            />
          </div>

          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="confirmed"
                checked={formData.confirmed}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-secondary border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Confirmed</span>
            </label>
          </div>

          {/* Type-specific fields */}
          {formData.type === 'Flight' && (
            <div className="p-4 bg-blue-50 rounded-lg mb-6">
              <h4 className="text-md font-semibold text-blue-800 mb-4 flex items-center">
                <Plane size={18} className="mr-2" /> Flight Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Airline
                  </label>
                  <input
                    type="text"
                    name="airline"
                    value={formData.type_specific_data?.airline || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="E.g., Air China, Cathay Pacific"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Flight Number
                  </label>
                  <input
                    type="text"
                    name="flightNumber"
                    value={formData.type_specific_data?.flightNumber || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="E.g., CA988"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Departure Time
                  </label>
                  <input
                    type="time"
                    name="departureTime"
                    value={formData.type_specific_data?.departureTime || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Arrival Time
                  </label>
                  <input
                    type="time"
                    name="arrivalTime"
                    value={formData.type_specific_data?.arrivalTime || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
          )}

          {formData.type === 'Hotel' && (
            <div className="p-4 bg-indigo-50 rounded-lg mb-6">
              <h4 className="text-md font-semibold text-indigo-800 mb-4 flex items-center">
                <Hotel size={18} className="mr-2" /> Hotel Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hotel Name
                  </label>
                  <input
                    type="text"
                    name="hotelName"
                    value={formData.type_specific_data?.hotelName || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="E.g., Grand Hyatt Beijing"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room Type
                  </label>
                  <input
                    type="text"
                    name="roomType"
                    value={formData.type_specific_data?.roomType || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="E.g., Deluxe Twin, Business Suite"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-in Time
                  </label>
                  <input
                    type="time"
                    name="checkInTime"
                    value={formData.type_specific_data?.checkInTime || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-out Time
                  </label>
                  <input
                    type="time"
                    name="checkOutTime"
                    value={formData.type_specific_data?.checkOutTime || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
          )}

          {formData.type === 'BusinessVisit' && (
            <div className="p-4 bg-purple-50 rounded-lg mb-6">
              <h4 className="text-md font-semibold text-purple-800 mb-4 flex items-center">
                <Building size={18} className="mr-2" /> Business Contact Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    name="contactName"
                    value={formData.type_specific_data?.contactName || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Name of your contact person"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.type_specific_data?.companyName || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Name of the company"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    name="contactPhone"
                    value={formData.type_specific_data?.contactPhone || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Phone number with country code"
                  />
                </div>
              </div>
            </div>
          )}

          {formData.type === 'Sightseeing' && (
            <div className="p-4 bg-green-50 rounded-lg mb-6">
              <h4 className="text-md font-semibold text-green-800 mb-4 flex items-center">
                <LandPlot size={18} className="mr-2" /> Sightseeing Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Entrance Fee
                  </label>
                  <input
                    type="text"
                    name="entranceFee"
                    value={formData.entranceFee || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="E.g., 100 CNY, Free"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Opening Hours
                  </label>
                  <input
                    type="text"
                    name="openingHours"
                    value={formData.openingHours || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="E.g., 9:00-17:00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tour Duration
                  </label>
                  <input
                    type="text"
                    name="tourDuration"
                    value={formData.tourDuration || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="E.g., 2 hours"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tour Guide
                  </label>
                  <input
                    type="text"
                    name="tourGuide"
                    value={formData.tourGuide || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="E.g., Local guide name or 'Self-guided'"
                  />
                </div>
              </div>
            </div>
          )}

          {formData.type === 'Train' && (
            <div className="p-4 bg-amber-50 rounded-lg mb-6">
              <h4 className="text-md font-semibold text-amber-800 mb-4 flex items-center">
                <Train size={18} className="mr-2" /> Fast Train Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Train Number
                  </label>
                  <input
                    type="text"
                    name="trainNumber"
                    value={formData.trainNumber || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="E.g., G101, D301"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class
                  </label>
                  <input
                    type="text"
                    name="trainClass"
                    value={formData.trainClass || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="E.g., First Class, Second Class"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Departure Time
                  </label>
                  <input
                    type="time"
                    name="departureTime"
                    value={formData.departureTime || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Arrival Time
                  </label>
                  <input
                    type="time"
                    name="arrivalTime"
                    value={formData.arrivalTime || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Platform
                  </label>
                  <input
                    type="text"
                    name="platform"
                    value={formData.platform || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="E.g., Platform 5"
                  />
                </div>
              </div>
            </div>
          )}

          {formData.type === 'Bus' && (
            <div className="p-4 bg-lime-50 rounded-lg mb-6">
              <h4 className="text-md font-semibold text-lime-800 mb-4 flex items-center">
                <Bus size={18} className="mr-2" /> Bus Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bus Number
                  </label>
                  <input
                    type="text"
                    name="busNumber"
                    value={formData.busNumber || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="E.g., 301, Express 5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bus Company
                  </label>
                  <input
                    type="text"
                    name="busCompany"
                    value={formData.busCompany || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="E.g., China Express Bus"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Departure Time
                  </label>
                  <input
                    type="time"
                    name="departureTime"
                    value={formData.departureTime || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Arrival Time
                  </label>
                  <input
                    type="time"
                    name="arrivalTime"
                    value={formData.arrivalTime || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bus Stop/Station
                  </label>
                  <input
                    type="text"
                    name="busStop"
                    value={formData.busStop || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="E.g., North Bus Terminal"
                  />
                </div>
              </div>
            </div>
          )}

          {formData.type === 'Meeting' && (
            <div className="p-4 bg-teal-50 rounded-lg mb-6">
              <h4 className="text-md font-semibold text-teal-800 mb-4 flex items-center">
                <Calendar size={18} className="mr-2" /> Meeting Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meeting Room
                  </label>
                  <input
                    type="text"
                    name="meetingRoom"
                    value={formData.meetingRoom || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="E.g., Conference Room A"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meeting Type
                  </label>
                  <select
                    name="meetingType"
                    value={formData.meetingType || 'In-Person'}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="In-Person">In-Person</option>
                    <option value="Virtual">Virtual</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Agenda
                  </label>
                  <textarea
                    name="agenda"
                    value={formData.agenda || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={2}
                    placeholder="Meeting agenda and topics"
                  />
                </div>
              </div>
            </div>
          )}

          {formData.type === 'Conference' && (
            <div className="p-4 bg-orange-50 rounded-lg mb-6">
              <h4 className="text-md font-semibold text-orange-800 mb-4 flex items-center">
                <Briefcase size={18} className="mr-2" /> Conference Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Conference Hall
                  </label>
                  <input
                    type="text"
                    name="conferenceHall"
                    value={formData.conferenceHall || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="E.g., Main Auditorium"
                  />
                </div>
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="registrationRequired"
                      checked={formData.registrationRequired || false}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-secondary border-gray-300 rounded mr-2"
                    />
                    <span className="text-sm text-gray-700">Registration Required</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {formData.type === 'Factory Visit' && (
            <div className="p-4 bg-gray-50 rounded-lg mb-6">
              <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                <Building size={18} className="mr-2" /> Factory Visit Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Factory Type
                  </label>
                  <input
                    type="text"
                    name="factoryType"
                    value={formData.factoryType || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="E.g., Electronics Manufacturing"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Safety Requirements
                  </label>
                  <input
                    type="text"
                    name="safetyRequirements"
                    value={formData.safetyRequirements || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="E.g., Safety shoes, hard hat required"
                  />
                </div>
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="tourGuideRequired"
                      checked={formData.tourGuideRequired || false}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-secondary border-gray-300 rounded mr-2"
                    />
                    <span className="text-sm text-gray-700">Tour Guide Required</span>
                  </label>
                </div>
              </div>
            </div>
          )}

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
              {editItem ? 'Update Item' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItineraryItem;