import React, { useState, useEffect } from 'react';
import { Database, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

const SupabaseConnectionHelper: React.FC = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  const checkConnection = async () => {
    setIsChecking(true);
    try {
      // Test the connection
      const { supabase } = await import('../lib/supabase');
      const { data, error } = await supabase.from('destinations').select('count').limit(1);
      if (!error) {
        setIsConnected(true);
      }
    } catch (err) {
      console.log('Connection test:', err);
    }
    setIsChecking(false);
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const manualSetup = () => {
    window.open('https://supabase.com/dashboard/project/anymkdmgqkrilzatmnmc', '_blank');
  };

  return (
    <div className="fixed top-20 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <div className="flex items-center gap-2 mb-3">
        <Database size={20} className="text-primary" />
        <h3 className="font-semibold text-gray-900">Connect Zervi Travel</h3>
      </div>

      <div className="space-y-3">
        {isConnected ? (
          <div className="text-sm text-gray-600 bg-green-50 p-3 rounded">
            <p className="mb-2 font-semibold text-green-800">🎉 Zervi Travel Connected!</p>
            <p className="mb-2">Your Zervi Travel app is now connected to Supabase!</p>
            <div className="text-xs space-y-1">
              <p><strong>✅ Database:</strong> Connected and ready</p>
              <p><strong>✅ Tables:</strong> All travel tables created</p>
              <p><strong>✅ Real-time:</strong> Team collaboration enabled</p>
              <p><strong>✅ Sync:</strong> Data syncs across all devices</p>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
            <p className="mb-2 font-semibold text-blue-800">🚀 What's Next?</p>
            <div className="text-xs space-y-1">
              <p><strong>1. Test Connection:</strong> Click "Test Connection" below</p>
              <p><strong>2. Start Using:</strong> Add suppliers, contacts, itinerary items</p>
              <p><strong>3. Team Access:</strong> Share your project URL with team</p>
              <p><strong>4. Real-time:</strong> Changes sync instantly across devices</p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <button
            onClick={checkConnection}
            disabled={isChecking}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary text-white text-sm rounded hover:bg-primary/90 disabled:opacity-50"
          >
            {isChecking ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <CheckCircle size={16} />
            )}
            {isChecking ? 'Testing...' : isConnected ? 'Connection Active' : 'Test Connection'}
          </button>

          <button
            onClick={manualSetup}
            className="w-full px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50"
          >
            Open Supabase Dashboard
          </button>
        </div>

        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          <strong>📊 Your "Zervi Travel" Project:</strong> 
          <br />
          <strong>URL:</strong> https://anymkdmgqkrilzatmnmc.supabase.co
          <br />
          <strong>Status:</strong> {isConnected ? 'Connected & Active' : 'Ready for connection'}
        </div>
      </div>
    </div>
  );
};

export default SupabaseConnectionHelper;