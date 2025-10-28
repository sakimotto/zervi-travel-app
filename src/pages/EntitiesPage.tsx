import React, { useState } from 'react';
import { useEntities } from '../hooks/useSupabase';
import { useAuth } from '../hooks/useAuth';
import {
  Users, Plus, Search, Edit, Trash2, Building2, Mail, Phone, Globe,
  MapPin, DollarSign, Filter, Star, Target, Package, User, TrendingUp,
  Shield, Factory, Store, Truck, ShoppingBag
} from 'lucide-react';
import type { Entity } from '../types';
import Drawer from '../components/Drawer';
import EntityForm from '../components/EntityForm';

const EntitiesPage: React.FC = () => {
  const { user } = useAuth();
  const { data: entities, loading, insert, update, remove } = useEntities();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');

  const filteredEntities = entities.filter((entity: Entity) => {
    const matchesSearch =
      entity.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entity.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entity.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      roleFilter === 'All' ||
      (roleFilter === 'Customer' && entity.is_customer) ||
      (roleFilter === 'Supplier' && entity.is_supplier) ||
      (roleFilter === 'Contact' && entity.is_contact) ||
      (roleFilter === 'Partner' && entity.is_partner) ||
      (roleFilter === 'Multi-Role' && [entity.is_customer, entity.is_supplier, entity.is_contact, entity.is_partner].filter(Boolean).length > 1);

    return matchesSearch && matchesRole;
  });

  const handleAddEntity = async (entityData: Partial<Entity>) => {
    if (!user) return;

    try {
      await insert({
        ...entityData,
        user_id: user.id,
      } as any);

      setIsDrawerOpen(false);
    } catch (error) {
      console.error('Error adding entity:', error);
    }
  };

  const handleUpdateEntity = async (id: string, entityData: Partial<Entity>) => {
    try {
      await update(id, entityData as any);
      setEditingEntity(null);
      setIsDrawerOpen(false);
    } catch (error) {
      console.error('Error updating entity:', error);
    }
  };

  const handleDeleteEntity = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this entity? This action cannot be undone.')) {
      try {
        await remove(id);
      } catch (error) {
        console.error('Error deleting entity:', error);
      }
    }
  };

  const openEditDrawer = (entity: Entity) => {
    setEditingEntity(entity);
    setIsDrawerOpen(true);
  };

  const openAddDrawer = () => {
    setEditingEntity(null);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setEditingEntity(null);
  };

  const getRoleBadges = (entity: Entity) => {
    const badges = [];
    if (entity.is_customer) badges.push({ label: 'Customer', icon: Target, color: 'bg-green-100 text-green-800' });
    if (entity.is_supplier) badges.push({ label: 'Supplier', icon: Package, color: 'bg-blue-100 text-blue-800' });
    if (entity.is_contact) badges.push({ label: 'Contact', icon: User, color: 'bg-purple-100 text-purple-800' });
    if (entity.is_partner) badges.push({ label: 'Partner', icon: TrendingUp, color: 'bg-teal-100 text-teal-800' });
    if (entity.is_competitor) badges.push({ label: 'Competitor', icon: Shield, color: 'bg-red-100 text-red-800' });
    return badges;
  };

  const getCategoryBadges = (entity: Entity) => {
    const badges = [];
    if (entity.is_oem) badges.push({ label: 'OEM', icon: Factory });
    if (entity.is_odm) badges.push({ label: 'ODM', icon: Package });
    if (entity.is_importer) badges.push({ label: 'Importer', icon: Truck });
    if (entity.is_shop_owner) badges.push({ label: 'Shop', icon: Store });
    if (entity.is_retail_chain) badges.push({ label: 'Retail', icon: ShoppingBag });
    if (entity.is_manufacturing_outsource) badges.push({ label: 'Thai Mfg', icon: Building2 });
    if (entity.is_distributor) badges.push({ label: 'Distributor', icon: TrendingUp });
    if (entity.is_wholesaler) badges.push({ label: 'Wholesaler', icon: Package });
    return badges;
  };

  const stats = {
    total: entities.length,
    customers: entities.filter((e: Entity) => e.is_customer).length,
    suppliers: entities.filter((e: Entity) => e.is_supplier).length,
    multiRole: entities.filter((e: Entity) =>
      [e.is_customer, e.is_supplier, e.is_contact, e.is_partner].filter(Boolean).length > 1
    ).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading entities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="text-primary" />
              Unified Entities
            </h1>
            <p className="text-gray-600 mt-1">
              One contact, multiple roles - No duplicate data
            </p>
          </div>
          <button
            onClick={openAddDrawer}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Add Entity
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Entities</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Users className="text-gray-400" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Customers</p>
                <p className="text-2xl font-bold text-green-600">{stats.customers}</p>
              </div>
              <Target className="text-green-400" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Suppliers</p>
                <p className="text-2xl font-bold text-blue-600">{stats.suppliers}</p>
              </div>
              <Package className="text-blue-400" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Multi-Role</p>
                <p className="text-2xl font-bold text-purple-600">{stats.multiRole}</p>
              </div>
              <TrendingUp className="text-purple-400" size={32} />
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by company name, contact, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary appearance-none"
              >
                <option value="All">All Roles</option>
                <option value="Customer">Customers Only</option>
                <option value="Supplier">Suppliers Only</option>
                <option value="Contact">Contacts Only</option>
                <option value="Partner">Partners Only</option>
                <option value="Multi-Role">Multi-Role Entities</option>
              </select>
            </div>
          </div>
        </div>

        {/* Entity Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEntities.map((entity: Entity) => {
            const roleBadges = getRoleBadges(entity);
            const categoryBadges = getCategoryBadges(entity);

            return (
              <div key={entity.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{entity.company_name}</h3>
                    {entity.contact_person && (
                      <p className="text-gray-600 text-sm flex items-center gap-1">
                        <User size={14} />
                        {entity.contact_person}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditDrawer(entity)}
                      className="text-primary hover:text-primary/80 p-1"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteEntity(entity.id)}
                      className="text-red-600 hover:text-red-700 p-1"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  {entity.email && (
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <Mail size={16} />
                      <span className="truncate">{entity.email}</span>
                    </div>
                  )}
                  {entity.phone && (
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <Phone size={16} />
                      <span>{entity.phone}</span>
                    </div>
                  )}
                  {entity.city && (
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <MapPin size={16} />
                      <span>{entity.city}, {entity.country || entity.state_province}</span>
                    </div>
                  )}
                  {entity.website && (
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <Globe size={16} />
                      <a
                        href={entity.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline truncate"
                      >
                        {entity.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                </div>

                {/* Role Badges */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {roleBadges.map((badge, index) => {
                    const Icon = badge.icon;
                    return (
                      <span key={index} className={`${badge.color} px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1`}>
                        <Icon size={12} />
                        {badge.label}
                      </span>
                    );
                  })}
                </div>

                {/* Category Badges (if customer) */}
                {entity.is_customer && categoryBadges.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3 pb-3 border-b border-gray-200">
                    {categoryBadges.slice(0, 3).map((badge, index) => {
                      const Icon = badge.icon;
                      return (
                        <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs flex items-center gap-1">
                          <Icon size={10} />
                          {badge.label}
                        </span>
                      );
                    })}
                    {categoryBadges.length > 3 && (
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                        +{categoryBadges.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Status Info */}
                <div className="flex gap-2 text-xs">
                  {entity.is_customer && entity.customer_status && (
                    <span className="bg-green-50 text-green-700 px-2 py-1 rounded">
                      {entity.customer_status}
                    </span>
                  )}
                  {entity.is_supplier && entity.supplier_status && (
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">
                      {entity.supplier_status}
                    </span>
                  )}
                  {entity.is_supplier && entity.supplier_rating && entity.supplier_rating > 0 && (
                    <span className="bg-yellow-50 text-yellow-700 px-2 py-1 rounded flex items-center gap-1">
                      <Star size={10} fill="currentColor" />
                      {entity.supplier_rating.toFixed(1)}
                    </span>
                  )}
                  {entity.is_customer && entity.estimated_value && entity.estimated_value > 0 && (
                    <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded flex items-center gap-1">
                      <DollarSign size={10} />
                      {entity.estimated_value.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredEntities.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Users size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No entities found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || roleFilter !== 'All'
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first entity'}
            </p>
            {!searchTerm && roleFilter === 'All' && (
              <button
                onClick={openAddDrawer}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Add First Entity
              </button>
            )}
          </div>
        )}
      </div>

      {/* Drawer with Entity Form */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        title={editingEntity ? 'Edit Entity' : 'Add New Entity'}
        size="xl"
      >
        <EntityForm
          entity={editingEntity}
          onSubmit={(data) =>
            editingEntity
              ? handleUpdateEntity(editingEntity.id, data)
              : handleAddEntity(data)
          }
          onCancel={closeDrawer}
        />
      </Drawer>
    </div>
  );
};

export default EntitiesPage;
