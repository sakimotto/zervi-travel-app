import React, { useState, useEffect } from 'react';
import { Plus, X, User, Edit2, Trash2 } from 'lucide-react';
import { TravelerOption } from '../types';
import { getTravelers, saveTravelers, addTraveler, getActiveTravelerNames } from '../data/travelers';

interface TravelerSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  className?: string;
  showManageButton?: boolean;
}

const TravelerSelector: React.FC<TravelerSelectorProps> = ({
  value,
  onChange,
  label = "Assigned To",
  required = false,
  className = "",
  showManageButton = true
}) => {
  const [travelers, setTravelers] = useState<TravelerOption[]>([]);
  const [showManageModal, setShowManageModal] = useState(false);
  const [newTravelerName, setNewTravelerName] = useState('');
  const [newTravelerRole, setNewTravelerRole] = useState('');

  useEffect(() => {
    setTravelers(getTravelers());
  }, []);

  const activeTravelers = travelers.filter(t => t.active);

  const handleAddTraveler = () => {
    if (newTravelerName.trim()) {
      const newTraveler = addTraveler(newTravelerName, newTravelerRole);
      setTravelers(getTravelers());
      setNewTravelerName('');
      setNewTravelerRole('');
      onChange(newTraveler.name); // Auto-select the new traveler
    }
  };

  const handleToggleActive = (id: string) => {
    const updatedTravelers = travelers.map(t => 
      t.id === id ? { ...t, active: !t.active } : t
    );
    setTravelers(updatedTravelers);
    saveTravelers(updatedTravelers);
  };

  const handleDeleteTraveler = (id: string) => {
    const traveler = travelers.find(t => t.id === id);
    if (traveler && window.confirm(`Are you sure you want to delete "${traveler.name}"?`)) {
      const updatedTravelers = travelers.filter(t => t.id !== id);
      setTravelers(updatedTravelers);
      saveTravelers(updatedTravelers);
      
      // If the deleted traveler was selected, reset to first available
      if (value === traveler.name) {
        const firstActive = updatedTravelers.find(t => t.active);
        onChange(firstActive?.name || '');
      }
    }
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && '*'}
      </label>
      <div className="flex gap-2">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          required={required}
        >
          <option value="">Select traveler...</option>
          {activeTravelers.map(traveler => (
            <option key={traveler.id} value={traveler.name}>
              {traveler.name} {traveler.role && `(${traveler.role})`}
            </option>
          ))}
        </select>
        
        {showManageButton && (
          <button
            type="button"
            onClick={() => setShowManageModal(true)}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md flex items-center"
            title="Manage travelers"
          >
            <User size={16} />
          </button>
        )}
      </div>

      {/* Manage Travelers Modal */}
      {showManageModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Manage Travelers</h3>
              <button
                onClick={() => setShowManageModal(false)}
                className="p-1 rounded-full hover:bg-gray-200"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {/* Add New Traveler */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-lg font-medium text-gray-900 mb-3">Add New Traveler</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <input
                    type="text"
                    value={newTravelerName}
                    onChange={(e) => setNewTravelerName(e.target.value)}
                    placeholder="Traveler name"
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <input
                    type="text"
                    value={newTravelerRole}
                    onChange={(e) => setNewTravelerRole(e.target.value)}
                    placeholder="Role (optional)"
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <button
                  onClick={handleAddTraveler}
                  disabled={!newTravelerName.trim()}
                  className="flex items-center bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
                >
                  <Plus size={16} className="mr-2" />
                  Add Traveler
                </button>
              </div>

              {/* Existing Travelers */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">Current Travelers</h4>
                <div className="space-y-2">
                  {travelers.map(traveler => (
                    <div key={traveler.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${traveler.active ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <div>
                          <p className="font-medium text-gray-900">{traveler.name}</p>
                          {traveler.role && (
                            <p className="text-sm text-gray-600">{traveler.role}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleActive(traveler.id)}
                          className={`px-3 py-1 text-xs rounded-full ${
                            traveler.active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {traveler.active ? 'Active' : 'Inactive'}
                        </button>
                        
                        {/* Don't allow deleting default travelers */}
                        {!['Archie', 'Yok', 'Both'].includes(traveler.name) && (
                          <button
                            onClick={() => handleDeleteTraveler(traveler.id)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowManageModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TravelerSelector;