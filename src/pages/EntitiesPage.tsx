import React, { useState } from 'react';
import { Users } from 'lucide-react';
import Drawer from '../components/Drawer';

const EntitiesPage: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="text-primary" />
              Unified Entities
            </h1>
            <p className="text-gray-600 mt-1">
              One contact, multiple roles - Customer, Supplier, Partner
            </p>
          </div>
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
          >
            Add Entity
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <Users size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Unified Entity Management
          </h2>
          <p className="text-gray-600 mb-4">
            Demonstration of right-hand drawer pattern with unified entity system
          </p>
          <ul className="text-left max-w-md mx-auto space-y-2 text-gray-700">
            <li>✓ One entity can be Customer + Supplier + Partner</li>
            <li>✓ No duplicate data across modules</li>
            <li>✓ Right-hand drawer instead of center modal</li>
            <li>✓ Role-based field visibility</li>
            <li>✓ Better mobile experience</li>
          </ul>
        </div>
      </div>

      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Add/Edit Entity"
        size="xl"
      >
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Demonstration</h3>
            <p className="text-gray-600">
              This drawer slides in from the right, doesn't block the main view,
              and provides a better UX for long forms. The unified entity system
              will be fully implemented after migration.
            </p>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Migration Status:</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>✅ Migration SQL created</li>
              <li>✅ Drawer component built</li>
              <li>✅ Entity types defined</li>
              <li>⏳ Full form implementation pending</li>
              <li>⏳ Data migration needs to be run</li>
            </ul>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default EntitiesPage;
