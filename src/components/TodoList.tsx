import React, { useState } from 'react';
import { TodoItem, Supplier } from '../types';
import { format, parseISO, isToday, isPast } from 'date-fns';
import { Plus, Check, Clock, AlertTriangle, Edit, Trash2 } from 'lucide-react';
import AddTodoModal from './AddTodoModal';
import { useTodos } from '../hooks/useSupabase';

interface TodoListProps {
  todos: TodoItem[];
  onTodosChange: (todos: TodoItem[]) => void;
  suppliers: Supplier[];
}

const TodoList: React.FC<TodoListProps> = ({ 
  todos: propTodos, 
  onTodosChange: propOnTodosChange, 
  suppliers 
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);

  // Use Supabase backend for all data operations
  const { data: todos, loading, insert, update, remove, refetch } = useTodos();
  
  const onTodosChange = (newTodos: TodoItem[]) => {
    // Keep compatibility with parent component
    propOnTodosChange(newTodos);
  };

  const toggleTodo = async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      try {
        const updatedTodo = { ...todo, completed: !todo.completed };
        await update(id, updatedTodo);
      } catch (error) {
        console.error('Error updating todo:', error);
        alert('Failed to update task. Please try again.');
      }
    }
  };

  const deleteTodo = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await remove(id);
      } catch (error) {
        console.error('Error deleting todo:', error);
        alert('Failed to delete task. Please try again.');
      }
    }
  };

  const handleSaveTodo = async (todo: TodoItem) => {
    if (editingTodo) {
      try {
        await update(appointment.id, appointment);
      } catch (error) {
        console.error('Error updating appointment:', error);
        alert('Failed to update appointment. Please try again.');
      }
      setEditingTodo(null);
    } else {
      try {
        await insert(appointment);
      } catch (error) {
        console.error('Error creating appointment:', error);
        alert('Failed to create appointment. Please try again.');
      }
    }
    setShowAddModal(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-600';
      case 'Medium': return 'text-yellow-600';
      case 'Low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'High': return <AlertTriangle size={14} className="text-red-500" />;
      case 'Medium': return <Clock size={14} className="text-yellow-500" />;
      case 'Low': return <Check size={14} className="text-green-500" />;
      default: return null;
    }
  };

  const sortedTodos = [...todos].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (a.priority !== b.priority) {
      const priorityOrder = { 'High': 0, 'Medium': 1, 'Low': 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    if (a.due_date && b.due_date) {
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    }
    return 0;
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Todo List</h3>
        <button
          onClick={() => {
            setEditingTodo(null);
            setShowAddModal(true);
          }}
          className="flex items-center text-primary hover:text-primary/80 text-sm"
        >
          <Plus size={16} className="mr-1" />
          Add Task
        </button>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {sortedTodos.map(todo => (
          <div
            key={todo.id}
            className={`flex items-start gap-3 p-3 rounded-lg border ${
              todo.completed 
                ? 'bg-gray-50 border-gray-200' 
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <button
              onClick={() => toggleTodo(todo.id)}
              className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center ${
                todo.completed
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {todo.completed && <Check size={12} />}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {getPriorityIcon(todo.priority)}
                <h4 className={`font-medium ${
                  todo.completed ? 'line-through text-gray-500' : 'text-gray-900'
                }`}>
                  {todo.title}
                </h4>
              </div>
              
              {todo.description && (
                <p className={`text-sm mb-2 ${
                  todo.completed ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {todo.description}
                </p>
              )}

              <div className="flex items-center gap-4 text-xs">
                {todo.due_date && (
                  <span className={`flex items-center gap-1 ${
                    todo.due_date && isPast(parseISO(todo.due_date)) && !todo.completed
                      ? 'text-red-600'
                      : todo.due_date && isToday(parseISO(todo.due_date))
                      ? 'text-orange-600'
                      : 'text-gray-500'
                  }`}>
                    <Clock size={12} />
                    {todo.due_date ? format(parseISO(todo.due_date), 'MMM dd') : 'No date'}
                  </span>
                )}
                
                <span className={`px-2 py-1 rounded-full text-xs ${
                  todo.category === 'Business' ? 'bg-blue-100 text-blue-800' :
                  todo.category === 'Travel' ? 'bg-green-100 text-green-800' :
                  todo.category === 'Supplier' ? 'bg-purple-100 text-purple-800' :
                  todo.category === 'Meeting' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {todo.category}
                </span>

                <span className="text-gray-500">{todo.assigned_to}</span>
              </div>
            </div>

            <div className="flex gap-1">
              <button
                onClick={() => {
                  setEditingTodo(todo);
                  setShowAddModal(true);
                }}
                className="p-1 text-gray-400 hover:text-blue-600"
              >
                <Edit size={14} />
              </button>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="p-1 text-gray-400 hover:text-red-600"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}

        {sortedTodos.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No tasks yet. Add your first task to get started!</p>
          </div>
        )}
      </div>

      {showAddModal && (
        <AddTodoModal
          onClose={() => {
            setShowAddModal(false);
            setEditingTodo(null);
          }}
          onSave={handleSaveTodo}
          editTodo={editingTodo}
          suppliers={suppliers}
        />
      )}
    </div>
  );
};

export default TodoList;