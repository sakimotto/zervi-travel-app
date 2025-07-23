import React, { useState, useEffect } from 'react';
import { TodoItem, Supplier, Traveler } from '../types';
import { v4 as uuidv4 } from 'uuid';
import TravelerSelector from './TravelerSelector';
import { X } from 'lucide-react';

interface AddTodoModalProps {
  onClose: () => void;
  onSave: (todo: TodoItem) => void;
  editTodo: TodoItem | null;
  suppliers: Supplier[];
}

const AddTodoModal: React.FC<AddTodoModalProps> = ({ onClose, onSave, editTodo, suppliers }) => {
  const [formData, setFormData] = useState<TodoItem>({
    id: '',
    title: '',
    description: '',
    completed: false,
    priority: 'Medium',
    due_date: '',
    category: 'Business',
    assigned_to: 'Both',
    created_at: '',
  });

  useEffect(() => {
    if (editTodo) {
      setFormData(editTodo);
    } else {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        id: uuidv4(),
        title: '',
        description: '',
        completed: false,
        priority: 'Medium',
        due_date: today,
        category: 'Business',
        assigned_to: 'Both',
        created_at: new Date().toISOString(),
      });
    }
  }, [editTodo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
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
            {editTodo ? 'Edit Task' : 'Add New Task'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter task title"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={3}
              placeholder="Task description (optional)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority *
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                <option value="Business">Business</option>
                <option value="Travel">Travel</option>
                <option value="Personal">Personal</option>
                <option value="Supplier">Supplier</option>
                <option value="Meeting">Meeting</option>
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
            <label className="flex items-center">
              <input
                type="checkbox"
                name="completed"
                checked={formData.completed}
                onChange={handleChange}
                className="h-4 w-4 text-secondary border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Mark as completed</span>
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
              {editTodo ? 'Update Task' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTodoModal;