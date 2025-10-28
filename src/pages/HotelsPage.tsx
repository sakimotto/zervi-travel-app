import React from 'react';
import { Building } from 'lucide-react';

const HotelsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2 mb-6">
          <Building className="text-primary" />
          Hotels
        </h1>
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <Building size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Hotel Management</h2>
          <p className="text-gray-600">Track hotel reservations and accommodations</p>
        </div>
      </div>
    </div>
  );
};

export default HotelsPage;
