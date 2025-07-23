import React, { useState } from 'react';
import { Destination } from '../types';
import { Map, Calendar, List, Edit, Trash2 } from 'lucide-react';

interface DestinationCardProps {
  destination: Destination;
  onEdit: () => void;
  onDelete: () => void;
}

const DestinationCard: React.FC<DestinationCardProps> = ({ destination, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showControls, setShowControls] = useState(false);

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg relative"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={destination.image} 
          alt={destination.name} 
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1594818379496-da1e345737b0?q=80&w=1000&auto=format&fit=crop';
          }}
        />
        <div className="absolute top-0 left-0 bg-primary text-white px-3 py-1 rounded-br-lg">
          <span className="text-sm font-semibold">{destination.region}</span>
        </div>
        
        {/* Edit/Delete controls */}
        {showControls && (
          <div className="absolute top-2 right-2 flex gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100 text-blue-600"
              aria-label="Edit destination"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100 text-red-600"
              aria-label="Delete destination"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>
      
      <div className="p-5">
        <h3 className="text-xl font-montserrat font-semibold text-primary mb-2">{destination.name}</h3>
        <p className="text-gray-700 mb-4 line-clamp-3">
          {destination.description}
        </p>
        
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-secondary hover:text-primary transition-colors duration-200 font-semibold"
        >
          {isExpanded ? 'Show Less' : 'Show More'}
        </button>
        
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-start mb-3">
              <Map size={18} className="text-secondary mr-2 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Region:</p>
                <p className="text-gray-700">{destination.region}</p>
              </div>
            </div>
            
            <div className="flex items-start mb-3">
              <Calendar size={18} className="text-secondary mr-2 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Best Time to Visit:</p>
                <p className="text-gray-700">{destination.bestTimeToVisit}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <List size={18} className="text-secondary mr-2 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Activities:</p>
                <ul className="list-disc list-inside text-gray-700">
                  {destination.activities.map((activity, index) => (
                    <li key={index} className="ml-2">{activity}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DestinationCard;