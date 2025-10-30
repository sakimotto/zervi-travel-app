import React, { useState } from 'react';
import { useMeetings, useCustomers, useTrips } from '../hooks/useSupabase';
import { useAuth } from '../hooks/useAuth';
import { Users, Plus, Search, Edit, Trash2, Calendar, Clock, MapPin, Filter, AlertCircle, CheckCircle2, User } from 'lucide-react';
import Drawer from '../components/Drawer';
import { format } from 'date-fns';
import { logger } from '../utils/logger';

const MeetingsPage: React.FC = () => {
  const { user } = useAuth();
  const { data: meetings, loading, insert, update, remove } = useMeetings();
  const { data: customers } = useCustomers();
  const { data: trips } = useTrips();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [tripFilter, setTripFilter] = useState<string>('All');

  const getTripName = (tripId: string | null | undefined) => {
    if (!tripId) return null;
    const trip = trips.find((t: any) => t.id === tripId);
    return trip ? trip.trip_name : null;
  };
  const [formData, setFormData] = useState({
    customer_id: '', title: '', meeting_type: 'Business Meeting', meeting_date: '', meeting_time: '',
    duration_minutes: 60, location: '', attendees: '', agenda: '', meeting_notes: '',
    action_items: '', follow_up_required: false, follow_up_date: '', status: 'Scheduled', priority: 'Medium'
  });

  const filteredMeetings = meetings.filter((m: any) => {
    const matchesSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase()) || m.location?.toLowerCase().includes(searchTerm.toLowerCase()) || m.attendees?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTrip = tripFilter === 'All' || m.trip_id === tripFilter;
    return (statusFilter === 'All' || m.status === statusFilter) && matchesSearch && matchesTrip;
  }).sort((a, b) => new Date(b.meeting_date).getTime() - new Date(a.meeting_date).getTime());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const submitData = { ...formData };
      if (!submitData.customer_id) delete submitData.customer_id;
      if (editingMeeting) { await update(editingMeeting.id, submitData as any); } else { await insert({ ...submitData, user_id: user.id } as any); }
      closeDrawer();
    } catch (error) { logger.error('Error saving meeting:', error); }
  };

  const openAddDrawer = () => { setEditingMeeting(null); setFormData({ customer_id: '', title: '', meeting_type: 'Business Meeting', meeting_date: '', meeting_time: '', duration_minutes: 60, location: '', attendees: '', agenda: '', meeting_notes: '', action_items: '', follow_up_required: false, follow_up_date: '', status: 'Scheduled', priority: 'Medium', trip_id: tripFilter !== 'All' ? tripFilter : null }); setIsDrawerOpen(true); };
  const openEditDrawer = (meeting: any) => { setEditingMeeting(meeting); setFormData({ customer_id: meeting.customer_id || '', title: meeting.title, meeting_type: meeting.meeting_type || 'Business Meeting', meeting_date: meeting.meeting_date, meeting_time: meeting.meeting_time, duration_minutes: meeting.duration_minutes || 60, location: meeting.location || '', attendees: meeting.attendees || '', agenda: meeting.agenda || '', meeting_notes: meeting.meeting_notes || '', action_items: meeting.action_items || '', follow_up_required: meeting.follow_up_required || false, follow_up_date: meeting.follow_up_date || '', status: meeting.status || 'Scheduled', priority: meeting.priority || 'Medium' }); setIsDrawerOpen(true); };
  const closeDrawer = () => { setIsDrawerOpen(false); setEditingMeeting(null); };
  const handleDelete = async (id: string) => { if (window.confirm('Delete this meeting?')) { try { await remove(id); } catch (error) { logger.error('Error deleting meeting:', error); } } };
  
  const getStatusColor = (status: string) => { switch (status) { case 'Scheduled': return 'bg-blue-100 text-blue-800'; case 'Completed': return 'bg-green-100 text-green-800'; case 'Cancelled': return 'bg-red-100 text-red-800'; case 'Rescheduled': return 'bg-yellow-100 text-yellow-800'; default: return 'bg-gray-100 text-gray-800'; } };
  const getPriorityColor = (priority: string) => { switch (priority) { case 'High': return 'bg-red-100 text-red-800'; case 'Medium': return 'bg-yellow-100 text-yellow-800'; case 'Low': return 'bg-green-100 text-green-800'; default: return 'bg-gray-100 text-gray-800'; } };

  const stats = { total: meetings.length, upcoming: meetings.filter((m: any) => new Date(m.meeting_date) >= new Date() && m.status === 'Scheduled').length, completed: meetings.filter((m: any) => m.status === 'Completed').length, followUpNeeded: meetings.filter((m: any) => m.follow_up_required && !m.follow_up_date).length };

  if (loading) return (<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div><p className="text-gray-600">Loading meetings...</p></div></div>);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div><h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2"><Users className="text-primary" />Meetings</h1><p className="text-gray-600 mt-1">Schedule and track professional meetings</p></div>
          <button onClick={openAddDrawer} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"><Plus size={20} />Add Meeting</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Total Meetings</p><p className="text-2xl font-bold text-gray-900">{stats.total}</p></div><Users className="text-gray-400" size={32} /></div></div>
          <div className="bg-white rounded-lg shadow-sm p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Upcoming</p><p className="text-2xl font-bold text-blue-600">{stats.upcoming}</p></div><Calendar className="text-blue-400" size={32} /></div></div>
          <div className="bg-white rounded-lg shadow-sm p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Completed</p><p className="text-2xl font-bold text-green-600">{stats.completed}</p></div><CheckCircle2 className="text-green-400" size={32} /></div></div>
          <div className="bg-white rounded-lg shadow-sm p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Follow-Up Needed</p><p className="text-2xl font-bold text-orange-600">{stats.followUpNeeded}</p></div><AlertCircle className="text-orange-400" size={32} /></div></div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} /><input type="text" placeholder="Search by title, location, or attendees..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" /></div>
            <div className="relative"><Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} /><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary appearance-none"><option value="All">All Status</option><option value="Scheduled">Scheduled</option><option value="Completed">Completed</option><option value="Cancelled">Cancelled</option><option value="Rescheduled">Rescheduled</option></select></div>
          </div>
        </div>
        <div className="space-y-4">
          {filteredMeetings.map((meeting: any) => (
            <div key={meeting.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{meeting.title}</h3>
                    <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(meeting.status)}`}>{meeting.status}</span>
                    <span className={`text-xs font-medium px-2 py-1 rounded ${getPriorityColor(meeting.priority)}`}>{meeting.priority}</span>
                  </div>
                  <p className="text-gray-600 text-sm">{meeting.meeting_type}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEditDrawer(meeting)} className="text-primary hover:text-primary/80 p-1" title="Edit"><Edit size={18} /></button>
                  <button onClick={() => handleDelete(meeting.id)} className="text-red-600 hover:text-red-700 p-1" title="Delete"><Trash2 size={18} /></button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-700"><Calendar size={16} />{format(new Date(meeting.meeting_date), 'MMM dd, yyyy')}</div>
                <div className="flex items-center gap-2 text-sm text-gray-700"><Clock size={16} />{meeting.meeting_time} ({meeting.duration_minutes} min)</div>
                {meeting.location && <div className="flex items-center gap-2 text-sm text-gray-700"><MapPin size={16} />{meeting.location}</div>}
              </div>
              {meeting.attendees && <div className="mb-3 text-sm text-gray-700"><User size={14} className="inline mr-1" /><strong>Attendees:</strong> {meeting.attendees}</div>}
              {meeting.agenda && <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3"><p className="text-sm text-blue-900"><strong>Agenda:</strong></p><p className="text-sm text-blue-800 mt-1 whitespace-pre-wrap">{meeting.agenda}</p></div>}
              {meeting.meeting_notes && <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3"><p className="text-sm text-gray-900"><strong>Notes:</strong></p><p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{meeting.meeting_notes}</p></div>}
              {meeting.action_items && <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3"><p className="text-sm text-yellow-900"><strong>Action Items:</strong></p><p className="text-sm text-yellow-800 mt-1 whitespace-pre-wrap">{meeting.action_items}</p></div>}
              {meeting.follow_up_required && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-orange-900"><AlertCircle size={16} /><strong>Follow-up Required</strong></div>
                  {meeting.follow_up_date && <div className="text-sm text-orange-700">Due: {format(new Date(meeting.follow_up_date), 'MMM dd, yyyy')}</div>}
                </div>
              )}
            </div>
          ))}
        </div>
        {filteredMeetings.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Users size={64} className="mx-auto text-gray-400 mb-4" /><h3 className="text-xl font-semibold text-gray-900 mb-2">No meetings found</h3>
            <p className="text-gray-600 mb-4">{searchTerm || statusFilter !== 'All' ? 'Try adjusting your search or filters' : 'Get started by scheduling your first meeting'}</p>
            {!searchTerm && statusFilter === 'All' && <button onClick={openAddDrawer} className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors">Schedule First Meeting</button>}
          </div>
        )}
      </div>
      <Drawer isOpen={isDrawerOpen} onClose={closeDrawer} title={editingMeeting ? 'Edit Meeting' : 'Schedule New Meeting'} size="xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div><h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><Users size={20} />Meeting Details</h3>
            <div className="grid grid-cols-1 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Title *</label><input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" placeholder="Q1 Review Meeting" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Meeting Type</label><select value={formData.meeting_type} onChange={(e) => setFormData({ ...formData, meeting_type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"><option value="Business Meeting">Business Meeting</option><option value="Sales Call">Sales Call</option><option value="Client Meeting">Client Meeting</option><option value="Internal Review">Internal Review</option><option value="Product Demo">Product Demo</option><option value="Trade Show Meeting">Trade Show Meeting</option><option value="Other">Other</option></select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Customer</label><select value={formData.customer_id} onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"><option value="">None</option>{customers.map((c: any) => <option key={c.id} value={c.id}>{c.company_name}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label><select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"><option value="Scheduled">Scheduled</option><option value="Completed">Completed</option><option value="Cancelled">Cancelled</option><option value="Rescheduled">Rescheduled</option></select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Priority</label><select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"><option value="High">High</option><option value="Medium">Medium</option><option value="Low">Low</option></select></div>
              </div>
            </div>
          </div>
          <div className="border-t pt-6"><h3 className="text-lg font-semibold text-gray-900 mb-4">When & Where</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Date *</label><input type="date" required value={formData.meeting_date} onChange={(e) => setFormData({ ...formData, meeting_date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Time *</label><input type="time" required value={formData.meeting_time} onChange={(e) => setFormData({ ...formData, meeting_time: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label><input type="number" value={formData.duration_minutes} onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 60 })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" placeholder="60" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Location</label><input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" placeholder="Conference Room A / Zoom" /></div>
              <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Attendees</label><input type="text" value={formData.attendees} onChange={(e) => setFormData({ ...formData, attendees: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" placeholder="John Smith, Jane Doe" /></div>
            </div>
          </div>
          <div className="border-t pt-6"><h3 className="text-lg font-semibold text-gray-900 mb-4">Agenda & Notes</h3>
            <div className="grid grid-cols-1 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Agenda</label><textarea value={formData.agenda} onChange={(e) => setFormData({ ...formData, agenda: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" placeholder="1. Review Q4 performance&#10;2. Discuss new product launch&#10;3. Address concerns" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Meeting Notes</label><textarea value={formData.meeting_notes} onChange={(e) => setFormData({ ...formData, meeting_notes: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" placeholder="Key discussion points, decisions made..." /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Action Items</label><textarea value={formData.action_items} onChange={(e) => setFormData({ ...formData, action_items: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" placeholder="- Send follow-up email&#10;- Schedule demo&#10;- Prepare proposal" /></div>
            </div>
          </div>
          <div className="border-t pt-6"><h3 className="text-lg font-semibold text-gray-900 mb-4">Follow-Up</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-4"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={formData.follow_up_required} onChange={(e) => setFormData({ ...formData, follow_up_required: e.target.checked })} className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary" /><span className="text-sm text-gray-700">Follow-up Required</span></label></div>
              {formData.follow_up_required && <div><label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Date</label><input type="date" value={formData.follow_up_date} onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" /></div>}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t sticky bottom-0 bg-white">
            <button type="button" onClick={closeDrawer} className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">{editingMeeting ? 'Update Meeting' : 'Schedule Meeting'}</button>
          </div>
        </form>
      </Drawer>
    </div>
  );
};

export default MeetingsPage;
