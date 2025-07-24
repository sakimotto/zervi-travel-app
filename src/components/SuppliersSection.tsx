import React, { useState, useEffect } from 'react';
import { Supplier } from '../types';
import { sampleSuppliers } from '../data/suppliers';
import { Search, Plus, Building2, Mail, Phone, MapPin, Star, Edit, Trash2, Download, Upload, Database, Save, AlertCircle, X, Copy } from 'lucide-react';
import AddSupplierModal from './AddSupplierModal';
import { saveAs } from 'file-saver';
import { exportToWord } from '../utils/wordExport';
import { useSuppliers } from '../hooks/useSupabase';

const SuppliersSection: React.FC = () => {
  // Use Supabase backend for all data operations
  const { data: suppliers, loading, insert, update, remove, refetch } = useSuppliers();
  
  // Fallback to sample data if Supabase is empty
  const [localSuppliers, setLocalSuppliers] = useState<Supplier[]>(sampleSuppliers);
  
  // Use Supabase data if available, otherwise use sample data
  const displaySuppliers = suppliers.length > 0 ? suppliers : localSuppliers;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [duplicatingSupplier, setDuplicatingSupplier] = useState<Supplier | null>(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  // Extract unique industries for filter
  const industries = ['All', ...new Set(displaySuppliers.map(supplier => supplier.industry))];
  const statuses = ['All', 'Active', 'Potential', 'Inactive'];

  // Load sample data into Supabase if database is empty
  useEffect(() => {
    const loadSampleDataIfEmpty = async () => {
      if (!loading && suppliers.length === 0) {
        try {
          console.log('Loading sample suppliers data into Supabase...');
          for (const supplier of sampleSuppliers) {
            await insert(supplier);
          }
          await refetch();
        } catch (error) {
          console.error('Error loading sample data:', error);
          setLocalSuppliers(sampleSuppliers);
        }
      }
    };
    
    loadSampleDataIfEmpty();
  }, [loading, suppliers.length]);

  const filteredSuppliers = displaySuppliers.filter(supplier => {
    const matchesSearch = supplier.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.products.some(product => product.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesIndustry = selectedIndustry === 'All' || supplier.industry === selectedIndustry;
    const matchesStatus = selectedStatus === 'All' || supplier.status === selectedStatus;
    
    return matchesSearch && matchesIndustry && matchesStatus;
  });

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setDuplicatingSupplier(null);
    setShowAddModal(true);
  };

  const handleDuplicateSupplier = (supplier: Supplier) => {
    setDuplicatingSupplier(supplier);
    setEditingSupplier(null);
    setShowAddModal(true);
  };

  const handleDeleteSupplier = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await remove(id);
      } catch (error) {
        console.error('Error deleting supplier:', error);
        alert('Failed to delete supplier. Please try again.');
      }
    }
  };

  const handleSaveSupplier = async (supplier: Supplier) => {
    if (editingSupplier) {
      try {
        await update(supplier.id, supplier);
      } catch (error) {
        console.error('Error updating supplier:', error);
        alert('Failed to update supplier. Please try again.');
      }
      setEditingSupplier(null);
    } else {
      try {
        await insert(supplier);
      } catch (error) {
        console.error('Error creating supplier:', error);
        alert('Failed to create supplier. Please try again.');
      }
    }
    setDuplicatingSupplier(null);
    setShowAddModal(false);
  };

  const exportSuppliers = () => {
    const dataStr = JSON.stringify(suppliers, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    saveAs(blob, `china-suppliers-${new Date().toISOString().split('T')[0]}.json`);
  };

  const exportSuppliersToWord = () => {
    const emptyItinerary: any[] = [];
    const emptyContacts: any[] = [];
    const emptyExpenses: any[] = [];
    
    exportToWord(emptyItinerary, suppliers, emptyContacts, emptyExpenses);
  };

  const importSuppliers = (event: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const parsedData = JSON.parse(content);
        
        if (!Array.isArray(parsedData)) {
          throw new Error('Imported file does not contain a valid suppliers array');
        }

        if (parsedData.length > 0) {
          const firstItem = parsedData[0];
          if (!firstItem.id || !firstItem.companyName || !firstItem.contactPerson) {
            throw new Error('Imported suppliers data is missing required fields');
          }
        }

        if (window.confirm(`Are you sure you want to import these suppliers? This will replace your current suppliers.`)) {
          // Clear existing data and insert new items
          for (const existingSupplier of suppliers) {
            await remove(existingSupplier.id);
          }
          for (const newSupplier of parsedData) {
            await insert(newSupplier);
          }
          await refetch();
        }
      } catch (error) {
        console.error('Error importing suppliers:', error);
        setImportError('The selected file is not a valid suppliers export. Please select a correctly formatted JSON file.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const resetToSampleData = () => {
    // Clear existing data and insert sample data
    Promise.all([
      ...displaySuppliers.map(supplier => remove(supplier.id)),
      ...sampleSuppliers.map(supplier => insert(supplier))
    ]).then(() => {
      refetch();
    }).catch(error => {
      console.error('Error resetting to sample data:', error);
      alert('Failed to reset data. Please try again.');
    });
    setShowConfirmReset(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Potential':
        return 'bg-yellow-100 text-yellow-800';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  return (
    <section id="suppliers" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-primary font-montserrat mb-3">Supplier Directory</h2>
          <p className="text-base text-gray-700 max-w-3xl mx-auto">
            Manage your network of Chinese suppliers and manufacturers
          </p>
        </div>

        <div className="mb-8 flex flex-col lg:flex-row gap-4 justify-between">
          <div className="flex flex-col md:flex-row gap-4 md:items-center">
            <div className="relative md:w-64">
              <input
                type="text"
                placeholder="Search suppliers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            
            <div className="flex gap-2">
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                {industries.map(industry => (
                  <option key={industry} value={industry}>
                    {industry === 'All' ? 'All Industries' : industry}
                  </option>
                ))}
              </select>
              
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'All' ? 'All Status' : status}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setEditingSupplier(null);
                setDuplicatingSupplier(null);
                setShowAddModal(true);
              }}
              className="flex items-center bg-secondary hover:bg-secondary/90 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={20} className="mr-2" />
              Add Supplier
            </button>
            
            <div className="flex items-center gap-2">
              <button
                onClick={exportSuppliers}
                className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-lg transition-colors"
                title="Export suppliers"
              >
                <Download size={18} className="mr-1" />
                <span className="hidden sm:inline">Export</span>
              </button>
              
              <button
                onClick={exportSuppliersToWord}
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
                  onChange={importSuppliers} 
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

        {filteredSuppliers.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredSuppliers.map(supplier => (
              <div key={supplier.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{supplier.company_name}</h3>
                    <p className="text-gray-600">{supplier.industry}</p>
                    {renderStars(supplier.rating)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(supplier.status)}`}>
                      {supplier.status}
                    </span>
                    <button
                      onClick={() => handleEditSupplier(supplier)}
                      className="p-1 rounded-full hover:bg-gray-100"
                      aria-label="Edit supplier"
                    >
                      <Edit size={16} className="text-blue-500" />
                    </button>
                    <button
                      onClick={() => handleDuplicateSupplier(supplier)}
                      className="p-1 rounded-full hover:bg-gray-100"
                      aria-label="Duplicate supplier"
                    >
                      <Copy size={16} className="text-green-500" />
                    </button>
                    <button
                      onClick={() => handleDeleteSupplier(supplier.id)}
                      className="p-1 rounded-full hover:bg-gray-100"
                      aria-label="Delete supplier"
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start">
                    <Building2 size={16} className="text-gray-500 mt-1 mr-2" />
                    <div>
                      <p className="font-medium text-gray-900">{supplier.contact_person}</p>
                      <p className="text-sm text-gray-600">{supplier.city}, {supplier.province}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Mail size={16} className="text-gray-500 mr-2" />
                    <a href={`mailto:${supplier.email}`} className="text-secondary hover:text-primary">
                      {supplier.email}
                    </a>
                  </div>

                  <div className="flex items-center">
                    <Phone size={16} className="text-gray-500 mr-2" />
                    <a href={`tel:${supplier.phone}`} className="text-secondary hover:text-primary">
                      {supplier.phone}
                    </a>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Products:</p>
                    <div className="flex flex-wrap gap-1">
                      {supplier.products.slice(0, 3).map((product, index) => (
                        <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                          {product}
                        </span>
                      ))}
                      {supplier.products.length > 3 && (
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                          +{supplier.products.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {supplier.minimum_order && (
                    <div>
                      <p className="text-sm text-gray-500">Min Order: <span className="font-medium">{supplier.minimum_order}</span></p>
                    </div>
                  )}

                  {supplier.lead_time && (
                    <div>
                      <p className="text-sm text-gray-500">Lead Time: <span className="font-medium">{supplier.lead_time}</span></p>
                    </div>
                  )}

                  {supplier.notes && (
                    <div className="border-t pt-3 mt-3">
                      <p className="text-sm text-gray-600 italic">{supplier.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">No suppliers found matching your criteria.</p>
            <button 
              onClick={() => {setSearchTerm(''); setSelectedIndustry('All'); setSelectedStatus('All');}}
              className="mt-4 text-secondary hover:text-primary font-semibold"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {showAddModal && (
        <AddSupplierModal
          onClose={() => {
            setShowAddModal(false);
            setEditingSupplier(null);
            setDuplicatingSupplier(null);
          }}
          onSave={handleSaveSupplier}
          editSupplier={editingSupplier}
          duplicateSupplier={duplicatingSupplier}
        />
      )}

      {showConfirmReset && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Reset Suppliers
              </h3>
              <p className="text-gray-700 mb-6">
                Are you sure you want to reset to the sample suppliers? This will replace all your current suppliers.
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

export default SuppliersSection;