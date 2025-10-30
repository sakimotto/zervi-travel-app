import React, { useState } from 'react';
import { Database, Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { logger } from '../utils/logger';
import { useSuppliers } from '../hooks/useSupabase';
import { useBusinessContacts } from '../hooks/useSupabase';
import { useDestinations } from '../hooks/useSupabase';
import { useExpenses } from '../hooks/useSupabase';
import { useItineraryItems } from '../hooks/useSupabase';
import { useTodos } from '../hooks/useSupabase';
import { useAppointments } from '../hooks/useSupabase';
import { sampleSuppliers } from '../data/suppliers';
import { sampleBusinessContacts } from '../data/businessContacts';
import { destinations as sampleDestinations } from '../data/destinations';
import { sampleExpenses } from '../data/expenses';
import { sampleItinerary } from '../data/itinerary';
import { sampleTodos } from '../data/todos';
import { sampleAppointments } from '../data/appointments';

interface LoadStatus {
  table: string;
  status: 'pending' | 'loading' | 'success' | 'error';
  count?: number;
  error?: string;
}

const SampleDataLoader: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadStatuses, setLoadStatuses] = useState<LoadStatus[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);

  // Get all the hooks
  const suppliers = useSuppliers();
  const contacts = useBusinessContacts();
  const destinations = useDestinations();
  const expenses = useExpenses();
  const itinerary = useItineraryItems();
  const todos = useTodos();
  const appointments = useAppointments();

  const updateStatus = (table: string, updates: Partial<LoadStatus>) => {
    setLoadStatuses(prev => {
      const existing = prev.find(s => s.table === table);
      if (existing) {
        return prev.map(s => s.table === table ? { ...s, ...updates } : s);
      } else {
        return [...prev, { table, status: 'pending', ...updates }];
      }
    });
  };

  const loadAllSampleData = async () => {
    setIsLoading(true);
    setLoadStatuses([]);

    // Load data in correct order to respect foreign key relationships
    const dataToLoad = [
      { name: 'Suppliers', data: sampleSuppliers, hook: suppliers },
      { name: 'Destinations', data: sampleDestinations, hook: destinations },
      { name: 'Business Contacts', data: sampleBusinessContacts, hook: contacts }, // After suppliers due to linked_supplier_id
      { name: 'Expenses', data: sampleExpenses, hook: expenses },
      { name: 'Itinerary Items', data: sampleItinerary, hook: itinerary },
      { name: 'Todos', data: sampleTodos, hook: todos },
      { name: 'Appointments', data: sampleAppointments, hook: appointments }, // After suppliers and contacts due to supplier_id and contact_id
    ];

    for (const { name, data, hook } of dataToLoad) {
      updateStatus(name, { status: 'loading' });
      
      try {
        logger.info(`Loading ${name} sample data into Supabase...`);
        
        let successCount = 0;
        let errorCount = 0;
        
        // Load each item sequentially to avoid overwhelming the database
        for (let i = 0; i < data.length; i++) {
          const item = data[i];
          try {
            logger.debug(`Inserting ${name} item ${i + 1}/${data.length}:`, item);
            await hook.insert(item);
            successCount++;
          } catch (itemError) {
            errorCount++;
            logger.error(`Error inserting ${name} item ${i + 1}:`, itemError);
            logger.error('Item data:', item);
          }
        }
        
        // Refresh the data
        await hook.refetch();
        
        if (errorCount === 0) {
          updateStatus(name, { 
            status: 'success', 
            count: successCount 
          });
          logger.info(`Successfully loaded ${successCount} ${name} records`);
        } else {
          updateStatus(name, { 
            status: 'error', 
            error: `${errorCount} items failed, ${successCount} succeeded`
          });
        }
        
      } catch (error) {
        logger.error(`Error loading ${name}:`, error);
        updateStatus(name, { 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    setIsLoading(false);
    logger.info('Sample data loading complete');
  };

  const getStatusIcon = (status: LoadStatus['status']) => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStatusColor = (status: LoadStatus['status']) => {
    switch (status) {
      case 'loading':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <Database className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">Sample Data Loader</h2>
      </div>

      <div className="mb-6">
        <p className="text-gray-600 mb-4">
          This will load all sample data into your Supabase database. This includes suppliers, 
          business contacts, destinations, expenses, itinerary items, todos, and appointments.
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-yellow-800 font-medium">Important Notes:</p>
              <ul className="text-yellow-700 text-sm mt-1 space-y-1">
                <li>• This will add sample data to your existing database records</li>
                <li>• No existing data will be deleted</li>
                <li>• You can delete individual records later through the UI</li>
                <li>• This ensures all frontend features work with real backend data</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          disabled={isLoading}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload className="h-4 w-4" />
          Load All Sample Data
        </button>
      ) : (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 font-medium mb-2">Confirm Sample Data Loading</p>
            <p className="text-blue-700 text-sm mb-4">
              This will load sample data for all tables. Are you sure you want to proceed?
            </p>
            <div className="flex gap-3">
              <button
                onClick={loadAllSampleData}
                disabled={isLoading}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {isLoading ? 'Loading...' : 'Yes, Load Data'}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>

          {loadStatuses.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Loading Progress</h3>
              <div className="space-y-2">
                {loadStatuses.map((status) => (
                  <div key={status.table} className="flex items-center gap-3">
                    {getStatusIcon(status.status)}
                    <span className={`font-medium ${getStatusColor(status.status)}`}>
                      {status.table}
                    </span>
                    {status.count && (
                      <span className="text-sm text-gray-500">
                        ({status.count} records)
                      </span>
                    )}
                    {status.error && (
                      <span className="text-sm text-red-600">
                        - {status.error}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SampleDataLoader;