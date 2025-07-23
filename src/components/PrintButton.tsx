import React from 'react';
import { Printer } from 'lucide-react';
import { ItineraryItem } from '../types';
import { printItinerary } from '../utils/printItinerary';

interface PrintButtonProps {
  itinerary: ItineraryItem[];
  className?: string;
}

const PrintButton: React.FC<PrintButtonProps> = ({ itinerary, className = '' }) => {
  const handlePrint = () => {
    printItinerary(itinerary);
  };

  return (
    <button
      onClick={handlePrint}
      className={`flex items-center bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1.5 rounded-lg transition-colors text-sm ${className}`}
      title="Print itinerary"
    >
      <Printer size={16} className="mr-1" />
      <span className="hidden sm:inline">Print</span>
    </button>
  );
};

export default PrintButton;