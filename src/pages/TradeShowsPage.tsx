import React from 'react';
import { Calendar } from 'lucide-react';

const TradeShowsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="text-primary" />
              Trade Shows
            </h1>
            <p className="text-gray-600 mt-1">Manage SEMA 2025 and other trade show activities</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <Calendar size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Trade Shows Module</h2>
          <p className="text-gray-600">Track booth details, meetings, and interested customers</p>
        </div>
      </div>
    </div>
  );
};

export default TradeShowsPage;
