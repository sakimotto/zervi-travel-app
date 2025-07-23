import React, { useState } from 'react';
import { Download, FileText, Printer, File } from 'lucide-react';
import { ItineraryItem, Supplier, BusinessContact, Expense } from '../types';
import { exportItineraryToHTML, exportItineraryToWord, printItinerary } from '../utils/exportItinerary';

interface ItineraryExportButtonProps {
  itinerary: ItineraryItem[];
  suppliers?: Supplier[];
  contacts?: BusinessContact[];
  expenses?: Expense[];
  className?: string;
}

const ItineraryExportButton: React.FC<ItineraryExportButtonProps> = ({ 
  itinerary, 
  suppliers = [], 
  contacts = [], 
  expenses = [],
  className = '' 
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleExportHTML = () => {
    exportItineraryToHTML(itinerary, suppliers, contacts, expenses);
    setShowDropdown(false);
  };

  const handleExportWord = () => {
    exportItineraryToWord(itinerary, suppliers, contacts, expenses);
    setShowDropdown(false);
  };

  const handlePrint = () => {
    printItinerary(itinerary, suppliers, contacts, expenses);
    setShowDropdown(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
        title="Export itinerary"
      >
        <Download size={16} className="mr-2" />
        Export Itinerary
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="py-2">
            <button
              onClick={handleExportHTML}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <FileText size={16} className="mr-3 text-blue-500" />
              <div>
                <div className="font-medium">Export as HTML</div>
                <div className="text-xs text-gray-500">Beautiful A4 formatted page</div>
              </div>
            </button>
            
            <button
              onClick={handleExportWord}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <File size={16} className="mr-3 text-blue-600" />
              <div>
                <div className="font-medium">Export as Word</div>
                <div className="text-xs text-gray-500">Microsoft Word compatible</div>
              </div>
            </button>
            
            <button
              onClick={handlePrint}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <Printer size={16} className="mr-3 text-gray-600" />
              <div>
                <div className="font-medium">Print Directly</div>
                <div className="text-xs text-gray-500">Open print dialog</div>
              </div>
            </button>
          </div>
        </div>
      )}

      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default ItineraryExportButton;