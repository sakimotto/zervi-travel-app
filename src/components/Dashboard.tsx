import React, { useState, useEffect } from 'react';
import { Calendar, CheckSquare, Clock, Users, Building2, DollarSign, MapPin } from 'lucide-react';
import { TodoItem, Appointment, ItineraryItem, Supplier, BusinessContact, Expense } from '../types';
import { sampleTodos } from '../data/todos';
import { sampleAppointments } from '../data/appointments';
import { format, parseISO, isToday, isTomorrow, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isValid } from 'date-fns';
import TodoList from './TodoList';
import AppointmentsList from './AppointmentsList';
import MiniCalendar from './MiniCalendar';
import { 
  getTodosFromLocalStorage, 
  getAppointmentsFromLocalStorage,
  getSuppliersFromLocalStorage,
  getContactsFromLocalStorage,
  getExpensesFromLocalStorage
} from '../utils/localStorage';

interface DashboardProps {
  itinerary: ItineraryItem[];
  suppliers: Supplier[];
  contacts: BusinessContact[];
  expenses: Expense[];
  todos: TodoItem[];
  appointments: Appointment[];
}

const Dashboard: React.FC<DashboardProps> = ({ itinerary, suppliers, contacts, expenses, todos, appointments }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  // Calculate dashboard metrics
  const todaysTodos = todos.filter(todo => 
    todo.due_date && typeof todo.due_date === 'string' && todo.due_date.trim() !== '' && isValid(parseISO(todo.due_date)) && isToday(parseISO(todo.due_date))
  );
  
  const todaysAppointments = appointments.filter(appointment => 
    appointment.start_date && typeof appointment.start_date === 'string' && appointment.start_date.trim() !== '' && isValid(parseISO(appointment.start_date)) && isToday(parseISO(appointment.start_date))
  );

  const upcomingItinerary = itinerary.filter(item => {
    if (!item.start_date || typeof item.start_date !== 'string' || item.start_date.trim() === '') return false;
    const itemDate = parseISO(item.start_date);
    if (!isValid(itemDate)) return false;
    const today = new Date();
    const nextWeek = addDays(today, 7);
    return itemDate >= today && itemDate <= nextWeek;
  }).slice(0, 3);

  const todaysItinerary = itinerary.filter(item => 
    item.start_date && typeof item.start_date === 'string' && item.start_date.trim() !== '' && isValid(parseISO(item.start_date)) && isToday(parseISO(item.start_date))
  );

  const activeSuppliers = suppliers.filter(s => s.status === 'Active').length;
  const totalExpenses = expenses.reduce((sum, expense) => {
    const usdAmount = expense.currency === 'CNY' ? expense.amount / 7.2 : 
                     expense.currency === 'EUR' ? expense.amount * 1.1 : 
                     expense.amount;
    return sum + usdAmount;
  }, 0);

  return (
    <section id="dashboard" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-primary font-montserrat mb-3">Travel Dashboard</h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Your business travel command center for China operations
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Tasks</p>
                <p className="text-2xl font-bold text-primary">{todaysTodos.length}</p>
              </div>
              <CheckSquare className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Meetings</p>
                <p className="text-2xl font-bold text-primary">{todaysAppointments.length}</p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Suppliers</p>
                <p className="text-2xl font-bold text-primary">{activeSuppliers}</p>
              </div>
              <Building2 className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-primary">${totalExpenses.toFixed(0)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Calendar and Upcoming */}
          <div className="space-y-6">
            <MiniCalendar 
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              appointments={appointments}
              itinerary={itinerary}
            />
            
            {/* Upcoming Travel */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="mr-2 h-5 w-5 text-primary" />
                Upcoming Travel
              </h3>
              {upcomingItinerary.length > 0 ? (
                <div className="space-y-3">
                  {upcomingItinerary.map(item => (
                    <div key={item.id} className="flex items-start p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.title}</p>
                        <p className="text-sm text-gray-600">{item.location}</p>
                        <p className="text-xs text-gray-500">
                          {format(parseISO(item.startDate), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        item.confirmed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.confirmed ? 'Confirmed' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No upcoming travel scheduled</p>
              )}
            </div>

            {/* Today's Schedule */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-primary" />
                Today's Schedule
              </h3>
              <div className="space-y-2">
                {todaysAppointments.map(apt => (
                  <div key={apt.id} className="flex items-center p-2 bg-blue-50 rounded">
                    <Clock className="mr-2 h-4 w-4 text-blue-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{apt.title}</p>
                      <p className="text-xs text-gray-600">{apt.startTime}</p>
                    </div>
                  </div>
                ))}
                {todaysItinerary.map(item => (
                  <div key={item.id} className="flex items-center p-2 bg-green-50 rounded">
                    <MapPin className="mr-2 h-4 w-4 text-green-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-600">{item.type}</p>
                    </div>
                  </div>
                ))}
                {todaysAppointments.length === 0 && todaysItinerary.length === 0 && (
                  <p className="text-gray-500 text-sm">No events scheduled for today</p>
                )}
              </div>
            </div>
          </div>

          {/* Middle Column - Todo List */}
          <div>
            <TodoList 
              todos={todos}
              onTodosChange={() => {}} // No longer needed with Supabase
              suppliers={suppliers}
            />
          </div>

          {/* Right Column - Appointments */}
          <div>
            <AppointmentsList 
              appointments={appointments}
              onAppointmentsChange={() => {}} // No longer needed with Supabase
              suppliers={suppliers}
              contacts={contacts}
              selectedDate={selectedDate}
              itinerary={itinerary}
            />
          </div>
        </div>
      </div>

    </section>
  );
};

export default Dashboard;