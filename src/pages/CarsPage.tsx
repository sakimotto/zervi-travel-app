import React from 'react';
import { Car } from 'lucide-react';

const CarsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2 mb-6">
          <Car className="text-primary" />
          Car Rentals
        </h1>
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <Car size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Car Rental Management</h2>
          <p className="text-gray-600">Manage vehicle rentals and transportation</p>
        </div>
      </div>
    </div>
  );
};

export default CarsPage;
