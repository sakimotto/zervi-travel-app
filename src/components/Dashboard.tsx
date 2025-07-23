import React, { useState, useEffect } from 'react';
import { Calendar, CheckSquare, Clock, Users, Building2, DollarSign, MapPin, Plus, AlertTriangle, Plane, Car, Clock3, Navigation } from 'lucide-react';
import { TodoItem, Appointment, ItineraryItem, Supplier, BusinessContact, Expense } from '../types';
import { sampleTodos } from '../data/todos';
import { sampleAppointments } from '../data/appointments';
import { format, parseISO, isToday, isTomorrow, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isValid, differenceInMinutes, addHours } from 'date-fns';
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
  const todaysTodos = todos.filter(todo => {
    if (!todo.due_date || typeof todo.due_date !== 'string' || todo.due_date.trim() === '') return false;
    const parsedDate = parseISO(todo.due_date);
    return isValid(parsedDate) && isToday(parsedDate);
  });
  
  const todaysAppointments = appointments.filter(appointment => {
    if (!appointment.start_date || typeof appointment.start_date !== 'string' || appointment.start_date.trim() === '') return false;
    const parsedDate = parseISO(appointment.start_date);
    return isValid(parsedDate) && isToday(parsedDate);
  });

  const upcomingItinerary = itinerary.filter(item => {
    if (!item.start_date || typeof item.start_date !== 'string' || item.start_date.trim() === '' || item.start_date === null || item.start_date === undefined) return false;
    const itemDate = parseISO(item.start_date);
    if (!isValid(itemDate)) return false;
    const today = new Date();
    const nextWeek = addDays(today, 7);
    return itemDate >= today && itemDate <= nextWeek;
  }).slice(0, 3);

  const todaysItinerary = itinerary.filter(item => {
    if (!item.start_date || typeof item.start_date !== 'string' || item.start_date.trim() === '' || item.start_date === null || item.start_date === undefined) return false;
    const parsedDate = parseISO(item.start_date);
    return isValid(parsedDate) && isToday(parsedDate);
  });

  const activeSuppliers = suppliers.filter(s => s.status === 'Active').length;
  const totalExpenses = expenses.reduce((sum, expense) => {
    const usdAmount = expense.currency === 'CNY' ? expense.amount / 7.2 : 
                     expense.currency === 'EUR' ? expense.amount * 1.1 : 
                     expense.amount;
    return sum + usdAmount;
  }, 0);

  // Generate intelligent travel alerts
  const generateTravelAlerts = () => {
    const alerts = [];
    const now = new Date();
    
    // Check for upcoming flights and travel times
    const upcomingFlights = itinerary.filter(item => {
      if (item.type !== 'Flight' || !item.start_date) return false;
      const flightDate = parseISO(item.start_date);
      if (!isValid(flightDate)) return false;
      const timeDiff = differenceInMinutes(flightDate, now);
      return timeDiff > 0 && timeDiff <= 1440; // Next 24 hours
    });

    upcomingFlights.forEach(flight => {
      const flightTime = parseISO(flight.start_date);
      const departureTime = flight.type_specific_data?.departureTime;
      
      if (departureTime) {
        const [hours, minutes] = departureTime.split(':');
        const fullFlightTime = new Date(flightTime);
        fullFlightTime.setHours(parseInt(hours), parseInt(minutes));
        
        const timeDiff = differenceInMinutes(fullFlightTime, now);
        
        // International flight - 3 hours early
        if (timeDiff <= 180 && timeDiff > 120) {
          alerts.push({
            type: 'departure_reminder',
            title: '🛫 International Flight Alert',
            message: `Leave for airport NOW! ${flight.title} departs in ${Math.floor(timeDiff/60)}h ${timeDiff%60}m. International flights require 3+ hours early arrival.`,
            priority: 'High' as const,
            time: format(fullFlightTime, 'HH:mm')
          });
        }
        
        // Domestic flight - 2 hours early
        if (timeDiff <= 120 && timeDiff > 90 && !flight.title.toLowerCase().includes('international')) {
          alerts.push({
            type: 'departure_reminder',
            title: '✈️ Domestic Flight Alert',
            message: `Leave for airport soon! ${flight.title} departs in ${Math.floor(timeDiff/60)}h ${timeDiff%60}m. Arrive 2 hours early.`,
            priority: 'High' as const,
            time: format(fullFlightTime, 'HH:mm')
          });
        }
      }
    });

    // Check for appointment transitions
    const todaysEvents = [...todaysAppointments, ...todaysItinerary].sort((a, b) => {
      const timeA = a.start_time || a.type_specific_data?.departureTime || '00:00';
      const timeB = b.start_time || b.type_specific_data?.departureTime || '00:00';
      return timeA.localeCompare(timeB);
    });

    for (let i = 0; i < todaysEvents.length - 1; i++) {
      const currentEvent = todaysEvents[i];
      const nextEvent = todaysEvents[i + 1];
      
      const currentEndTime = currentEvent.end_time || 
                            (currentEvent.type_specific_data?.arrivalTime) ||
                            addHours(parseISO(`2000-01-01T${currentEvent.start_time || '09:00'}`), 1).toTimeString().slice(0, 5);
      
      const nextStartTime = nextEvent.start_time || nextEvent.type_specific_data?.departureTime || '00:00';
      
      if (currentEndTime && nextStartTime) {
        const timeBetween = differenceInMinutes(
          parseISO(`2000-01-01T${nextStartTime}`),
          parseISO(`2000-01-01T${currentEndTime}`)
        );
        
        if (timeBetween < 60 && timeBetween > 0) {
          alerts.push({
            type: 'travel_time',
            title: '🚗 Tight Schedule Alert',
            message: `Only ${timeBetween} minutes between "${currentEvent.title}" and "${nextEvent.title}". Consider booking taxi in advance.`,
            priority: 'Medium' as const,
            time: currentEndTime
          });
        }
      }
    }

    return alerts;
  };

  const travelAlerts = generateTravelAlerts();

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column - Calendar and Upcoming */}
          <div className="space-y-6">
            {/* Travel Alerts */}
            {travelAlerts.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  Travel Alerts
                </h3>
                <div className="space-y-2">
                  {travelAlerts.map((alert, index) => (
                    <div key={index} className={`p-3 rounded-lg ${
                      alert.priority === 'High' ? 'bg-red-100 border border-red-300' :
                      alert.priority === 'Medium' ? 'bg-yellow-100 border border-yellow-300' :
                      'bg-blue-100 border border-blue-300'
                    }`}>
                      <p className="font-medium text-gray-900">{alert.title}</p>
                      <p className="text-sm text-gray-700">{alert.message}</p>
                      {alert.time && (
                        <p className="text-xs text-gray-500 mt-1">Time: {alert.time}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <MiniCalendar 
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              appointments={appointments}
              itinerary={itinerary}
            />
            
            {/* Smart Travel Logistics */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Navigation className="mr-2 h-5 w-5 text-primary" />
                Smart Logistics
              </h3>
              <div className="space-y-3">
                {todaysItinerary.filter(item => item.type === 'Flight').map(flight => (
                  <div key={flight.id} className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-blue-900">✈️ {flight.title}</span>
                      <span className="text-sm text-blue-700">
                        {flight.type_specific_data?.departureTime}
                      </span>
                    </div>
                    <div className="text-sm text-blue-800 space-y-1">
                      <p>🕐 Arrive at airport: {
                        flight.title.toLowerCase().includes('international') 
                          ? '3 hours early' 
                          : '2 hours early'
                      }</p>
                      <p>🚗 Leave hotel: {
                        (() => {
                          if (!flight.type_specific_data?.departureTime) return 'TBD';
                          const [hours, minutes] = flight.type_specific_data.departureTime.split(':');
                          const departureTime = new Date();
                          departureTime.setHours(parseInt(hours), parseInt(minutes));
                          const leaveTime = new Date(departureTime.getTime() - (flight.title.toLowerCase().includes('international') ? 4 : 3) * 60 * 60 * 1000);
                          return format(leaveTime, 'HH:mm');
                        })()
                      }</p>
                      <p>📋 Check-in opens: 24h before</p>
                    </div>
                  </div>
                ))}
                
                {todaysAppointments.length > 1 && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="font-medium text-green-900 mb-2">🗓️ Meeting Transitions</p>
                    <div className="text-sm text-green-800 space-y-1">
                      <p>• {todaysAppointments.length} meetings scheduled</p>
                      <p>• Book taxis between venues</p>
                      <p>• Allow 30-45min travel time in traffic</p>
                      <p>• Have backup transportation ready</p>
                    </div>
                  </div>
                )}
                
                {todaysItinerary.length === 0 && todaysAppointments.length === 0 && (
                  <p className="text-gray-500 text-sm">No travel logistics needed today</p>
                )}
              </div>
            </div>

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
                          {format(parseISO(item.start_date), 'MMM dd, yyyy')}
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
                      <p className="text-xs text-gray-600">{apt.start_time}</p>
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

        {/* Additional Dashboard Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {/* Recent Activity Feed */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="mr-2 h-5 w-5 text-primary" />
              Recent Activity
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {/* Recent todos */}
              {todos.slice(0, 3).map(todo => (
                <div key={`activity-todo-${todo.id}`} className="flex items-center p-2 bg-blue-50 rounded">
                  <CheckSquare className="mr-2 h-4 w-4 text-blue-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {todo.completed ? 'Completed' : 'Added'} task: {todo.title}
                    </p>
                    <p className="text-xs text-gray-600">
                      {todo.due_date ? format(parseISO(todo.due_date), 'MMM dd') : 'No due date'}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Recent appointments */}
              {appointments.slice(0, 2).map(apt => (
                <div key={`activity-apt-${apt.id}`} className="flex items-center p-2 bg-green-50 rounded">
                  <Calendar className="mr-2 h-4 w-4 text-green-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Scheduled: {apt.title}
                    </p>
                    <p className="text-xs text-gray-600">
                      {format(parseISO(apt.start_date), 'MMM dd')} at {apt.start_time}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Recent expenses */}
              {expenses.slice(0, 2).map(expense => (
                <div key={`activity-expense-${expense.id}`} className="flex items-center p-2 bg-yellow-50 rounded">
                  <DollarSign className="mr-2 h-4 w-4 text-yellow-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Expense: {expense.description}
                    </p>
                    <p className="text-xs text-gray-600">
                      {expense.amount} {expense.currency} - {expense.category}
                    </p>
                  </div>
                </div>
              ))}
              
              {(todos.length === 0 && appointments.length === 0 && expenses.length === 0) && (
                <p className="text-gray-500 text-sm">No recent activity</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={() => window.location.href = '/suppliers'}
                className="w-full flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Supplier
              </button>
              <button 
                onClick={() => window.location.href = '/calendar'}
                className="w-full flex items-center justify-center px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Meeting
              </button>
              <button 
                onClick={() => window.location.href = '/expenses'}
                className="w-full flex items-center justify-center px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
              >
                <DollarSign className="mr-2 h-4 w-4" />
                Add Expense
              </button>
              <button 
                onClick={() => window.location.href = '/contacts'}
                className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Users className="mr-2 h-4 w-4" />
                Add Contact
              </button>
              <button 
                onClick={() => window.location.href = '/itinerary'}
                className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plane className="mr-2 h-4 w-4" />
                Plan Travel
              </button>
            </div>
          </div>

          {/* Weather Widget */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="mr-2 h-5 w-5 text-primary" />
              Travel Weather
            </h3>
            <div className="space-y-3">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Beijing</p>
                <p className="text-2xl font-bold text-blue-600">22°C</p>
                <p className="text-xs text-gray-500">Partly Cloudy</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Shanghai</p>
                <p className="text-2xl font-bold text-green-600">26°C</p>
                <p className="text-xs text-gray-500">Sunny</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-gray-600">Guangzhou</p>
                <p className="text-2xl font-bold text-yellow-600">28°C</p>
                <p className="text-xs text-gray-500">Light Rain</p>
              </div>
            </div>
          </div>
        </div>

        {/* Business Insights Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Suppliers */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Building2 className="mr-2 h-5 w-5 text-primary" />
              Top Suppliers
            </h3>
            <div className="space-y-3">
              {suppliers
                .filter(s => s.status === 'Active')
                .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                .slice(0, 4)
                .map(supplier => (
                <div key={supplier.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{supplier.company_name}</p>
                    <p className="text-sm text-gray-600">{supplier.city}, {supplier.industry}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`text-sm ${star <= (supplier.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">{supplier.rating || 'No rating'}</p>
                  </div>
                </div>
              ))}
              {suppliers.filter(s => s.status === 'Active').length === 0 && (
                <p className="text-gray-500 text-sm">No active suppliers</p>
              )}
            </div>
          </div>

          {/* Expense Breakdown */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSign className="mr-2 h-5 w-5 text-primary" />
              Expense Breakdown
            </h3>
            <div className="space-y-3">
              {['Transportation', 'Accommodation', 'Meals', 'Entertainment'].map(category => {
                const categoryExpenses = expenses.filter(e => e.category === category);
                const categoryTotal = categoryExpenses.reduce((sum, e) => {
                  const usdAmount = e.currency === 'CNY' ? e.amount / 7.2 : 
                                   e.currency === 'EUR' ? e.amount * 1.1 : 
                                   e.amount;
                  return sum + usdAmount;
                }, 0);
                
                if (categoryTotal === 0) return null;
                
                return (
                  <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        category === 'Transportation' ? 'bg-blue-500' :
                        category === 'Accommodation' ? 'bg-purple-500' :
                        category === 'Meals' ? 'bg-green-500' :
                        'bg-pink-500'
                      }`}></div>
                      <span className="text-sm font-medium text-gray-900">{category}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">${categoryTotal.toFixed(0)}</p>
                      <p className="text-xs text-gray-500">{categoryExpenses.length} items</p>
                    </div>
                  </div>
                );
              })}
              {expenses.length === 0 && (
                <p className="text-gray-500 text-sm">No expenses recorded</p>
              )}
            </div>
          </div>
        </div>

        {/* Travel Tips & Reminders */}
        <div className="bg-gradient-to-r from-primary to-secondary text-white rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">🇨🇳 China Business Travel Intelligence</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <h4 className="font-semibold mb-2">💳 Payment Methods</h4>
              <p className="text-sm text-white text-opacity-90">
                WeChat Pay and Alipay are essential. Download apps before arrival and bring cash as backup.
              </p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <h4 className="font-semibold mb-2">📱 Essential Apps</h4>
              <p className="text-sm text-white text-opacity-90">
                WeChat, Didi (ride-hailing), Baidu Maps, and Google Translate for smooth navigation.
              </p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <h4 className="font-semibold mb-2">🤝 Business Etiquette</h4>
              <p className="text-sm text-white text-opacity-90">
                Exchange business cards with both hands, arrive early for meetings, and bring gifts.
              </p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <h4 className="font-semibold mb-2">✈️ Travel Timing</h4>
              <p className="text-sm text-white text-opacity-90">
                International flights: 3+ hours early. Domestic: 2 hours. High-speed trains: 30 minutes.
              </p>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
};

export default Dashboard;