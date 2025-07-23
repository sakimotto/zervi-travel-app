import React, { useState, useEffect } from 'react';
import { Destination } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { X, Plus, Trash2 } from 'lucide-react';

interface AddDestinationProps {
  onClose: () => void;
  onSave: (destination: Destination) => void;
  editDestination: Destination | null;
}

const AddDestinationModal: React.FC<AddDestinationProps> = ({ onClose, onSave, editDestination }) => {
  const [formData, setFormData] = useState<Destination>({
    id: '',
    name: '',
    description: '',
    image: '',
    region: '',
    activities: [''],
    bestTimeToVisit: '',
  });

  // Activities input management
  const [activities, setActivities] = useState<string[]>(['']);

  useEffect(() => {
    if (editDestination) {
      setFormData(editDestination);
      setActivities(editDestination.activities.length > 0 ? editDestination.activities : ['']);
    } else {
      setFormData({
        id: uuidv4(),
        name: '',
        description: '',
        image: '',
        region: '',
        activities: [''],
        bestTimeToVisit: '',
      });
      setActivities(['']);
    }
  }, [editDestination]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleActivityChange = (index: number, value: string) => {
    const newActivities = [...activities];
    newActivities[index] = value;
    setActivities(newActivities);
  };

  const addActivity = () => {
    setActivities([...activities, '']);
  };

  const removeActivity = (index: number) => {
    if (activities.length > 1) {
      const newActivities = [...activities];
      newActivities.splice(index, 1);
      setActivities(newActivities);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out empty activities
    const filteredActivities = activities.filter(activity => activity.trim() !== '');
    
    onSave({
      ...formData,
      id: formData.id || uuidv4(),
      activities: filteredActivities.length > 0 ? filteredActivities : ['Sightseeing'],
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-semibold text-gray-900">
            {editDestination ? 'Edit Destination' : 'Add New Destination'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Destination Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="E.g., The Great Wall of China"
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
              rows={4}
              placeholder="Brief description of this destination"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Region
              </label>
              <input
                type="text"
                name="region"
                value={formData.region}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="E.g., Northern China, Beijing"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Best Time to Visit
              </label>
              <input
                type="text"
                name="bestTimeToVisit"
                value={formData.bestTimeToVisit}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="E.g., Spring (April-May)"
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image URL
            </label>
            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter a valid image URL"
              required
            />
            {formData.image && (
              <div className="mt-2">
                <p className="text-sm text-gray-500 mb-1">Image Preview:</p>
                <img 
                  src={formData.image} 
                  alt="Preview" 
                  className="h-32 object-cover rounded-md"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Invalid+Image+URL';
                  }}
                />
              </div>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Activities
            </label>
            {activities.map((activity, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={activity}
                  onChange={(e) => handleActivityChange(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="E.g., Hiking, Photography"
                />
                <button
                  type="button"
                  onClick={() => removeActivity(index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                  disabled={activities.length <= 1}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addActivity}
              className="mt-2 flex items-center text-secondary hover:text-primary"
            >
              <Plus size={18} className="mr-1" /> Add Another Activity
            </button>
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
              {editDestination ? 'Update Destination' : 'Add Destination'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDestinationModal;