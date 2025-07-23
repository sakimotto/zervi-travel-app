import React, { useState, useEffect } from 'react';
import { Expense, Traveler } from '../types';
import { sampleExpenses } from '../data/expenses';
import { getActiveTravelerNames } from '../data/travelers';
import { format, parseISO } from 'date-fns';
import { Plus, DollarSign, Calendar, User, Filter, Download, Upload, Database, Edit, Trash2, AlertCircle, X } from 'lucide-react';
import AddExpenseModal from './AddExpenseModal';
import { saveAs } from 'file-saver';
import { exportToWord } from '../utils/wordExport';
import { useExpenses } from '../hooks/useSupabase';
import { saveExpensesToLocalStorage, getExpensesFromLocalStorage } from '../utils/localStorage';

const ExpensesSection: React.FC = () => {
  // Use Supabase backend for all data operations
  const { data: expenses, loading, insert, update, remove, refetch } = useExpenses();
  
  // Fallback to sample data if Supabase is empty
  const [localExpenses, setLocalExpenses] = useState<Expense[]>(sampleExpenses);
  
  // Use Supabase data if available, otherwise use sample data
  const displayExpenses = expenses.length > 0 ? expenses : localExpenses;
  
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterTraveler, setFilterTraveler] = useState<Traveler | 'All'>('All');
  const [filterApproval, setFilterApproval] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  // Get dynamic traveler list
  const [travelerOptions, setTravelerOptions] = useState<string[]>(['All']);

  useEffect(() => {
    const activeTravelers = getActiveTravelerNames();
    setTravelerOptions(['All', ...activeTravelers]);
  }, []);

  const categories = ['All', 'Transportation', 'Accommodation', 'Meals', 'Entertainment', 'Supplies', 'Communication', 'Other'];
  const approvalStatuses = ['All', 'Approved', 'Pending', 'Reimbursable'];

  // Load sample data into Supabase if database is empty
  useEffect(() => {
    const loadSampleDataIfEmpty = async () => {
      if (!loading && expenses.length === 0) {
        try {
          console.log('Loading sample expenses data into Supabase...');
          for (const expense of sampleExpenses) {
            await insert(expense);
          }
          await refetch();
        } catch (error) {
          console.error('Error loading sample data:', error);
          setLocalExpenses(sampleExpenses);
        }
      }
    };
    
    loadSampleDataIfEmpty();
  }, [loading, expenses.length]);

  const filteredExpenses = displayExpenses.filter(expense => {
    const matchesCategory = filterCategory === 'All' || expense.category === filterCategory;
    const matchesTraveler = filterTraveler === 'All' || expense.assigned_to === filterTraveler;
    const matchesApproval = filterApproval === 'All' || 
                           (filterApproval === 'Approved' && expense.approved === true) ||
                           (filterApproval === 'Pending' && expense.approved === false) ||
                           (filterApproval === 'Reimbursable' && expense.reimbursable === true);
    
    return matchesCategory && matchesTraveler && matchesApproval;
  });

  // Calculate totals
  const totalAmount = filteredExpenses.reduce((sum, expense) => {
    // Convert to USD for totaling (simplified conversion)
    const usdAmount = expense.currency === 'CNY' ? expense.amount / 7.2 : 
                     expense.currency === 'EUR' ? expense.amount * 1.1 : 
                     expense.amount;
    return sum + usdAmount;
  }, 0);

  const reimbursableAmount = filteredExpenses
    .filter(expense => expense.reimbursable)
    .reduce((sum, expense) => {
      const usdAmount = expense.currency === 'CNY' ? expense.amount / 7.2 : 
                       expense.currency === 'EUR' ? expense.amount * 1.1 : 
                       expense.amount;
      return sum + usdAmount;
    }, 0);

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setShowAddModal(true);
  };

  const handleDeleteExpense = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await remove(id);
      } catch (error) {
        console.error('Error deleting expense:', error);
        alert('Failed to delete expense. Please try again.');
      }
    }
  };

  const handleSaveExpense = async (expense: Expense) => {
    if (editingExpense) {
      try {
        await update(expense.id, expense);
      } catch (error) {
        console.error('Error updating expense:', error);
        alert('Failed to update expense. Please try again.');
      }
      setEditingExpense(null);
    } else {
      try {
        await insert(expense);
      } catch (error) {
        console.error('Error creating expense:', error);
        alert('Failed to create expense. Please try again.');
      }
    }
    setShowAddModal(false);
  };

  const toggleApproval = async (id: string) => {
    const expense = displayExpenses.find(e => e.id === id);
    if (expense) {
      try {
        const updatedExpense = { ...expense, approved: !expense.approved };
        await update(id, updatedExpense);
      } catch (error) {
        console.error('Error updating expense approval:', error);
        alert('Failed to update expense approval. Please try again.');
      }
    }
  };

  const exportExpenses = () => {
    const dataStr = JSON.stringify(displayExpenses, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    saveAs(blob, `business-expenses-${new Date().toISOString().split('T')[0]}.json`);
  };

  const exportExpensesToWord = () => {
    const emptyItinerary: any[] = [];
    const emptySuppliers: any[] = [];
    const emptyContacts: any[] = [];
    
    exportToWord(emptyItinerary, emptySuppliers, emptyContacts, displayExpenses);
  };

  const importExpenses = (event: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const parsedData = JSON.parse(content);
        
        if (!Array.isArray(parsedData)) {
          throw new Error('Imported file does not contain a valid expenses array');
        }

        if (parsedData.length > 0) {
          const firstItem = parsedData[0];
          if (!firstItem.id || !firstItem.description || !firstItem.amount) {
            throw new Error('Imported expenses data is missing required fields');
          }
        }

        if (window.confirm(`Are you sure you want to import these expenses? This will replace your current expenses.`)) {
          // Clear existing data and insert new items
          for (const existingExpense of displayExpenses) {
            await remove(existingExpense.id);
          }
          for (const newExpense of parsedData) {
            await insert(newExpense);
          }
          await refetch();
        }
      } catch (error) {
        console.error('Error importing expenses:', error);
        setImportError('The selected file is not a valid expenses export. Please select a correctly formatted JSON file.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const resetToSampleData = () => {
    // Clear existing data and insert sample data
    Promise.all([
      ...displayExpenses.map(expense => remove(expense.id)),
      ...sampleExpenses.map(expense => insert(expense))
    ]).then(() => {
      refetch();
    }).catch(error => {
      console.error('Error resetting to sample data:', error);
      alert('Failed to reset data. Please try again.');
    });
    setShowConfirmReset(false);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Transportation':
        return 'bg-blue-100 text-blue-800';
      case 'Accommodation':
        return 'bg-purple-100 text-purple-800';
      case 'Meals':
        return 'bg-green-100 text-green-800';
      case 'Entertainment':
        return 'bg-pink-100 text-pink-800';
      case 'Supplies':
        return 'bg-yellow-100 text-yellow-800';
      case 'Communication':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAssigneeColor = (assignedTo: Traveler) => {
    switch (assignedTo) {
      case 'Archie':
        return 'bg-blue-100 text-blue-800';
      case 'Yok':
        return 'bg-green-100 text-green-800';
      case 'Both':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <section id="expenses" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-primary font-montserrat mb-3">Expense Tracking</h2>
          <p className="text-base text-gray-700 max-w-3xl mx-auto">
            Track and manage your business travel expenses in China
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total Expenses</p>
                <p className="text-xl font-bold">${totalAmount.toFixed(2)}</p>
              </div>
              <DollarSign size={32} className="text-blue-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Reimbursable</p>
                <p className="text-xl font-bold">${reimbursableAmount.toFixed(2)}</p>
              </div>
              <DollarSign size={32} className="text-green-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Total Items</p>
                <p className="text-xl font-bold">{filteredExpenses.length}</p>
              </div>
              <Calendar size={32} className="text-purple-200" />
            </div>
          </div>
        </div>

        <div className="mb-8 flex flex-col lg:flex-row gap-4 justify-between">
          <div className="flex flex-col md:flex-row gap-4 md:items-center">
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-500" />
              <span className="text-gray-700">Filter by:</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'All' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
              
              <select
                value={filterTraveler}
                onChange={(e) => setFilterTraveler(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                {travelerOptions.map(traveler => (
                  <option key={traveler} value={traveler}>
                    {traveler === 'All' ? 'All Travelers' : traveler}
                  </option>
                ))}
              </select>
              
              <select
                value={filterApproval}
                onChange={(e) => setFilterApproval(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                {approvalStatuses.map(status => (
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
                setEditingExpense(null);
                setShowAddModal(true);
              }}
              className="flex items-center bg-secondary hover:bg-secondary/90 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={20} className="mr-2" />
              Add Expense
            </button>
            
            <div className="flex items-center gap-2">
              <button
                onClick={exportExpenses}
                className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-lg transition-colors"
                title="Export expenses"
              >
                <Download size={18} className="mr-1" />
                <span className="hidden sm:inline">Export</span>
              </button>
              
              <button
                onClick={exportExpensesToWord}
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
                  onChange={importExpenses} 
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

        {filteredExpenses.length > 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Traveler
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredExpenses
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map(expense => (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(parseISO(expense.date), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>
                          <p className="font-medium">{expense.description}</p>
                          <p className="text-gray-500 text-xs">{expense.business_purpose}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(expense.category)}`}>
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <p className="font-medium">{expense.amount} {expense.currency}</p>
                          <p className="text-xs text-gray-500">{expense.payment_method}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAssigneeColor(expense.assigned_to)}`}>
                          {expense.assigned_to}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => toggleApproval(expense.id)}
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              expense.approved 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {expense.approved ? 'Approved' : 'Pending'}
                          </button>
                          {expense.reimbursable && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                              Reimbursable
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditExpense(expense)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">No expenses found matching your criteria.</p>
            <button 
              onClick={() => {setFilterCategory('All'); setFilterTraveler('All'); setFilterApproval('All');}}
              className="mt-4 text-secondary hover:text-primary font-semibold"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {showAddModal && (
        <AddExpenseModal
          onClose={() => {
            setShowAddModal(false);
            setEditingExpense(null);
          }}
          onSave={handleSaveExpense}
          editExpense={editingExpense}
        />
      )}

      {showConfirmReset && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Reset Expenses
              </h3>
              <p className="text-gray-700 mb-6">
                Are you sure you want to reset to the sample expenses? This will replace all your current expenses.
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

export default ExpensesSection;