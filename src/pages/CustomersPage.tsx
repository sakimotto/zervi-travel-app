import React, { useState } from 'react';
import { useCustomers, useCustomerCategories } from '../hooks/useSupabase';
import { useAuth } from '../hooks/useAuth';
import {
  Users, Plus, Search, Edit, Trash2, Building2, Mail, Phone, Globe,
  MapPin, DollarSign, Filter, Star, TrendingUp, Package, Store, Factory,
  Truck, ShoppingBag
} from 'lucide-react';
import type { Customer, CustomerCategory } from '../types';

const CustomersPage: React.FC = () => {
  const { user } = useAuth();
  const { data: customers, loading, insert, update, remove } = useCustomers();
  const { data: categories, insert: insertCategory, update: updateCategory } = useCustomerCategories();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');

  const filteredCustomers = customers.filter((customer: Customer) => {
    const matchesSearch =
      customer.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || customer.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || customer.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleAddCustomer = async (customerData: Partial<Customer>, categoryData: Partial<CustomerCategory>) => {
    if (!user) return;

    try {
      const newCustomer = await insert({
        ...customerData,
        user_id: user.id,
      } as any);

      await insertCategory({
        customer_id: newCustomer.id,
        ...categoryData,
      } as any);

      setIsModalOpen(false);
    } catch (error) {
      console.error('Error adding customer:', error);
    }
  };

  const handleUpdateCustomer = async (id: string, customerData: Partial<Customer>, categoryData: Partial<CustomerCategory>) => {
    try {
      await update(id, customerData as any);

      const existingCategory = categories.find((c: CustomerCategory) => c.customer_id === id);
      if (existingCategory) {
        await updateCategory(existingCategory.id, categoryData as any);
      }

      setEditingCustomer(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error updating customer:', error);
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await remove(id);
      } catch (error) {
        console.error('Error deleting customer:', error);
      }
    }
  };

  const getCustomerCategory = (customerId: string) => {
    return categories.find((c: CustomerCategory) => c.customer_id === customerId);
  };

  const getCategoryBadges = (category: CustomerCategory | undefined) => {
    if (!category) return [];

    const badges = [];
    if (category.is_oem) badges.push({ label: 'OEM', icon: Factory, color: 'bg-purple-100 text-purple-800' });
    if (category.is_odm) badges.push({ label: 'ODM', icon: Package, color: 'bg-blue-100 text-blue-800' });
    if (category.is_importer) badges.push({ label: 'Importer', icon: Truck, color: 'bg-green-100 text-green-800' });
    if (category.is_shop_owner) badges.push({ label: 'Shop Owner', icon: Store, color: 'bg-yellow-100 text-yellow-800' });
    if (category.is_retail_chain) badges.push({ label: 'Retail Chain', icon: ShoppingBag, color: 'bg-red-100 text-red-800' });
    if (category.is_manufacturing_outsource) badges.push({ label: 'Thai Mfg', icon: Building2, color: 'bg-teal-100 text-teal-800' });
    if (category.is_distributor) badges.push({ label: 'Distributor', icon: TrendingUp, color: 'bg-indigo-100 text-indigo-800' });
    if (category.is_wholesaler) badges.push({ label: 'Wholesaler', icon: Package, color: 'bg-gray-100 text-gray-800' });

    return badges;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'text-red-600 bg-red-100';
      case 'High': return 'text-orange-600 bg-orange-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-green-600 bg-green-100';
      case 'Prospect': return 'text-blue-600 bg-blue-100';
      case 'Lead': return 'text-yellow-600 bg-yellow-100';
      case 'Inactive': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="text-primary" />
              Customer CRM
            </h1>
            <p className="text-gray-600 mt-1">Manage your customer relationships and leads</p>
          </div>
          <button
            onClick={() => {
              setEditingCustomer(null);
              setIsModalOpen(true);
            }}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Add Customer
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary appearance-none"
              >
                <option value="All">All Status</option>
                <option value="Lead">Lead</option>
                <option value="Prospect">Prospect</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="relative">
              <Star className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary appearance-none"
              >
                <option value="All">All Priority</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer: Customer) => {
            const category = getCustomerCategory(customer.id);
            const badges = getCategoryBadges(category);

            return (
              <div key={customer.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{customer.company_name}</h3>
                    {customer.contact_person && (
                      <p className="text-gray-600 text-sm">{customer.contact_person}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingCustomer(customer);
                        setIsModalOpen(true);
                      }}
                      className="text-primary hover:text-primary/80 p-1"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteCustomer(customer.id)}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {customer.email && (
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <Mail size={16} />
                      <span className="truncate">{customer.email}</span>
                    </div>
                  )}
                  {customer.phone && (
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <Phone size={16} />
                      <span>{customer.phone}</span>
                    </div>
                  )}
                  {customer.city && (
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <MapPin size={16} />
                      <span>{customer.city}, {customer.country}</span>
                    </div>
                  )}
                  {customer.estimated_value && customer.estimated_value > 0 && (
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <DollarSign size={16} />
                      <span className="font-semibold">${customer.estimated_value.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {badges.slice(0, 3).map((badge, index) => {
                    const Icon = badge.icon;
                    return (
                      <span key={index} className={`${badge.color} px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1`}>
                        <Icon size={12} />
                        {badge.label}
                      </span>
                    );
                  })}
                  {badges.length > 3 && (
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                      +{badges.length - 3} more
                    </span>
                  )}
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <span className={`${getStatusColor(customer.status)} px-3 py-1 rounded-full text-xs font-medium`}>
                    {customer.status}
                  </span>
                  <span className={`${getPriorityColor(customer.priority)} px-3 py-1 rounded-full text-xs font-medium`}>
                    {customer.priority}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No customers found</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <CustomerModal
          customer={editingCustomer}
          category={editingCustomer ? getCustomerCategory(editingCustomer.id) : undefined}
          onClose={() => {
            setIsModalOpen(false);
            setEditingCustomer(null);
          }}
          onSave={editingCustomer ? handleUpdateCustomer : handleAddCustomer}
        />
      )}
    </div>
  );
};

interface CustomerModalProps {
  customer: Customer | null;
  category: CustomerCategory | undefined;
  onClose: () => void;
  onSave: (id: string, customerData: Partial<Customer>, categoryData: Partial<CustomerCategory>) => void | Promise<void>;
}

const CustomerModal: React.FC<CustomerModalProps> = ({ customer, category, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Customer>>({
    company_name: customer?.company_name || '',
    contact_person: customer?.contact_person || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    website: customer?.website || '',
    country: customer?.country || '',
    city: customer?.city || '',
    address: customer?.address || '',
    notes: customer?.notes || '',
    status: customer?.status || 'Lead',
    priority: customer?.priority || 'Medium',
    estimated_value: customer?.estimated_value || 0,
  });

  const [categoryData, setCategoryData] = useState<Partial<CustomerCategory>>({
    is_oem: category?.is_oem || false,
    is_odm: category?.is_odm || false,
    is_importer: category?.is_importer || false,
    is_shop_owner: category?.is_shop_owner || false,
    is_retail_chain: category?.is_retail_chain || false,
    is_manufacturing_outsource: category?.is_manufacturing_outsource || false,
    is_distributor: category?.is_distributor || false,
    is_wholesaler: category?.is_wholesaler || false,
    category_notes: category?.category_notes || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (customer) {
      await onSave(customer.id, formData, categoryData);
    } else {
      await onSave('', formData, categoryData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {customer ? 'Edit Customer' : 'Add New Customer'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="Lead">Lead</option>
                    <option value="Prospect">Prospect</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Value (USD)
                  </label>
                  <input
                    type="number"
                    value={formData.estimated_value}
                    onChange={(e) => setFormData({ ...formData, estimated_value: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Categories</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={categoryData.is_oem}
                    onChange={(e) => setCategoryData({ ...categoryData, is_oem: e.target.checked })}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-gray-700">OEM (Original Equipment Manufacturer)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={categoryData.is_odm}
                    onChange={(e) => setCategoryData({ ...categoryData, is_odm: e.target.checked })}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-gray-700">ODM (Original Design Manufacturer)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={categoryData.is_importer}
                    onChange={(e) => setCategoryData({ ...categoryData, is_importer: e.target.checked })}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-gray-700">Importer</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={categoryData.is_shop_owner}
                    onChange={(e) => setCategoryData({ ...categoryData, is_shop_owner: e.target.checked })}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-gray-700">Shop Owner</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={categoryData.is_retail_chain}
                    onChange={(e) => setCategoryData({ ...categoryData, is_retail_chain: e.target.checked })}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-gray-700">Retail Chain</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={categoryData.is_manufacturing_outsource}
                    onChange={(e) => setCategoryData({ ...categoryData, is_manufacturing_outsource: e.target.checked })}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-gray-700">Thai Manufacturing Outsource</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={categoryData.is_distributor}
                    onChange={(e) => setCategoryData({ ...categoryData, is_distributor: e.target.checked })}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-gray-700">Distributor</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={categoryData.is_wholesaler}
                    onChange={(e) => setCategoryData({ ...categoryData, is_wholesaler: e.target.checked })}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-gray-700">Wholesaler</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Add any additional notes..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              {customer ? 'Update Customer' : 'Add Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomersPage;
