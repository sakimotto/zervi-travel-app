import React, { useState, useEffect } from 'react';
import { ItineraryItem, ItineraryItemType, Traveler } from '../types';
import { sampleItinerary } from '../data/itinerary';
import { getActiveTravelerNames } from '../data/travelers';
import { format, parseISO, isAfter, addHours, startOfDay } from 'date-fns';
import { 
  Plane, Hotel, Car, Briefcase, Building, Plus, Calendar, MapPin, 
  Clock, CheckCircle, XCircle, Edit, Trash2, User, Filter, Download, Upload, Database, AlertCircle,
  LandPlot, Train, Bus, List, LayoutList, Calendar as CalendarIcon, Save, X, Users
} from 'lucide-react';
import AddItineraryItem from './AddItineraryItem';
import PrintButton from './PrintButton';
import ItinerarySummary from './ItinerarySummary';
import { useItineraryItems } from '../hooks/useSupabase';
import { 
  saveItineraryToLocalStorage, 
  getItineraryFromLocalStorage, 
  clearItineraryFromLocalStorage,
  saveAsDefaultSampleData
} from '../utils/localStorage';
import { saveAs } from 'file-saver';
import { getDestinationsFromLocalStorage } from '../utils/localStorage';
import { exportToWord } from '../utils/wordExport';

const ItinerarySection: React.FC = () => {
  // Use Supabase backend for all data operations
  const { data: itinerary, loading, insert, update, remove, refetch } = useItineraryItems();
  
  // Fallback to sample data if Supabase is empty (for first-time users)
  const [localItinerary, setLocalItinerary] = useState<ItineraryItem[]>(sampleItinerary);
  
  // Use Supabase data if available, otherwise use sample data
  const displayItinerary = itinerary.length > 0 ? itinerary : localItinerary;
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterType, setFilterType] = useState<ItineraryItemType | 'All'>('All');
  const [filterTraveler, setFilterTraveler] = useState<Traveler | 'All'>('All');
  const [editingItem, setEditingItem] = useState<ItineraryItem | null>(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'full' | 'summary'>('full');
  const [showSaveDefaultConfirm, setShowSaveDefaultConfirm] = useState(false);

  // Get dynamic traveler list
  const [travelerOptions, setTravelerOptions] = useState<string[]>(['All']);

  useEffect(() => {
    const activeTravelers = getActiveTravelerNames();
    setTravelerOptions(['All', ...activeTravelers]);
  }, []);

  // Load sample data into Supabase if database is empty
  useEffect(() => {
    const loadSampleDataIfEmpty = async () => {
      if (!loading && itinerary.length === 0) {
        try {
          console.log('Loading sample itinerary data into Supabase...');
          for (const item of sampleItinerary) {
            await insert(item);
          }
          await refetch();
        } catch (error) {
          console.error('Error loading sample data:', error);
          // If Supabase fails, use local data
          setLocalItinerary(sampleItinerary);
        }
      }
    };
    
    loadSampleDataIfEmpty();
  }, [loading, itinerary.length]);

  const getTypeIcon = (type: ItineraryItemType, size = 20) => {
    switch (type) {
      case 'Flight':
        return <Plane size={size} className="text-blue-500" />;
      case 'Hotel':
        return <Hotel size={size} className="text-indigo-500" />;
      case 'Taxi':
        return <Car size={size} className="text-yellow-500" />;
      case 'Train':
        return <Train size={size} className="text-amber-500" />;
      case 'Bus':
        return <Bus size={size} className="text-lime-500" />;
      case 'TradeShow':
        return <Briefcase size={size} className="text-green-500" />;
      case 'BusinessVisit':
        return <Building size={size} className="text-purple-500" />;
      case 'Meeting':
        return <Users size={size} className="text-teal-500" />;
      case 'Conference':
        return <Briefcase size={size} className="text-orange-500" />;
      case 'Factory Visit':
        return <Building size={size} className="text-gray-500" />;
      case 'Sightseeing':
        return <LandPlot size={size} className="text-emerald-500" />;
      default:
        return <Calendar size={size} className="text-gray-500" />;
    }
  };

  const getAssigneeColor = (assignedTo: Traveler) => {
    switch (assignedTo) {
      case 'Archie':
        return 'bg-blue-100 text-blue-800';
      case 'Yok':
        return 'bg-green-100 text-green-800';
      case 'Both':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddItem = async (newItem: ItineraryItem) => {
    if (editingItem) {
      try {
        await update(newItem.id, newItem);
      } catch (error) {
        console.error('Error updating itinerary item:', error);
        alert('Failed to update itinerary item. Please try again.');
      }
      setEditingItem(null);
    } else {
      try {
        await insert(newItem);
      } catch (error) {
        console.error('Error creating itinerary item:', error);
        alert('Failed to create itinerary item. Please try again.');
      }
    }
    setShowAddModal(false);
  };

  const handleEditItem = (item: ItineraryItem) => {
    setEditingItem(item);
    setShowAddModal(true);
  };

  const handleDeleteItem = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await remove(id);
      } catch (error) {
        console.error('Error deleting itinerary item:', error);
        alert('Failed to delete itinerary item. Please try again.');
      }
    }
  };

  const toggleConfirmation = async (id: string) => {
    const item = itinerary.find(i => i.id === id);
    if (item) {
      try {
        const updatedItem = { ...item, confirmed: !item.confirmed };
        await update(id, updatedItem);
      } catch (error) {
        console.error('Error updating confirmation status:', error);
        alert('Failed to update confirmation status. Please try again.');
      }
    }
  };

  const exportItinerary = () => {
    const dataStr = JSON.stringify(itinerary, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    saveAs(blob, `zervi-travel-itinerary-${new Date().toISOString().split('T')[0]}.json`);
  };

  const exportToWordDocument = () => {
    // Get data from other sections (you might want to pass these as props or use context)
    const suppliers: any[] = []; // This would come from suppliers section
    const contacts: any[] = []; // This would come from contacts section  
    const expenses: any[] = []; // This would come from expenses section
    
    exportToWord(itinerary, suppliers, contacts, expenses);
  };

  const importItinerary = (event: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const parsedData = JSON.parse(content);
        
        // Basic validation that the imported data is an array of itinerary items
        if (!Array.isArray(parsedData)) {
          throw new Error('Imported file does not contain a valid itinerary array');
        }

        // Check if at least one item has the expected properties
        if (parsedData.length > 0) {
          const firstItem = parsedData[0];
          if (!firstItem.id || !firstItem.type || !firstItem.title) {
            throw new Error('Imported itinerary is missing required fields');
          }
        }

        if (window.confirm(`Are you sure you want to import this itinerary? This will replace your current itinerary.`)) {
          // Clear existing data and insert new items
          for (const existingItem of itinerary) {
            await remove(existingItem.id);
          }
          for (const newItem of parsedData) {
            await insert(newItem);
          }
          await refetch();
        }
      } catch (error) {
        console.error('Error importing itinerary:', error);
        setImportError('The selected file is not a valid itinerary export. Please select a correctly formatted JSON file.');
      }
    };
    reader.readAsText(file);
    
    // Reset the input so the same file can be selected again
    event.target.value = '';
  };

  const resetToSampleData = () => {
    // Clear existing data and insert sample data
    Promise.all([
      ...itinerary.map(item => remove(item.id)),
      ...sampleItinerary.map(item => insert(item))
    ]).then(() => {
      refetch();
    }).catch(error => {
      console.error('Error resetting to sample data:', error);
      alert('Failed to reset data. Please try again.');
    });
    setShowConfirmReset(false);
  };

  const handleSaveAsDefault = () => {
    setShowSaveDefaultConfirm(true);
  };

  const confirmSaveAsDefault = () => {
    const currentDestinations = getDestinationsFromLocalStorage() || [];
    saveAsDefaultSampleData(currentDestinations, itinerary);
    setShowSaveDefaultConfirm(false);
  };

  const filteredItinerary = displayItinerary.filter(item => {
    const matchesType = filterType === 'All' || item.type === filterType;
    const matchesTraveler = filterTraveler === 'All' || 
                           item.assignedTo === filterTraveler || 
                           (filterTraveler === 'Both' && item.assignedTo === 'Both');
    return matchesType && matchesTraveler;
  });

  // Sort by date
  const sortedItinerary = [...filteredItinerary].sort((a, b) => {
    return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
  });

  return (
    <section id="itinerary" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-primary font-montserrat mb-3">
            Travel Itinerary
          </h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Manage your business trip details, including flights, accommodations, meetings, transportation, and sightseeing
          </p>
        </div>

        <div className="mb-8 flex flex-wrap gap-4 justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('full')}
                className={`px-3 py-1.5 rounded-md flex items-center ${
                  viewMode === 'full' 
                    ? 'bg-white shadow-sm text-primary' 
                    : 'text-gray-700 hover:text-primary'
                }`}
              >
                <LayoutList size={18} className="mr-1.5" />
                <span>Full View</span>
              </button>
              <button
                onClick={() => setViewMode('summary')}
                className={`px-3 py-1.5 rounded-md flex items-center ${
                  viewMode === 'summary' 
                    ? 'bg-white shadow-sm text-primary' 
                    : 'text-gray-700 hover:text-primary'
                }`}
              >
                <List size={18} className="mr-1.5" />
                <span>Summary</span>
              </button>
            </div>

            {viewMode === 'full' && (
              <div className="flex flex-wrap items-center gap-2 ml-1">
                <Filter size={20} className="text-gray-500" />
                <span className="text-gray-700">Filter by:</span>
                
                <select 
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as ItineraryItemType | 'All')}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="All">All Types</option>
                  <option value="Flight">Flights</option>
                  <option value="Hotel">Hotels</option>
                  <option value="Taxi">Taxi</option>
                  <option value="Train">Fast Train</option>
                  <option value="Bus">Bus</option>
                  <option value="TradeShow">Trade Shows</option>
                  <option value="BusinessVisit">Business Visits</option>
                  <option value="Meeting">Meetings</option>
                  <option value="Conference">Conferences</option>
                  <option value="Factory Visit">Factory Visits</option>
                  <option value="Sightseeing">Sightseeing</option>
                  <option value="Other">Other</option>
                </select>
                
                <select 
                  value={filterTraveler}
                  onChange={(e) => setFilterTraveler(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  {travelerOptions.map(traveler => (
                    <option key={traveler} value={traveler}>
                      {traveler === 'All' ? 'All Travelers' : traveler}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setEditingItem(null);
                setShowAddModal(true);
              }}
              className="flex items-center bg-secondary hover:bg-secondary/90 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={20} className="mr-2" />
              Add Item
            </button>
            
            <div className="flex items-center gap-2">
              <button
                onClick={exportItinerary}
                className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-lg transition-colors"
                title="Export itinerary"
              >
                <Download size={18} className="mr-1" />
                <span className="hidden sm:inline">Export</span>
              </button>
              
              <button
                onClick={exportToWordDocument}
                className="flex items-center bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-2 rounded-lg transition-colors"
                title="Export as Word document"
              >
                <Download size={18} className="mr-1" />
                <span className="hidden sm:inline">Word</span>
              </button>
              
              <label className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-lg transition-colors cursor-pointer">
                <Upload size={18} className="mr-1" />
                <span className="hidden sm:inline">Import</span>
                <input 
                  type="file" 
                  accept=".json" 
                  onChange={importItinerary} 
                  className="hidden" 
                />
              </label>
              
              <PrintButton 
                itinerary={sortedItinerary} 
              />
              
              <button
                onClick={handleSaveAsDefault}
                className="flex items-center bg-primary hover:bg-primary/90 text-white px-3 py-2 rounded-lg transition-colors"
                title="Save as default data"
              >
                <Save size={18} className="mr-1" />
                <span className="hidden sm:inline">Save as Default</span>
              </button>
              
              <button
                onClick={() => setShowConfirmReset(true)}
                className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-lg transition-colors"
                title="Reset to sample data"
              >
                <Database size={18} className="mr-1" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
          </div>
        </div>

        {importError && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-6 flex items-start">
            <AlertCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Import Error</p>
              <p className="text-sm">{importError}</p>
            </div>
            <button 
              className="ml-auto text-red-600 hover:text-red-800"
              onClick={() => setImportError(null)}
            >
              <X size={20} />
            </button>
          </div>
        )}

        {viewMode === 'summary' ? (
          <ItinerarySummary 
            itinerary={itinerary} 
            onEditItem={handleEditItem}
          />
        ) : (
          sortedItinerary.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-lg text-gray-600 mb-4">No itinerary items found.</p>
              <button 
                onClick={() => {
                  setFilterType('All');
                  setFilterTraveler('All');
                }}
                className="text-secondary hover:text-primary font-semibold"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedItinerary.map((item) => (
                <div 
                  key={item.id} 
                  className={`border rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md ${
                    item.confirmed ? 'border-green-200' : 'border-yellow-200'
                  }`}
                >
                  <div className="flex items-center justify-between bg-gray-50 px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-full bg-gray-100">
                        {getTypeIcon(item.type)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                        <p className="text-sm text-gray-600">{item.type}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs ${getAssigneeColor(item.assignedTo)}`}>
                        {item.assignedTo}
                      </span>
                      
                      <button 
                        onClick={() => toggleConfirmation(item.id)}
                        className="p-1 rounded-full hover:bg-gray-200"
                        aria-label={item.confirmed ? "Mark as unconfirmed" : "Mark as confirmed"}
                      >
                        {item.confirmed ? (
                          <CheckCircle size={20} className="text-green-500" />
                        ) : (
                          <XCircle size={20} className="text-yellow-500" />
                        )}
                      </button>
                      
                      <button 
                        onClick={() => handleEditItem(item)}
                        className="p-1 rounded-full hover:bg-gray-200"
                        aria-label="Edit item"
                      >
                        <Edit size={20} className="text-blue-500" />
                      </button>
                      
                      <button 
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1 rounded-full hover:bg-gray-200"
                        aria-label="Delete item"
                      >
                        <Trash2 size={20} className="text-red-500" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-start">
                        <Calendar size={18} className="text-gray-500 mt-1 mr-2" />
                        <div>
                          <p className="text-sm text-gray-500">Date</p>
                          <p className="font-medium">
                            {format(parseISO(item.start_date), 'MMM dd, yyyy')}
                            {item.end_date && (
                              <> — {format(parseISO(item.end_date), 'MMM dd, yyyy')}</>
                            )}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <MapPin size={18} className="text-gray-500 mt-1 mr-2" />
                        <div>
                          <p className="text-sm text-gray-500">Location</p>
                          <p className="font-medium">{item.location}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <User size={18} className="text-gray-500 mt-1 mr-2" />
                        <div>
                          <p className="text-sm text-gray-500">Status</p>
                          <p className={`font-medium ${item.confirmed ? 'text-green-600' : 'text-yellow-600'}`}>
                            {item.confirmed ? 'Confirmed' : 'Unconfirmed'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-4">{item.description}</p>
                    
                    {/* Type-specific details */}
                    {item.type === 'Flight' && item.flightNumber && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="font-semibold text-blue-800 mb-2">Flight Details</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-blue-700">Airline & Flight</p>
                            <p className="font-medium">{item.airline} {item.flightNumber}</p>
                          </div>
                          <div>
                            <p className="text-sm text-blue-700">Times</p>
                            <p className="font-medium">
                              Departs: {item.departureTime} • Arrives: {item.arrivalTime}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {item.type === 'Hotel' && item.hotelName && (
                      <div className="bg-indigo-50 p-4 rounded-lg">
                        <p className="font-semibold text-indigo-800 mb-2">Hotel Details</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-indigo-700">Hotel & Room</p>
                            <p className="font-medium">{item.hotelName}: {item.roomType}</p>
                          </div>
                          <div>
                            <p className="text-sm text-indigo-700">Times</p>
                            <p className="font-medium">
                              Check-in: {item.checkInTime} • Check-out: {item.checkOutTime}
                            </p>
                          </div>
                        </div>
                        {item.end_date && (
                          <div className="mt-2">
                            <p className="text-sm text-indigo-700">Until: {format(parseISO(item.end_date), 'MMM d')}</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {item.type === 'BusinessVisit' && item.contactName && (
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="font-semibold text-purple-800 mb-2">Contact Details</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-purple-700">Contact Person</p>
                            <p className="font-medium">{item.contactName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-purple-700">Company</p>
                            <p className="font-medium">{item.companyName}</p>
                          </div>
                          {item.contactPhone && (
                            <div>
                              <p className="text-sm text-purple-700">Phone</p>
                              <p className="font-medium">{item.contactPhone}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {item.type === 'Meeting' && (
                      <div className="bg-teal-50 p-4 rounded-lg">
                        <p className="font-semibold text-teal-800 mb-2">Meeting Details</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {item.meetingRoom && (
                            <div>
                              <p className="text-sm text-teal-700">Meeting Room</p>
                              <p className="font-medium">{item.meetingRoom}</p>
                            </div>
                          )}
                          {item.meetingType && (
                            <div>
                              <p className="text-sm text-teal-700">Type</p>
                              <p className="font-medium">{item.meetingType}</p>
                            </div>
                          )}
                          {item.agenda && (
                            <div className="md:col-span-2">
                              <p className="text-sm text-teal-700">Agenda</p>
                              <p className="font-medium">{item.agenda}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {item.type === 'Conference' && (
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <p className="font-semibold text-orange-800 mb-2">Conference Details</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {item.conferenceHall && (
                            <div>
                              <p className="text-sm text-orange-700">Conference Hall</p>
                              <p className="font-medium">{item.conferenceHall}</p>
                            </div>
                          )}
                          {item.registrationRequired !== undefined && (
                            <div>
                              <p className="text-sm text-orange-700">Registration</p>
                              <p className="font-medium">{item.registrationRequired ? 'Required' : 'Not Required'}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {item.type === 'Factory Visit' && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="font-semibold text-gray-800 mb-2">Factory Visit Details</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {item.factoryType && (
                            <div>
                              <p className="text-sm text-gray-700">Factory Type</p>
                              <p className="font-medium">{item.factoryType}</p>
                            </div>
                          )}
                          {item.safetyRequirements && (
                            <div>
                              <p className="text-sm text-gray-700">Safety Requirements</p>
                              <p className="font-medium">{item.safetyRequirements}</p>
                            </div>
                          )}
                          {item.tourGuideRequired !== undefined && (
                            <div>
                              <p className="text-sm text-gray-700">Tour Guide</p>
                              <p className="font-medium">{item.tourGuideRequired ? 'Required' : 'Not Required'}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {item.type === 'Sightseeing' && (
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="font-semibold text-green-800 mb-2">Sightseeing Details</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {item.entranceFee && (
                            <div>
                              <p className="text-sm text-green-700">Entrance Fee</p>
                              <p className="font-medium">{item.entranceFee}</p>
                            </div>
                          )}
                          {item.openingHours && (
                            <div>
                              <p className="text-sm text-green-700">Opening Hours</p>
                              <p className="font-medium">{item.openingHours}</p>
                            </div>
                          )}
                          {item.tourDuration && (
                            <div>
                              <p className="text-sm text-green-700">Tour Duration</p>
                              <p className="font-medium">{item.tourDuration}</p>
                            </div>
                          )}
                          {item.tourGuide && (
                            <div>
                              <p className="text-sm text-green-700">Tour Guide</p>
                              <p className="font-medium">{item.tourGuide}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {item.type === 'Train' && (
                      <div className="bg-amber-50 p-4 rounded-lg">
                        <p className="font-semibold text-amber-800 mb-2">Fast Train Details</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {item.trainNumber && (
                            <div>
                              <p className="text-sm text-amber-700">Train Number</p>
                              <p className="font-medium">{item.trainNumber}</p>
                            </div>
                          )}
                          {item.trainClass && (
                            <div>
                              <p className="text-sm text-amber-700">Class</p>
                              <p className="font-medium">{item.trainClass}</p>
                            </div>
                          )}
                          {(item.departureTime || item.arrivalTime) && (
                            <div>
                              <p className="text-sm text-amber-700">Times</p>
                              <p className="font-medium">
                                {item.departureTime && <>Departs: {item.departureTime}</>}
                                {item.departureTime && item.arrivalTime && <> • </>}
                                {item.arrivalTime && <>Arrives: {item.arrivalTime}</>}
                              </p>
                            </div>
                          )}
                          {item.platform && (
                            <div>
                              <p className="text-sm text-amber-700">Platform</p>
                              <p className="font-medium">{item.platform}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {item.type === 'Bus' && (
                      <div className="bg-lime-50 p-4 rounded-lg">
                        <p className="font-semibold text-lime-800 mb-2">Bus Details</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {item.busNumber && (
                            <div>
                              <p className="text-sm text-lime-700">Bus Number</p>
                              <p className="font-medium">{item.busNumber}</p>
                            </div>
                          )}
                          {item.busCompany && (
                            <div>
                              <p className="text-sm text-lime-700">Bus Company</p>
                              <p className="font-medium">{item.busCompany}</p>
                            </div>
                          )}
                          {(item.departureTime || item.arrivalTime) && (
                            <div>
                              <p className="text-sm text-lime-700">Times</p>
                              <p className="font-medium">
                                {item.departureTime && <>Departs: {item.departureTime}</>}
                                {item.departureTime && item.arrivalTime && <> • </>}
                                {item.arrivalTime && <>Arrives: {item.arrivalTime}</>}
                              </p>
                            </div>
                          )}
                          {item.busStop && (
                            <div>
                              <p className="text-sm text-lime-700">Bus Stop/Station</p>
                              <p className="font-medium">{item.busStop}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {item.notes && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-500 mb-1">Notes:</p>
                        <p className="text-gray-700 italic">{item.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
      
      {showAddModal && (
        <AddItineraryItem 
          onClose={() => {
            setShowAddModal(false);
            setEditingItem(null);
          }}
          onSave={handleAddItem}
          editItem={editingItem}
        />
      )}

      {/* Confirmation modal for resetting to sample data */}
      {showConfirmReset && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Reset Itinerary
              </h3>
              <p className="text-gray-700 mb-6">
                Are you sure you want to reset to the sample itinerary? This will replace all your current itinerary items.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={resetToSampleData}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation modal for saving as default */}
      {showSaveDefaultConfirm && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Save as Default Data
              </h3>
              <p className="text-gray-700 mb-6">
                Are you sure you want to save your current destinations and itinerary as the default sample data? This data will be used as the starting point on all devices.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowSaveDefaultConfirm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSaveAsDefault}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                >
                  Save as Default
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ItinerarySection;