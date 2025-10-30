import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Shield, Eye, Edit, UserCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

interface Delegation {
  id: string;
  owner_id: string;
  delegate_id: string;
  permission: 'read' | 'write' | 'admin';
  created_at: string;
  notes?: string;
  delegate?: UserProfile;
}

const DelegationsPage: React.FC = () => {
  const { user } = useAuth();
  const [delegations, setDelegations] = useState<Delegation[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedPermission, setSelectedPermission] = useState<'read' | 'write' | 'admin'>('write');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (user) {
      loadDelegations();
      loadAllUsers();
    }
  }, [user]);

  const loadDelegations = async () => {
    try {
      const { data, error } = await supabase
        .from('delegations')
        .select(`
          *,
          delegate:delegate_id(id, email, full_name, role)
        `)
        .eq('owner_id', user?.id);

      if (error) throw error;
      setDelegations(data || []);
    } catch (error: any) {
      logger.error('Error loading delegations:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadAllUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .neq('id', user?.id)
        .order('full_name');

      if (error) throw error;
      setAllUsers(data || []);
    } catch (error: any) {
      logger.error('Error loading users:', error.message);
    }
  };

  const addDelegation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;

    try {
      const { error } = await supabase
        .from('delegations')
        .insert({
          owner_id: user?.id,
          delegate_id: selectedUserId,
          permission: selectedPermission,
          granted_by: user?.id,
          notes: notes || null
        });

      if (error) throw error;

      setShowAddModal(false);
      setSelectedUserId('');
      setSelectedPermission('write');
      setNotes('');
      loadDelegations();
    } catch (error: any) {
      logger.error('Error adding delegation:', error.message);
      alert('Failed to add delegation: ' + error.message);
    }
  };

  const removeDelegation = async (delegationId: string) => {
    if (!confirm('Are you sure you want to revoke this access?')) return;

    try {
      const { error } = await supabase
        .from('delegations')
        .delete()
        .eq('id', delegationId);

      if (error) throw error;
      loadDelegations();
    } catch (error: any) {
      logger.error('Error removing delegation:', error.message);
      alert('Failed to remove delegation: ' + error.message);
    }
  };

  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case 'read': return <Eye size={16} className="text-blue-600" />;
      case 'write': return <Edit size={16} className="text-green-600" />;
      case 'admin': return <Shield size={16} className="text-red-600" />;
      default: return null;
    }
  };

  const getPermissionColor = (permission: string) => {
    switch (permission) {
      case 'read': return 'bg-blue-100 text-blue-800';
      case 'write': return 'bg-green-100 text-green-800';
      case 'admin': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Users className="mr-3 text-primary" size={32} />
                Delegate Access
              </h1>
              <p className="mt-2 text-gray-600">
                Share your travel data with assistants or team members
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              <Plus size={20} className="mr-2" />
              Grant Access
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Delegations</p>
                <p className="text-2xl font-bold text-gray-900">{delegations.length}</p>
              </div>
              <UserCheck className="text-primary" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Full Access</p>
                <p className="text-2xl font-bold text-gray-900">
                  {delegations.filter(d => d.permission === 'admin').length}
                </p>
              </div>
              <Shield className="text-red-600" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Edit Access</p>
                <p className="text-2xl font-bold text-gray-900">
                  {delegations.filter(d => d.permission === 'write').length}
                </p>
              </div>
              <Edit className="text-green-600" size={32} />
            </div>
          </div>
        </div>

        {/* Delegations List */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Current Access Grants</h2>
          </div>

          {delegations.length === 0 ? (
            <div className="p-12 text-center">
              <Users size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">No delegations yet</p>
              <p className="text-sm text-gray-500">
                Grant access to your secretary or team members
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {delegations.map((delegation) => (
                <div key={delegation.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
                          <Users size={20} className="text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {delegation.delegate?.full_name || 'Unknown User'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {delegation.delegate?.email}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getPermissionIcon(delegation.permission)}
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPermissionColor(delegation.permission)}`}>
                            {delegation.permission === 'read' && 'View Only'}
                            {delegation.permission === 'write' && 'Can Edit'}
                            {delegation.permission === 'admin' && 'Full Access'}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          Granted {new Date(delegation.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      {delegation.notes && (
                        <p className="mt-2 text-sm text-gray-600 italic">
                          Note: {delegation.notes}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => removeDelegation(delegation.id)}
                      className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Revoke Access"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Permission Explanation */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">Permission Levels</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-start">
              <Eye size={16} className="text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <strong className="text-blue-900">View Only:</strong>
                <span className="text-blue-800"> Can see your trips, meetings, bookings, contacts</span>
              </div>
            </div>
            <div className="flex items-start">
              <Edit size={16} className="text-green-600 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <strong className="text-green-900">Can Edit:</strong>
                <span className="text-green-800"> Can view and modify your data (recommended for secretary)</span>
              </div>
            </div>
            <div className="flex items-start">
              <Shield size={16} className="text-red-600 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <strong className="text-red-900">Full Access:</strong>
                <span className="text-red-800"> Can view, edit, and delete your data (use with caution)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Delegation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Grant Access</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full hover:bg-gray-200"
              >
                ×
              </button>
            </div>

            <form onSubmit={addDelegation} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select User *
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Choose a user...</option>
                  {allUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.full_name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Permission Level *
                </label>
                <select
                  value={selectedPermission}
                  onChange={(e) => setSelectedPermission(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="read">View Only</option>
                  <option value="write">Can Edit (Recommended)</option>
                  <option value="admin">Full Access</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={2}
                  placeholder="e.g., My secretary - can manage all travel"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                >
                  Grant Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DelegationsPage;
