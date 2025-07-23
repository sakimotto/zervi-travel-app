import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CheckCircle, XCircle, AlertCircle, Database } from 'lucide-react';

const SupabaseStatus: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [tableStatus, setTableStatus] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<string | null>(null);

  const tables = [
    'destinations',
    'suppliers', 
    'business_contacts',
    'itinerary_items',
    'expenses',
    'todos',
    'appointments'
  ];

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      // Test basic connection
      const { data, error } = await supabase.from('destinations').select('*').limit(1);
      
      if (error) {
        setConnectionStatus('error');
        setError(error.message);
        return;
      }

      setConnectionStatus('connected');

      // Check each table
      const tableChecks: { [key: string]: boolean } = {};
      for (const table of tables) {
        try {
          const { error: tableError } = await supabase.from(table).select('*').limit(1);
          tableChecks[table] = !tableError;
        } catch {
          tableChecks[table] = false;
        }
      }
      setTableStatus(tableChecks);

    } catch (err) {
      setConnectionStatus('error');
      setError(err instanceof Error ? err.message : 'Connection failed');
    }
  };

  const getStatusIcon = (status: 'checking' | 'connected' | 'error') => {
    switch (status) {
      case 'checking':
        return <AlertCircle className="animate-spin text-yellow-500" size={20} />;
      case 'connected':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'error':
        return <XCircle className="text-red-500" size={20} />;
    }
  };

  return (
    <div className="fixed top-4 left-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <div className="flex items-center gap-2 mb-3">
        <Database size={20} className="text-primary" />
        <h3 className="font-semibold text-gray-900">🚀 Zervi Travel Status</h3>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {getStatusIcon(connectionStatus)}
          <span className="text-sm">
            {connectionStatus === 'checking' && 'Checking Zervi Travel...'}
            {connectionStatus === 'connected' && '🎉 Zervi Travel Connected!'}
            {connectionStatus === 'error' && '❌ Connection Failed'}
          </span>
        </div>

        {error && (
          <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
            <strong>Error:</strong> {error}
            <br />
            <span className="text-xs">Check your Supabase project connection</span>
          </div>
        )}

        {connectionStatus === 'connected' && (
          <div className="mt-3">
            <p className="text-xs text-gray-600 mb-2">📊 Database Tables:</p>
            <div className="space-y-1">
              {tables.map(table => (
                <div key={table} className="flex items-center gap-2 text-xs">
                  {tableStatus[table] ? (
                    <CheckCircle size={12} className="text-green-500" />
                  ) : (
                    <XCircle size={12} className="text-red-500" />
                  )}
                  <span className={tableStatus[table] ? 'text-green-700' : 'text-red-700'}>
                    {table}
                  </span>
                </div>
              ))}
            </div>
            
            {Object.values(tableStatus).every(status => status) && (
              <div className="mt-2 p-2 bg-green-50 rounded text-xs text-green-800">
                ✅ All systems ready! Your Zervi Travel is fully operational.
              </div>
            )}
          </div>
        )}

        <button
          onClick={checkConnection}
          className="w-full mt-3 px-3 py-1 bg-primary text-white text-xs rounded hover:bg-primary/90"
        >
          🔄 Refresh Status
        </button>
      </div>
    </div>
  );
};

export default SupabaseStatus;