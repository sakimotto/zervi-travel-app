import React, { useState, useEffect } from 'react';
import { BusinessContact } from '../types';
import { sampleBusinessContacts } from '../data/businessContacts';
import { Search, Plus, User, Mail, Phone, MapPin, Edit, Trash2, Download, Upload, Database, AlertCircle, X } from 'lucide-react';
import AddBusinessContactModal from './AddBusinessContactModal';
import { saveAs } from 'file-saver';
import { exportToWord } from '../utils/wordExport';
import { useBusinessContacts, useSuppliers } from '../hooks/useSupabase';

const BusinessContactsSection: React.FC = () => {
  // Use Supabase backend for all data operations
  const { data: contacts, loading, insert, update, remove, refetch } = useBusinessContacts();
  
  // Fallback to sample data if Supabase is empty
  const [localContacts, setLocalContacts] = useState<BusinessContact[]>(sampleBusinessContacts);
  
  // Use Supabase data if available, otherwise use sample data
  const displayContacts = contacts.length > 0 ? contacts : localContacts;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRelationship, setSelectedRelationship] = useState('All');
  const [selectedImportance, setSelectedImportance] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingContact, setEditingContact] = useState<BusinessContact | null>(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const relationships = ['All', 'Client', 'Supplier', 'Partner', 'Government', 'Service Provider', 'Other'];
  const importanceLevels = ['All', 'High', 'Medium', 'Low'];
  
  // Get suppliers for linking
  const { data: displaySuppliers } = useSuppliers();

  // Load sample data into Supabase if database is empty
  useEffect(() => {
    const loadSampleDataIfEmpty = async () => {
      if (!loading && contacts.length === 0) {
        try {
          console.log('Loading sample contacts data into Supabase...');
          for (const contact of sampleBusinessContacts) {
            await insert(contact);
          }
          await refetch();
        } catch (error) {
          console.error('Error loading sample data:', error);
          setLocalContacts(sampleBusinessContacts);
        }
      }
    };
    
    loadSampleDataIfEmpty();
  }, [loading, contacts.length]);

  const filteredContacts = displayContacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRelationship = selectedRelationship === 'All' || contact.relationship === selectedRelationship;
    const matchesImportance = selectedImportance === 'All' || contact.importance === selectedImportance;
    
    return matchesSearch && matchesRelationship && matchesImportance;
  });

  const handleEditContact = (contact: BusinessContact) => {
    setEditingContact(contact);
    setShowAddModal(true);
  };

  const handleDeleteContact = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await remove(id);
      } catch (error) {
        console.error('Error deleting contact:', error);
        alert('Failed to delete contact. Please try again.');
      }
    }
  };

  const handleSaveContact = async (contact: BusinessContact) => {
    if (editingContact) {
      try {
        await update(contact.id, contact);
      } catch (error) {
        console.error('Error updating contact:', error);
        alert('Failed to update contact. Please try again.');
      }
      setEditingContact(null);
    } else {
      try {
        await insert(contact);
      } catch (error) {
        console.error('Error creating contact:', error);
        alert('Failed to create contact. Please try again.');
      }
    }
    setShowAddModal(false);
  };

  const exportContacts = () => {
    const dataStr = JSON.stringify(contacts, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    saveAs(blob, `business-contacts-${new Date().toISOString().split('T')[0]}.json`);
  };

  const exportContactsToWord = () => {
    const emptyItinerary: any[] = [];
    const emptySuppliers: any[] = [];
    const emptyExpenses: any[] = [];
    
    exportToWord(emptyItinerary, emptySuppliers, contacts, emptyExpenses);
  };

  const importContacts = (event: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const parsedData = JSON.parse(content);
        
        if (!Array.isArray(parsedData)) {
          throw new Error('Imported file does not contain a valid contacts array');
        }

        if (parsedData.length > 0) {
          const firstItem = parsedData[0];
          if (!firstItem.id || !firstItem.name || !firstItem.company) {
            throw new Error('Imported contacts data is missing required fields');
          }
        }

        if (window.confirm(`Are you sure you want to import these contacts? This will replace your current contacts.`)) {
          // Clear existing data and insert new items
          for (const existingContact of contacts) {
            await remove(existingContact.id);
          }
          for (const newContact of parsedData) {
            await insert(newContact);
          }
          await refetch();
        }
      } catch (error) {
        console.error('Error importing contacts:', error);
        setImportError('The selected file is not a valid contacts export. Please select a correctly formatted JSON file.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const resetToSampleData = () => {
    // Clear existing data and insert sample data
    Promise.all([
      ...displayContacts.map(contact => remove(contact.id)),
      ...sampleBusinessContacts.map(contact => insert(contact))
    ]).then(() => {
      refetch();
    }).catch(error => {
      console.error('Error resetting to sample data:', error);
      alert('Failed to reset data. Please try again.');
    });
    setShowConfirmReset(false);
  };

  const getRelationshipColor = (relationship: string) => {
    switch (relationship) {
      case 'Client':
        return 'bg-blue-100 text-blue-800';
      case 'Supplier':
        return 'bg-green-100 text-green-800';
      case 'Partner':
        return 'bg-purple-100 text-purple-800';
      case 'Government':
        return 'bg-red-100 text-red-800';
      case 'Service Provider':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <section id="contacts" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-primary font-montserrat mb-3">Business Contacts</h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Manage your professional network and business relationships in China
          </p>
        </div>

        <div className="mb-8 flex flex-col lg:flex-row gap-4 justify-between">
          <div className="flex flex-col md:flex-row gap-4 md:items-center">
            <div className="relative md:w-64">
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            
            <div className="flex gap-2">
              <select
                value={selectedRelationship}
                onChange={(e) => setSelectedRelationship(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                {relationships.map(relationship => (
                  <option key={relationship} value={relationship}>
                    {relationship === 'All' ? 'All Relationships' : relationship}
                  </option>
                ))}
              </select>
              
              <select
                value={selectedImportance}
                onChange={(e) => setSelectedImportance(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                {importanceLevels.map(importance => (
                  <option key={importance} value={importance}>
                    {importance === 'All' ? 'All Importance' : importance}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setEditingContact(null);
                setShowAddModal(true);
              }}
              className="flex items-center bg-secondary hover:bg-secondary/90 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={20} className="mr-2" />
              Add Contact
            </button>
            
            <div className="flex items-center gap-2">
              <button
                onClick={exportContacts}
                className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-lg transition-colors"
                title="Export contacts"
              >
                <Download size={18} className="mr-1" />
                <span className="hidden sm:inline">Export</span>
              </button>
              
              <button
                onClick={exportContactsToWord}
                className="flex items-center bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-2 rounded-lg transition-colors"
                title="Export as Word document"
              >
                <Download size={18} className="mr-1" />
                <span className="hidden sm:inline">Word</span>
              </button>
              
              <label className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-lg transition-colors cursor-pointer">
                <Upload size={18} className="mr-1" />
                <span className="hidden sm:inline">Import</span>
                <input 
                  type="file" 
                  accept=".json" 
                  onChange={importContacts} 
                  className="hidden" 
                />
              </label>
              
              <button
                onClick={() => setShowConfirmReset(true)}
                className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-lg transition-colors"
                title="Reset to sample data"
              >
                <Database size={18} className="mr-1" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
          </div>
        </div>

        {importError && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-6 flex items-start">
            <AlertCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Import Error</p>
              <p className="text-sm">{importError}</p>
            </div>
            <button 
              className="ml-auto text-red-600 hover:text-red-800"
              onClick={() => setImportError(null)}
            >
              <X size={20} />
            </button>
          </div>
        )}

        {filteredContacts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContacts.map(contact => (
              <div key={contact.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mr-3">
                      <User size={24} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{contact.name}</h3>
                      {contact.nickname && (
                        <p className="text-sm text-gray-500 italic">"{contact.nickname}"</p>
                      )}
                      <p className="text-sm text-gray-600">{contact.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditContact(contact)}
                      className="p-1 rounded-full hover:bg-gray-100"
                      aria-label="Edit contact"
                    >
                      <Edit size={16} className="text-blue-500" />
                    </button>
                    <button
                      onClick={() => handleDeleteContact(contact.id)}
                      className="p-1 rounded-full hover:bg-gray-100"
                      aria-label="Delete contact"
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-gray-900">{contact.company}</p>
                    <p className="text-sm text-gray-600">{contact.industry}</p>
                  </div>

                  <div className="flex items-center">
                    <Mail size={16} className="text-gray-500 mr-2" />
                    <a href={`mailto:${contact.email}`} className="text-secondary hover:text-primary text-sm">
                      {contact.email}
                    </a>
                  </div>

                  <div className="flex items-center">
                    <Phone size={16} className="text-gray-500 mr-2" />
                    <a href={`tel:${contact.phone}`} className="text-secondary hover:text-primary text-sm">
                      {contact.phone}
                    </a>
                  </div>

                  <div className="flex items-center">
                    <MapPin size={16} className="text-gray-500 mr-2" />
                    <span className="text-sm text-gray-600">{contact.city}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRelationshipColor(contact.relationship)}`}>
                      {contact.relationship}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImportanceColor(contact.importance)}`}>
                      {contact.importance}
                    </span>
                  </div>

                  {contact.wechat && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">WeChat:</span> {contact.wechat}
                    </div>
                  )}

                  {contact.notes && (
                    <div className="border-t pt-3 mt-3">
                      <p className="text-sm text-gray-600 italic">{contact.notes}</p>
                    </div>
                  )}

                  {contact.linked_supplier_id && (
                    <div className="border-t pt-3 mt-3">
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Linked Supplier:</span> 
                        {(() => {
                          const linkedSupplier = displaySuppliers.find(s => s.id === contact.linked_supplier_id);
                          return linkedSupplier ? linkedSupplier.company_name : 'Unknown Supplier';
                        })()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">No contacts found matching your criteria.</p>
            <button 
              onClick={() => {setSearchTerm(''); setSelectedRelationship('All'); setSelectedImportance('All');}}
              className="mt-4 text-secondary hover:text-primary font-semibold"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {showAddModal && (
        <AddBusinessContactModal
          onClose={() => {
            setShowAddModal(false);
            setEditingContact(null);
          }}
          onSave={handleSaveContact}
          editContact={editingContact}
        />
      )}

      {showConfirmReset && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Reset Contacts
              </h3>
              <p className="text-gray-700 mb-6">
                Are you sure you want to reset to the sample contacts? This will replace all your current contacts.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={resetToSampleData}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default BusinessContactsSection;