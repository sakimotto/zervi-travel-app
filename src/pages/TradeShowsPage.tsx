import React, { useState } from 'react';
import { useTradeShows } from '../hooks/useSupabase';
import { useAuth } from '../hooks/useAuth';
import { TrendingUp, Plus, Search, Edit, Trash2, Calendar, MapPin, DollarSign, Filter, ExternalLink } from 'lucide-react';
import Drawer from '../components/Drawer';
import { format } from 'date-fns';

const TradeShowsPage: React.FC = () => {
  const { user } = useAuth();
  const { data: tradeShows, loading, insert, update, remove } = useTradeShows();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingShow, setEditingShow] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '', location: '', venue: '', start_date: '', end_date: '', booth_number: '',
    booth_size: '', booth_cost: 0, our_booth_details: '', show_website: '', notes: ''
  });

  const filteredShows = tradeShows.filter((show: any) => {
    return show.name.toLowerCase().includes(searchTerm.toLowerCase()) || show.location?.toLowerCase().includes(searchTerm.toLowerCase()) || show.venue?.toLowerCase().includes(searchTerm.toLowerCase());
  }).sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      if (editingShow) { await update(editingShow.id, formData as any); } else { await insert({ ...formData, user_id: user.id } as any); }
      closeDrawer();
    } catch (error) { console.error('Error saving trade show:', error); }
  };

  const openAddDrawer = () => { setEditingShow(null); setFormData({ name: '', location: '', venue: '', start_date: '', end_date: '', booth_number: '', booth_size: '', booth_cost: 0, our_booth_details: '', show_website: '', notes: '' }); setIsDrawerOpen(true); };
  const openEditDrawer = (show: any) => { setEditingShow(show); setFormData({ name: show.name, location: show.location || '', venue: show.venue || '', start_date: show.start_date, end_date: show.end_date, booth_number: show.booth_number || '', booth_size: show.booth_size || '', booth_cost: show.booth_cost || 0, our_booth_details: show.our_booth_details || '', show_website: show.show_website || '', notes: show.notes || '' }); setIsDrawerOpen(true); };
  const closeDrawer = () => { setIsDrawerOpen(false); setEditingShow(null); };
  const handleDelete = async (id: string) => { if (window.confirm('Delete this trade show?')) { try { await remove(id); } catch (error) { console.error('Error deleting trade show:', error); } } };

  const stats = { total: tradeShows.length, upcoming: tradeShows.filter((s: any) => new Date(s.start_date) > new Date()).length, totalCost: tradeShows.reduce((sum: number, s: any) => sum + (s.booth_cost || 0), 0) };

  if (loading) return (<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div><p className="text-gray-600">Loading trade shows...</p></div></div>);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div><h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2"><TrendingUp className="text-primary" />Trade Shows</h1><p className="text-gray-600 mt-1">Manage SEMA 2025 and other trade show activities</p></div>
          <button onClick={openAddDrawer} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"><Plus size={20} />Add Trade Show</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Total Shows</p><p className="text-2xl font-bold text-gray-900">{stats.total}</p></div><TrendingUp className="text-gray-400" size={32} /></div></div>
          <div className="bg-white rounded-lg shadow-sm p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Upcoming</p><p className="text-2xl font-bold text-blue-600">{stats.upcoming}</p></div><Calendar className="text-blue-400" size={32} /></div></div>
          <div className="bg-white rounded-lg shadow-sm p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Total Booth Cost</p><p className="text-2xl font-bold text-green-600">${stats.totalCost.toLocaleString()}</p></div><DollarSign className="text-green-400" size={32} /></div></div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} /><input type="text" placeholder="Search by name, location, or venue..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShows.map((show: any) => (
            <div key={show.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{show.name}</h3>
                  <p className="text-gray-600 text-sm flex items-center gap-1"><MapPin size={14} />{show.location}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEditDrawer(show)} className="text-primary hover:text-primary/80 p-1" title="Edit"><Edit size={18} /></button>
                  <button onClick={() => handleDelete(show.id)} className="text-red-600 hover:text-red-700 p-1" title="Delete"><Trash2 size={18} /></button>
                </div>
              </div>
              {show.venue && <p className="text-sm text-gray-600 mb-3"><strong>Venue:</strong> {show.venue}</p>}
              <div className="flex items-center gap-2 text-sm text-gray-700 mb-3"><Calendar size={14} />{format(new Date(show.start_date), 'MMM dd')} - {format(new Date(show.end_date), 'MMM dd, yyyy')}</div>
              {show.booth_number && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                  <p className="text-sm text-blue-900"><strong>Booth:</strong> {show.booth_number}</p>
                  {show.booth_size && <p className="text-sm text-blue-700">{show.booth_size}</p>}
                </div>
              )}
              {show.booth_cost > 0 && (
                <div className="flex items-center gap-1 text-sm text-green-700 mb-3"><DollarSign size={14} /><strong>Cost:</strong> ${show.booth_cost.toLocaleString()}</div>
              )}
              {show.show_website && (
                <a href={show.show_website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-primary hover:underline"><ExternalLink size={14} />Visit Website</a>
              )}
              {show.notes && <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded"><strong>Notes:</strong> {show.notes}</div>}
            </div>
          ))}
        </div>
        {filteredShows.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <TrendingUp size={64} className="mx-auto text-gray-400 mb-4" /><h3 className="text-xl font-semibold text-gray-900 mb-2">No trade shows found</h3>
            <p className="text-gray-600 mb-4">{searchTerm ? 'Try adjusting your search' : 'Get started by adding your first trade show'}</p>
            {!searchTerm && <button onClick={openAddDrawer} className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors">Add First Show</button>}
          </div>
        )}
      </div>
      <Drawer isOpen={isDrawerOpen} onClose={closeDrawer} title={editingShow ? 'Edit Trade Show' : 'Add New Trade Show'} size="xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div><h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><TrendingUp size={20} />Show Information</h3>
            <div className="grid grid-cols-1 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Show Name *</label><input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" placeholder="SEMA 2025" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Location *</label><input type="text" required value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" placeholder="Las Vegas, NV" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Venue</label><input type="text" value={formData.venue} onChange={(e) => setFormData({ ...formData, venue: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" placeholder="Las Vegas Convention Center" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label><input type="date" required value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label><input type="date" required value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Show Website</label><input type="url" value={formData.show_website} onChange={(e) => setFormData({ ...formData, show_website: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" placeholder="https://semashow.com" /></div>
            </div>
          </div>
          <div className="border-t pt-6"><h3 className="text-lg font-semibold text-gray-900 mb-4">Booth Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Booth Number</label><input type="text" value={formData.booth_number} onChange={(e) => setFormData({ ...formData, booth_number: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" placeholder="12345" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Booth Size</label><input type="text" value={formData.booth_size} onChange={(e) => setFormData({ ...formData, booth_size: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" placeholder="10x10" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1"><DollarSign size={14} className="inline mr-1" />Booth Cost</label><input type="number" value={formData.booth_cost} onChange={(e) => setFormData({ ...formData, booth_cost: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" placeholder="5000" /></div>
              <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Our Booth Details</label><textarea value={formData.our_booth_details} onChange={(e) => setFormData({ ...formData, our_booth_details: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" placeholder="Booth setup, products on display, staff assigned..." /></div>
              <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Notes</label><textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" placeholder="Key contacts, meetings scheduled, objectives..." /></div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t sticky bottom-0 bg-white">
            <button type="button" onClick={closeDrawer} className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">{editingShow ? 'Update Show' : 'Add Show'}</button>
          </div>
        </form>
      </Drawer>
    </div>
  );
};

export default TradeShowsPage;
