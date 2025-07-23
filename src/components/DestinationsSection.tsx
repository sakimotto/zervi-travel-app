import React, { useState, useEffect } from 'react';
import DestinationCard from './DestinationCard';
import { destinations as defaultDestinations } from '../data/destinations';
import { Search, Plus, Download, Upload, Database, AlertCircle, X, Save } from 'lucide-react';
import AddDestinationModal from './AddDestinationModal';
import { Destination } from '../types';
import { useDestinations } from '../hooks/useSupabase';
import { 
  saveDestinationsToLocalStorage, 
  getDestinationsFromLocalStorage,
  saveAsDefaultSampleData 
} from '../utils/localStorage';
import { saveAs } from 'file-saver';
import { getItineraryFromLocalStorage } from '../utils/localStorage';

const DestinationsSection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  
  // Use Supabase for shared data, fallback to localStorage for compatibility
  const { data: supabaseDestinations, loading, insert, update, remove } = useDestinations();
  const [localDestinations, setLocalDestinations] = useState<Destination[]>(defaultDestinations);
  
  // Use Supabase data if available, otherwise use local data
  const destinations = supabaseDestinations.length > 0 ? supabaseDestinations : localDestinations;
  const setDestinations = supabaseDestinations.length > 0 ? () => {} : setLocalDestinations;
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [showSaveDefaultConfirm, setShowSaveDefaultConfirm] = useState(false);
  
  // Extract unique regions for filter
  const regions = ['All', ...new Set(destinations.map(dest => dest.region))];
  
  const filteredDestinations = destinations.filter(destination => {
    const matchesSearch = destination.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         destination.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = selectedRegion === 'All' || destination.region === selectedRegion;
    
    return matchesSearch && matchesRegion;
  });


  const handleEditDestination = (destination: Destination) => {
    setEditingDestination(destination);
    setShowAddModal(true);
  };

  const handleDeleteDestination = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this destination?')) {
      try {
        if (supabaseDestinations.length > 0) {
          await remove(id);
        } else {
          setDestinations(prev => prev.filter(dest => dest.id !== id));
        }
      } catch (error) {
        console.error('Error deleting destination:', error);
        alert('Failed to delete destination. Please try again.');
      }
    }
  };

  const handleSaveDestination = async (destination: Destination) => {
    if (editingDestination) {
      try {
        if (supabaseDestinations.length > 0) {
          await update(destination.id, destination);
        } else {
          setDestinations(prev => 
            prev.map(dest => dest.id === destination.id ? destination : dest)
          );
        }
      } catch (error) {
        console.error('Error updating destination:', error);
        alert('Failed to update destination. Please try again.');
      }
      setEditingDestination(null);
    } else {
      try {
        if (supabaseDestinations.length > 0) {
          await insert(destination);
        } else {
          setDestinations(prev => [...prev, destination]);
        }
      } catch (error) {
        console.error('Error creating destination:', error);
        alert('Failed to create destination. Please try again.');
      }
    }
    setShowAddModal(false);
  };

  const exportDestinations = () => {
    const dataStr = JSON.stringify(destinations, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    saveAs(blob, `china-destinations-${new Date().toISOString().split('T')[0]}.json`);
  };

  const importDestinations = (event: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsedData = JSON.parse(content);
        
        // Basic validation that the imported data is an array of destinations
        if (!Array.isArray(parsedData)) {
          throw new Error('Imported file does not contain a valid destinations array');
        }

        // Check if at least one item has the expected properties
        if (parsedData.length > 0) {
          const firstItem = parsedData[0];
          if (!firstItem.id || !firstItem.name || !firstItem.description) {
            throw new Error('Imported destinations data is missing required fields');
          }
        }

        if (window.confirm(`Are you sure you want to import these destinations? This will replace your current destinations.`)) {
          setDestinations(parsedData);
        }
      } catch (error) {
        console.error('Error importing destinations:', error);
        setImportError('The selected file is not a valid destinations export. Please select a correctly formatted JSON file.');
      }
    };
    reader.readAsText(file);
    
    // Reset the input so the same file can be selected again
    event.target.value = '';
  };

  const resetToDefaultData = () => {
    setDestinations(defaultDestinations);
    setShowConfirmReset(false);
  };

  const handleSaveAsDefault = () => {
    setShowSaveDefaultConfirm(true);
  };

  const confirmSaveAsDefault = () => {
    const currentItinerary = getItineraryFromLocalStorage() || [];
    saveAsDefaultSampleData(destinations, currentItinerary);
    setShowSaveDefaultConfirm(false);
  };

  return (
    <section id="destinations" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-primary font-montserrat mb-3">Popular Destinations</h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Explore China's most iconic locations, from ancient wonders to natural landscapes and bustling cities
          </p>
        </div>
        
        <div className="mb-8 flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex flex-col md:flex-row gap-4 md:items-center">
            <div className="relative md:w-64">
              <input
                type="text"
                placeholder="Search destinations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            
            <div className="md:w-48">
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                {regions.map(region => (
                  <option key={region} value={region}>
                    {region === 'All' ? 'All Regions' : region}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setEditingDestination(null);
                setShowAddModal(true);
              }}
              className="flex items-center bg-secondary hover:bg-secondary/90 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={20} className="mr-2" />
              Add Destination
            </button>
            
            <div className="flex items-center gap-2">
              <button
                onClick={exportDestinations}
                className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-lg transition-colors"
                title="Export destinations"
              >
                <Download size={18} className="mr-1" />
                <span className="hidden sm:inline">Export</span>
              </button>
              
              <label className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-lg transition-colors cursor-pointer">
                <Upload size={18} className="mr-1" />
                <span className="hidden sm:inline">Import</span>
                <input 
                  type="file" 
                  accept=".json" 
                  onChange={importDestinations} 
                  className="hidden" 
                />
              </label>
              
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
                title="Reset to default destinations"
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
        
        {filteredDestinations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDestinations.map(destination => (
              <DestinationCard 
                key={destination.id} 
                destination={destination}
                onEdit={() => handleEditDestination(destination)}
                onDelete={() => handleDeleteDestination(destination.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">No destinations found matching your criteria.</p>
            <button 
              onClick={() => {setSearchTerm(''); setSelectedRegion('All');}}
              className="mt-4 text-secondary hover:text-primary font-semibold"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Destination Modal */}
      {showAddModal && (
        <AddDestinationModal
          onClose={() => {
            setShowAddModal(false);
            setEditingDestination(null);
          }}
          onSave={handleSaveDestination}
          editDestination={editingDestination}
        />
      )}

      {/* Confirmation modal for resetting destinations */}
      {showConfirmReset && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Reset Destinations
              </h3>
              <p className="text-gray-700 mb-6">
                Are you sure you want to reset to the default destinations? This will replace all your current destinations.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={resetToDefaultData}
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

export default DestinationsSection;