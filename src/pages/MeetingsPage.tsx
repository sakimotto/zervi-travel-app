import React from 'react';
import { Video } from 'lucide-react';

const MeetingsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2 mb-6">
          <Video className="text-primary" />
          Meetings
        </h1>
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <Video size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Meeting Management</h2>
          <p className="text-gray-600">Schedule and track professional meetings</p>
        </div>
      </div>
    </div>
  );
};

export default MeetingsPage;
