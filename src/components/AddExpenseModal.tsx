import React, { useState, useEffect } from 'react';
import { Expense, Traveler } from '../types';
import { v4 as uuidv4 } from 'uuid';
import TravelerSelector from './TravelerSelector';
import { X } from 'lucide-react';

interface AddExpenseModalProps {
  onClose: () => void;
  onSave: (expense: Expense) => void;
  editExpense: Expense | null;
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ onClose, onSave, editExpense }) => {
  const [formData, setFormData] = useState<Expense>({
    id: '',
    date: '',
    category: 'Other',
    description: '',
    amount: 0,
    currency: 'CNY',
    paymentMethod: 'Credit Card',
    businessPurpose: '',
    assignedTo: 'Both',
    reimbursable: true,
    approved: false,
  });

  useEffect(() => {
    if (editExpense) {
      setFormData(editExpense);
    } else {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        id: uuidv4(),
        date: today,
        category: 'Other',
        description: '',
        amount: 0,
        currency: 'CNY',
        paymentMethod: 'Credit Card',
        businessPurpose: '',
        assignedTo: 'Both',
        reimbursable: true,
        approved: false,
      });
    }
  }, [editExpense]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'amount') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: formData.id || uuidv4(),
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-semibold text-gray-900">
            {editExpense ? 'Edit Expense' : 'Add New Expense'}
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
                Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="Transportation">Transportation</option>
                <option value="Accommodation">Accommodation</option>
                <option value="Meals">Meals</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Supplies">Supplies</option>
                <option value="Communication">Communication</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Brief description of the expense"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount *
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency *
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="CNY">CNY (Chinese Yuan)</option>
                <option value="USD">USD (US Dollar)</option>
                <option value="EUR">EUR (Euro)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method *
              </label>
              <select
                name="payment_method"
                value={formData.payment_method}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="Cash">Cash</option>
                <option value="Credit Card">Credit Card</option>
                <option value="WeChat Pay">WeChat Pay</option>
                <option value="Alipay">Alipay</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>

            <div>
              <TravelerSelector
                value={formData.assigned_to}
                onChange={(value) => setFormData(prev => ({ ...prev, assigned_to: value }))}
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Purpose *
            </label>
            <textarea
              name="business_purpose"
              value={formData.business_purpose}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={2}
              placeholder="Explain the business purpose of this expense"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Receipt URL (optional)
            </label>
            <input
              type="url"
              name="receipt"
              value={formData.receipt || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Link to receipt image or document"
            />
          </div>

          <div className="flex flex-col gap-4 mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="reimbursable"
                checked={formData.reimbursable}
                onChange={handleChange}
                className="h-4 w-4 text-secondary border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">This expense is reimbursable</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="approved"
                checked={formData.approved || false}
                onChange={handleChange}
                className="h-4 w-4 text-secondary border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">This expense is approved</span>
            </label>
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
              {editExpense ? 'Update Expense' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;