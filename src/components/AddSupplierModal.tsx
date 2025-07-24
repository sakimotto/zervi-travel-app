import React, { useState, useEffect } from 'react';
import { Supplier } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { X, Plus, Trash2 } from 'lucide-react';

interface AddSupplierModalProps {
  onClose: () => void;
  onSave: (supplier: Supplier) => void;
  editSupplier: Supplier | null;
  duplicateSupplier?: Supplier | null;
}

const AddSupplierModal: React.FC<AddSupplierModalProps> = ({ onClose, onSave, editSupplier, duplicateSupplier }) => {
  const [formData, setFormData] = useState<Supplier>({
    id: '',
    company_name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    industry: '',
    products: [''],
    certifications: [''],
    minimum_order: '',
    payment_terms: '',
    lead_time: '',
    notes: '',
    website: '',
    established: '',
    employees: '',
    rating: 0,
    last_contact: '',
    status: 'Potential',
  });

  const [products, setProducts] = useState<string[]>(['']);
  const [certifications, setCertifications] = useState<string[]>(['']);

  useEffect(() => {
    if (editSupplier) {
      setFormData(editSupplier);
      setProducts(editSupplier.products.length > 0 ? editSupplier.products : ['']);
      setCertifications(editSupplier.certifications.length > 0 ? editSupplier.certifications : ['']);
    } else if (duplicateSupplier) {
      // Pre-fill form with duplicate supplier data but generate new ID and clear personal fields
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        ...duplicateSupplier,
        id: uuidv4(),
        contact_person: '', // Clear personal contact name
        email: '', // Clear personal email
        phone: '', // Clear personal phone
        notes: '', // Clear personal notes
        last_contact: today, // Set to today
        rating: 0, // Reset rating
        status: 'Potential', // Reset status
      });
      setProducts(duplicateSupplier.products.length > 0 ? duplicateSupplier.products : ['']);
      setCertifications(duplicateSupplier.certifications.length > 0 ? duplicateSupplier.certifications : ['']);
    } else {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        id: uuidv4(),
        company_name: '',
        contact_person: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        province: '',
        industry: '',
        products: [''],
        certifications: [''],
        minimum_order: '',
        payment_terms: '',
        lead_time: '',
        notes: '',
        website: '',
        established: '',
        employees: '',
        rating: 0,
        last_contact: today,
        status: 'Potential',
      });
      setProducts(['']);
      setCertifications(['']);
    }
  }, [editSupplier, duplicateSupplier]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProductChange = (index: number, value: string) => {
    const newProducts = [...products];
    newProducts[index] = value;
    setProducts(newProducts);
  };

  const addProduct = () => {
    setProducts([...products, '']);
  };

  const removeProduct = (index: number) => {
    if (products.length > 1) {
      const newProducts = [...products];
      newProducts.splice(index, 1);
      setProducts(newProducts);
    }
  };

  const handleCertificationChange = (index: number, value: string) => {
    const newCertifications = [...certifications];
    newCertifications[index] = value;
    setCertifications(newCertifications);
  };

  const addCertification = () => {
    setCertifications([...certifications, '']);
  };

  const removeCertification = (index: number) => {
    if (certifications.length > 1) {
      const newCertifications = [...certifications];
      newCertifications.splice(index, 1);
      setCertifications(newCertifications);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const filteredProducts = products.filter(product => product.trim() !== '');
    const filteredCertifications = certifications.filter(cert => cert.trim() !== '');
    
    onSave({
      ...formData,
      id: formData.id || uuidv4(),
      products: filteredProducts.length > 0 ? filteredProducts : ['General Products'],
      certifications: filteredCertifications,
      rating: Number(formData.rating),
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-semibold text-gray-900">
            {editSupplier ? 'Edit Supplier' : duplicateSupplier ? 'Duplicate Supplier' : 'Add New Supplier'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name *
              </label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Person *
              </label>
              <input
                type="text"
                name="contact_person"
                value={formData.contact_person}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Province *
              </label>
              <input
                type="text"
                name="province"
                value={formData.province}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Industry *
              </label>
              <input
                type="text"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Products/Services
            </label>
            {products.map((product, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={product}
                  onChange={(e) => handleProductChange(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="E.g., Electronics, Textiles"
                />
                <button
                  type="button"
                  onClick={() => removeProduct(index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                  disabled={products.length <= 1}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addProduct}
              className="mt-2 flex items-center text-secondary hover:text-primary"
            >
              <Plus size={18} className="mr-1" /> Add Product
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Certifications
            </label>
            {certifications.map((cert, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={cert}
                  onChange={(e) => handleCertificationChange(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="E.g., ISO 9001, CE, FCC"
                />
                <button
                  type="button"
                  onClick={() => removeCertification(index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                  disabled={certifications.length <= 1}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addCertification}
              className="mt-2 flex items-center text-secondary hover:text-primary"
            >
              <Plus size={18} className="mr-1" /> Add Certification
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Order
              </label>
              <input
                type="text"
                name="minimum_order"
                value={formData.minimum_order}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="E.g., 1000 units"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lead Time
              </label>
              <input
                type="text"
                name="lead_time"
                value={formData.lead_time}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="E.g., 15-20 days"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="Active">Active</option>
                <option value="Potential">Potential</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Terms
            </label>
            <input
              type="text"
              name="payment_terms"
              value={formData.payment_terms}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="E.g., 30% deposit, 70% before shipment"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="https://www.example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Established
              </label>
              <input
                type="text"
                name="established"
                value={formData.established}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="E.g., 2008"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employees
              </label>
              <input
                type="text"
                name="employees"
                value={formData.employees}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="E.g., 100-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rating (1-5)
              </label>
              <input
                type="number"
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="0"
                max="5"
                step="0.1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Contact
              </label>
              <input
                type="date"
                name="last_contact"
                value={formData.last_contact}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={3}
              placeholder="Additional notes about this supplier..."
            />
          </div>

          <div className="flex justify-end space-x-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/90"
            >
              {editSupplier ? 'Update Supplier' : 'Add Supplier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSupplierModal;