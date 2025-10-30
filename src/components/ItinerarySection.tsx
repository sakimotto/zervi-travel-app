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
import ItineraryExportButton from './ItineraryExportButton';
import ItinerarySummary from './ItinerarySummary';
import { useItineraryItems, useTrips } from '../hooks/useSupabase';
import { useAuth } from '../hooks/useAuth';
import { logger } from '../utils/logger';
import { 
  saveItineraryToLocalStorage, 
  getItineraryFromLocalStorage, 
  clearItineraryFromLocalStorage,
  saveAsDefaultSampleData
} from '../utils/localStorage';
import { saveAs } from 'file-saver';
import { getDestinationsFromLocalStorage } from '../utils/localStorage';
import { exportToWord } from '../utils/wordExport';
import { useSuppliers, useBusinessContacts, useExpenses } from '../hooks/useSupabase';

const ItinerarySection: React.FC = () => {
  // Get authenticated user
  const { user } = useAuth();

  // Use Supabase backend for all data operations
  const { data: itinerary, loading, insert, update, remove, refetch } = useItineraryItems();
  const { data: trips, insert: insertTrip } = useTrips();
  
  // Fallback to sample data if Supabase is empty (for first-time users)
  const [localItinerary, setLocalItinerary] = useState<ItineraryItem[]>(sampleItinerary);
  
  // Use Supabase data if available, otherwise use sample data
  const displayItinerary = itinerary.length > 0 ? itinerary : localItinerary;
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterType, setFilterType] = useState<ItineraryItemType | 'All'>('All');
  const [filterTraveler, setFilterTraveler] = useState<string>('All');
  const [filterTrip, setFilterTrip] = useState<string>('All');
  const [editingItem, setEditingItem] = useState<ItineraryItem | null>(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'full' | 'summary'>('full');
  const [showSaveDefaultConfirm, setShowSaveDefaultConfirm] = useState(false);
  const [showQuickTripCreate, setShowQuickTripCreate] = useState(false);
  const [quickTripName, setQuickTripName] = useState('');

  // Get related data for comprehensive export
  const { data: suppliers } = useSuppliers();
  const { data: contacts } = useBusinessContacts();
  const { data: expenses } = useExpenses();

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
          logger.debug('Loading sample itinerary data into Supabase...');
          for (const item of sampleItinerary) {
            await insert(item);
          }
          await refetch();
        } catch (error) {
          logger.error('Error loading sample data:', error);
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
        logger.error('Error updating itinerary item:', error);
        alert('Failed to update itinerary item. Please try again.');
      }
      setEditingItem(null);
    } else {
      try {
        // Add the currently selected trip if filtering by a specific trip
        const itemWithTrip = {
          ...newItem,
          trip_id: filterTrip !== 'All' ? filterTrip : null
        };
        await insert(itemWithTrip);
      } catch (error) {
        logger.error('Error creating itinerary item:', error);
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
        logger.error('Error deleting itinerary item:', error);
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
        logger.error('Error updating confirmation status:', error);
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
        logger.error('Error importing itinerary:', error);
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
      logger.error('Error resetting to sample data:', error);
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

  const handleQuickCreateTrip = async () => {
    if (!quickTripName.trim()) {
      alert('Please enter a trip name');
      return;
    }

    if (!user) {
      alert('You must be logged in to create a trip');
      return;
    }

    try {
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);

      const newTrip = {
        trip_name: quickTripName,
        purpose: 'Business',
        destination_city: '',
        destination_country: '',
        start_date: today.toISOString().split('T')[0],
        end_date: nextWeek.toISOString().split('T')[0],
        status: 'Planning',
        budget: 0,
        notes: '',
        user_id: user.id,
      };

      const result = await insertTrip(newTrip);
      setQuickTripName('');
      setShowQuickTripCreate(false);

      // Auto-select the newly created trip
      if (result && result.id) {
        setFilterTrip(result.id);
      }

      alert(`Trip "${quickTripName}" created successfully! You can now add items to this trip.`);
    } catch (error) {
      logger.error('Error creating trip:', error);
      alert('Failed to create trip. Please try again.');
    }
  };

  const getSelectedTripName = () => {
    if (filterTrip === 'All') return 'All Trips';
    const trip = trips.find((t: any) => t.id === filterTrip);
    return trip ? trip.trip_name : 'All Trips';
  };

  const filteredItinerary = displayItinerary.filter(item => {
    const matchesType = filterType === 'All' || item.type === filterType;
    const matchesTraveler = filterTraveler === 'All' || item.assigned_to === filterTraveler;
    const matchesTrip = filterTrip === 'All' || item.trip_id === filterTrip;
    return matchesType && matchesTraveler && matchesTrip;
  });

  // Sort by date
  const sortedItinerary = [...filteredItinerary].sort((a, b) => {
    return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
  });

  return (
    <section id="itinerary" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trip-Centric Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-bold text-gray-900">
              Travel Itinerary
            </h2>
          </div>

          {/* Prominent Trip Selector */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex-1 min-w-[250px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Trip to Manage
                </label>
                <select
                  value={filterTrip}
                  onChange={(e) => setFilterTrip(e.target.value)}
                  className="w-full px-4 py-3 text-lg font-semibold border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="All">📋 All Trips</option>
                  {trips.map((trip: any) => (
                    <option key={trip.id} value={trip.id}>
                      ✈️ {trip.trip_name}
                    </option>
                  ))}
                </select>
                {filterTrip !== 'All' && (
                  <p className="mt-2 text-sm text-blue-700">
                    Currently viewing: <strong>{getSelectedTripName()}</strong>
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                {!showQuickTripCreate ? (
                  <button
                    onClick={() => setShowQuickTripCreate(true)}
                    className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    <Plus size={20} />
                    New Trip
                  </button>
                ) : (
                  <div className="flex flex-col gap-2 min-w-[250px]">
                    <input
                      type="text"
                      value={quickTripName}
                      onChange={(e) => setQuickTripName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleQuickCreateTrip()}
                      placeholder="Enter trip name (e.g., SEMA 2025)"
                      className="px-4 py-2 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleQuickCreateTrip}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                      >
                        Create
                      </button>
                      <button
                        onClick={() => {
                          setShowQuickTripCreate(false);
                          setQuickTripName('');
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                <p className="text-xs text-gray-600 text-center">
                  {trips.length} {trips.length === 1 ? 'trip' : 'trips'} total
                </p>
              </div>
            </div>
          </div>

          <p className="text-gray-600 text-center">
            Manage your business trip details, including flights, accommodations, meetings, transportation, and sightseeing
          </p>
        </div>

        <div className="mb-8 flex flex-wrap gap-4 justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('full')}
                className={`px-2 py-1 rounded-md flex items-center text-sm ${
                  viewMode === 'full' 
                    ? 'bg-white shadow-sm text-primary' 
                    : 'text-gray-700 hover:text-primary'
                }`}
              >
                <LayoutList size={16} className="mr-1" />
                <span>Full View</span>
              </button>
              <button
                onClick={() => setViewMode('summary')}
                className={`px-2 py-1 rounded-md flex items-center text-sm ${
                  viewMode === 'summary' 
                    ? 'bg-white shadow-sm text-primary' 
                    : 'text-gray-700 hover:text-primary'
                }`}
              >
                <List size={16} className="mr-1" />
                <span>Summary</span>
              </button>
            </div>

            {viewMode === 'full' && (
              <div className="flex flex-wrap items-center gap-1 ml-1">
                <Filter size={16} className="text-gray-500" />
                <span className="text-gray-700 text-sm hidden sm:inline">Filter by:</span>
                
                <select 
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as ItineraryItemType | 'All')}
                  className="px-2 py-1 border border-gray-300 rounded-md text-xs sm:text-sm"
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
                  className="px-2 py-1 border border-gray-300 rounded-md text-xs sm:text-sm"
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
              className="flex items-center bg-secondary hover:bg-secondary/90 text-white px-3 py-1.5 rounded-lg transition-colors text-sm"
            >
              <Plus size={16} className="mr-1" />
              Add Item
            </button>
            
            <div className="flex items-center gap-1">
              <button
                onClick={exportItinerary}
                className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1.5 rounded-lg transition-colors text-sm"
                title="Export itinerary"
              >
                <Download size={16} className="mr-1" />
                <span className="hidden sm:inline">Export</span>
              </button>
              
              <button
                onClick={exportToWordDocument}
                className="flex items-center bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1.5 rounded-lg transition-colors text-sm"
                title="Export as Word document"
              >
                <Download size={16} className="mr-1" />
                <span className="hidden sm:inline">Word</span>
              </button>
              
              <label className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1.5 rounded-lg transition-colors cursor-pointer text-sm">
                <Upload size={16} className="mr-1" />
                <span className="hidden sm:inline">Import</span>
                <input 
                  type="file" 
                  accept=".json" 
                  onChange={importItinerary} 
                  className="hidden" 
                />
              </label>
              
              <ItineraryExportButton 
                itinerary={sortedItinerary}
                suppliers={suppliers}
                contacts={contacts}
                expenses={expenses}
                className="px-2 py-1.5 text-sm"
              />
              
              <button
                onClick={handleSaveAsDefault}
                className="flex items-center bg-primary hover:bg-primary/90 text-white px-2 py-1.5 rounded-lg transition-colors text-sm"
                title="Save as default data"
              >
                <Save size={16} className="mr-1" />
                <span className="hidden sm:inline">Save as Default</span>
              </button>
              
              <button
                onClick={() => setShowConfirmReset(true)}
                className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1.5 rounded-lg transition-colors text-sm"
                title="Reset to sample data"
              >
                <Database size={16} className="mr-1" />
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
                        <h3 className="text-base font-semibold text-gray-900">{item.title}</h3>
                        <p className="text-sm text-gray-600">{item.type}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs ${getAssigneeColor(item.assigned_to)}`}>
                        {item.assigned_to}
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
                            {item.end_date && <> — {format(parseISO(item.end_date), 'MMM dd, yyyy')}</>}
                          </p>
                          {(item.start_time || item.end_time) && (
                            <p className="text-sm text-gray-600">
                              {item.start_time && `${item.start_time}`}
                              {item.start_time && item.end_time && ` - `}
                              {item.end_time && `${item.end_time}`}
                            </p>
                          )}
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
                    {item.type === 'Flight' && item.type_specific_data?.flight_number && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="font-semibold text-blue-800 mb-2">Flight Details</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-blue-700">Airline & Flight</p>
                            <p className="font-medium">{item.type_specific_data?.airline} {item.type_specific_data?.flight_number}</p>
                          </div>
                          <div>
                            <p className="text-sm text-blue-700">Times</p>
                            <p className="font-medium">
                              Departs: {item.type_specific_data?.departure_time} • Arrives: {item.type_specific_data?.arrival_time}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {item.type === 'Hotel' && item.type_specific_data?.hotel_name && (
                      <div className="bg-indigo-50 p-4 rounded-lg">
                        <p className="font-semibold text-indigo-800 mb-2">Hotel Details</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-indigo-700">Hotel & Room</p>
                            <p className="font-medium">{item.type_specific_data?.hotel_name}: {item.type_specific_data?.room_type}</p>
                          </div>
                          <div>
                            <p className="text-sm text-indigo-700">Times</p>
                            <p className="font-medium">
                              Check-in: {item.type_specific_data?.check_in_time} • Check-out: {item.type_specific_data?.check_out_time}
                            </p>
                            {item.end_date && <span> • Until: {format(parseISO(item.end_date), 'MMM d')}</span>}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {item.type === 'BusinessVisit' && item.type_specific_data?.contact_name && (
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="font-semibold text-purple-800 mb-2">Contact Details</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-purple-700">Contact Person</p>
                            <p className="font-medium">{item.type_specific_data?.contact_name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-purple-700">Company</p>
                            <p className="font-medium">{item.type_specific_data?.company_name}</p>
                          </div>
                          {item.type_specific_data?.contact_phone && (
                            <div>
                              <p className="text-sm text-purple-700">Phone</p>
                              <p className="font-medium">{item.type_specific_data?.contact_phone}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {item.type === 'Meeting' && (
                      <div className="bg-teal-50 p-4 rounded-lg">
                        <p className="font-semibold text-teal-800 mb-2">Meeting Details</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {item.type_specific_data?.meeting_room && (
                            <div>
                              <p className="text-sm text-teal-700">Meeting Room</p>
                              <p className="font-medium">{item.type_specific_data?.meeting_room}</p>
                            </div>
                          )}
                          {item.type_specific_data?.meeting_type && (
                            <div>
                              <p className="text-sm text-teal-700">Type</p>
                              <p className="font-medium">{item.type_specific_data?.meeting_type}</p>
                            </div>
                          )}
                          {item.type_specific_data?.agenda && (
                            <div className="md:col-span-2">
                              <p className="text-sm text-teal-700">Agenda</p>
                              <p className="font-medium">{item.type_specific_data?.agenda}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {item.type === 'Conference' && (
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <p className="font-semibold text-orange-800 mb-2">Conference Details</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {item.type_specific_data?.conference_hall && (
                            <div>
                              <p className="text-sm text-orange-700">Conference Hall</p>
                              <p className="font-medium">{item.type_specific_data?.conference_hall}</p>
                            </div>
                          )}
                          {item.type_specific_data?.registration_required !== undefined && (
                            <div>
                              <p className="text-sm text-orange-700">Registration</p>
                              <p className="font-medium">{item.type_specific_data?.registration_required ? 'Required' : 'Not Required'}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {item.type === 'Factory Visit' && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="font-semibold text-gray-800 mb-2">Factory Visit Details</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {item.type_specific_data?.factory_type && (
                            <div>
                              <p className="text-sm text-gray-700">Factory Type</p>
                              <p className="font-medium">{item.type_specific_data?.factory_type}</p>
                            </div>
                          )}
                          {item.type_specific_data?.safety_requirements && (
                            <div>
                              <p className="text-sm text-gray-700">Safety Requirements</p>
                              <p className="font-medium">{item.type_specific_data?.safety_requirements}</p>
                            </div>
                          )}
                          {item.type_specific_data?.tour_guide_required !== undefined && (
                            <div>
                              <p className="text-sm text-gray-700">Tour Guide</p>
                              <p className="font-medium">{item.type_specific_data?.tour_guide_required ? 'Required' : 'Not Required'}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {item.type === 'Sightseeing' && (
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="font-semibold text-green-800 mb-2">Sightseeing Details</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {item.type_specific_data?.entrance_fee && (
                            <div>
                              <p className="text-sm text-green-700">Entrance Fee</p>
                              <p className="font-medium">{item.type_specific_data?.entrance_fee}</p>
                            </div>
                          )}
                          {item.type_specific_data?.opening_hours && (
                            <div>
                              <p className="text-sm text-green-700">Opening Hours</p>
                              <p className="font-medium">{item.type_specific_data?.opening_hours}</p>
                            </div>
                          )}
                          {item.type_specific_data?.tour_duration && (
                            <div>
                              <p className="text-sm text-green-700">Tour Duration</p>
                              <p className="font-medium">{item.type_specific_data?.tour_duration}</p>
                            </div>
                          )}
                          {item.type_specific_data?.tour_guide && (
                            <div>
                              <p className="text-sm text-green-700">Tour Guide</p>
                              <p className="font-medium">{item.type_specific_data?.tour_guide}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {item.type === 'Train' && (
                      <div className="bg-amber-50 p-4 rounded-lg">
                        <p className="font-semibold text-amber-800 mb-2">Fast Train Details</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {item.type_specific_data?.train_number && (
                            <div>
                              <p className="text-sm text-amber-700">Train Number</p>
                              <p className="font-medium">{item.type_specific_data?.train_number}</p>
                            </div>
                          )}
                          {item.type_specific_data?.train_class && (
                            <div>
                              <p className="text-sm text-amber-700">Class</p>
                              <p className="font-medium">{item.type_specific_data?.train_class}</p>
                            </div>
                          )}
                          {(item.type_specific_data?.departure_time || item.type_specific_data?.arrival_time) && (
                            <div>
                              <p className="text-sm text-amber-700">Times</p>
                              <p className="font-medium">
                                {item.type_specific_data?.departure_time && <>Departs: {item.type_specific_data?.departure_time}</>}
                                {item.type_specific_data?.departure_time && item.type_specific_data?.arrival_time && <> • </>}
                                {item.type_specific_data?.arrival_time && <>Arrives: {item.type_specific_data?.arrival_time}</>}
                              </p>
                            </div>
                          )}
                          {item.type_specific_data?.platform && (
                            <div>
                              <p className="text-sm text-amber-700">Platform</p>
                              <p className="font-medium">{item.type_specific_data?.platform}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {item.type === 'Bus' && (
                      <div className="bg-lime-50 p-4 rounded-lg">
                        <p className="font-semibold text-lime-800 mb-2">Bus Details</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {item.type_specific_data?.bus_number && (
                            <div>
                              <p className="text-sm text-lime-700">Bus Number</p>
                              <p className="font-medium">{item.type_specific_data?.bus_number}</p>
                            </div>
                          )}
                          {item.type_specific_data?.bus_company && (
                            <div>
                              <p className="text-sm text-lime-700">Bus Company</p>
                              <p className="font-medium">{item.type_specific_data?.bus_company}</p>
                            </div>
                          )}
                          {(item.type_specific_data?.departure_time || item.type_specific_data?.arrival_time) && (
                            <div>
                              <p className="text-sm text-lime-700">Times</p>
                              <p className="font-medium">
                                {item.type_specific_data?.departure_time && <>Departs: {item.type_specific_data?.departure_time}</>}
                                {item.type_specific_data?.departure_time && item.type_specific_data?.arrival_time && <> • </>}
                                {item.type_specific_data?.arrival_time && <>Arrives: {item.type_specific_data?.arrival_time}</>}
                              </p>
                            </div>
                          )}
                          {item.type_specific_data?.bus_stop && (
                            <div>
                              <p className="text-sm text-lime-700">Bus Stop/Station</p>
                              <p className="font-medium">{item.type_specific_data?.bus_stop}</p>
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