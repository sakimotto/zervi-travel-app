import React, { useState, useEffect } from 'react';
import { Calendar, CheckSquare, Clock, Users, Building2, DollarSign, MapPin, Plus, AlertTriangle, Plane, Car, Clock3, Navigation, QrCode, FileText, Shield, Train, MapIcon } from 'lucide-react';
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

  // Flight countdown logic
  const getFlightCountdown = (flightDate: string, departureTime?: string) => {
    if (!departureTime) return null;
    const [hours, minutes] = departureTime.split(':');
    const flightDateTime = new Date(flightDate);
    flightDateTime.setHours(parseInt(hours), parseInt(minutes));
    
    const now = new Date();
    const timeDiff = flightDateTime.getTime() - now.getTime();
    
    if (timeDiff <= 0) return 'Departed';
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hrs = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hrs}h ${mins}m`;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  // QR Code state management
  const [qrContacts, setQrContacts] = useState({
    wechat: localStorage.getItem('wechat-id') || 'your-wechat-id',
    whatsapp: localStorage.getItem('whatsapp-number') || '+1234567890'
  });
  
  const [editingQR, setEditingQR] = useState<'wechat' | 'whatsapp' | null>(null);
  
  // Generate QR code data
  const generateQRCode = (type: 'wechat' | 'whatsapp', data: string) => {
    const qrData = type === 'wechat' ? `weixin://dl/chat?${data}` : `https://wa.me/${data}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(qrData)}`;
  };
  
  // Update QR contact info
  const updateQRContact = (type: 'wechat' | 'whatsapp', value: string) => {
    setQrContacts(prev => ({ ...prev, [type]: value }));
    localStorage.setItem(type === 'wechat' ? 'wechat-id' : 'whatsapp-number', value);
    setEditingQR(null);
  };

  // Document management state
  const [documents, setDocuments] = useState([
    { id: 1, name: 'Passport', expiry: localStorage.getItem('passport-expiry') || '2025-12-15', type: 'passport' },
    { id: 2, name: 'China Visa', expiry: localStorage.getItem('visa-expiry') || '2025-06-30', type: 'visa' },
    { id: 3, name: 'Business License', expiry: localStorage.getItem('license-expiry') || '2025-03-20', type: 'license' },
    { id: 4, name: 'Health Certificate', expiry: localStorage.getItem('health-expiry') || '2025-02-10', type: 'health' }
  ]);
  
  const [editingDoc, setEditingDoc] = useState<number | null>(null);
  
  // Document status checker
  const getDocumentStatus = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return { status: 'expired', color: 'red', days: Math.abs(daysUntilExpiry) };
    if (daysUntilExpiry <= 30) return { status: 'expiring', color: 'yellow', days: daysUntilExpiry };
    return { status: 'valid', color: 'green', days: daysUntilExpiry };
  };
  
  // Update document expiry
  const updateDocumentExpiry = (id: number, newExpiry: string) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === id ? { ...doc, expiry: newExpiry } : doc
    ));
    const doc = documents.find(d => d.id === id);
    if (doc) {
      localStorage.setItem(`${doc.type}-expiry`, newExpiry);
    }
    setEditingDoc(null);
  };

  return (
    <section id="dashboard" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-primary font-montserrat mb-3">Travel Dashboard</h2>
          <p className="text-base text-gray-700 max-w-3xl mx-auto">
            Your business travel command center for China operations
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600">Today's Tasks</p>
                <p className="text-lg md:text-xl font-bold text-primary">{todaysTodos.length}</p>
              </div>
              <CheckSquare className="h-6 w-6 md:h-8 md:w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600">Today's Meetings</p>
                <p className="text-lg md:text-xl font-bold text-primary">{todaysAppointments.length}</p>
              </div>
              <Clock className="h-6 w-6 md:h-8 md:w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600">Active Suppliers</p>
                <p className="text-lg md:text-xl font-bold text-primary">{activeSuppliers}</p>
              </div>
              <Building2 className="h-6 w-6 md:h-8 md:w-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600">Total Expenses</p>
                <p className="text-lg md:text-xl font-bold text-primary">${totalExpenses.toFixed(0)}</p>
              </div>
              <DollarSign className="h-6 w-6 md:h-8 md:w-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4 mb-8">
          {/* Left Column - Calendar */}
          <div className="lg:col-span-1">
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

            <div className="space-y-6">
              <MiniCalendar 
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                appointments={appointments}
                itinerary={itinerary}
              />
            </div>
          </div>

          {/* Middle Left - Todo List */}
          <div className="lg:col-span-1">
            <TodoList 
              todos={todos}
              onTodosChange={() => {}} // No longer needed with Supabase
              suppliers={suppliers}
            />
          </div>

          {/* Right Column - Appointments & Smart Features Combined */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              <AppointmentsList 
                appointments={appointments}
                onAppointmentsChange={() => {}} // No longer needed with Supabase
                suppliers={suppliers}
                contacts={contacts}
                selectedDate={selectedDate}
                itinerary={itinerary}
              />
              
            {/* Smart Travel Logistics */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
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
                          if (!flight.type_specific_data?.departure_time) return 'TBD';
                          const [hours, minutes] = flight.type_specific_data.departure_time.split(':');
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
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
            </div>
          </div>
        </div>

        {/* New Enhanced Features */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4 mb-8">
          {/* Real-time Flight Status */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Plane className="mr-2 h-5 w-5 text-primary" />
              Flight Status
            </h3>
            <div className="space-y-3">
              {itinerary.filter(item => item.type === 'Flight').slice(0, 2).map(flight => {
                const countdown = getFlightCountdown(flight.start_date, flight.type_specific_data?.departureTime);
                const isUrgent = countdown && !countdown.includes('d') && (countdown.includes('h') ? parseInt(countdown) <= 3 : true);
                
                return (
                  <div key={flight.id} className={`p-3 rounded-lg border ${
                    isUrgent ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-gray-900">{flight.title}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        isUrgent ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        On Time
                      </span>
                    </div>
                    <div className="text-sm space-y-1">
                      <p>🛫 Departure: {flight.type_specific_data?.departureTime || 'TBD'}</p>
                      <p>📍 Gate: {flight.type_specific_data?.gate || 'TBA'}</p>
                      {countdown && (
                        <p className={`font-bold ${
                          isUrgent ? 'text-red-600' : 'text-blue-600'
                        }`}>
                          ⏰ {countdown === 'Departed' ? 'Departed' : `Departs in ${countdown}`}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
              {itinerary.filter(item => item.type === 'Flight').length === 0 && (
                <p className="text-gray-500 text-sm">No upcoming flights</p>
              )}
            </div>
          </div>

          {/* QR Code Center */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <QrCode className="mr-2 h-5 w-5 text-primary" />
              Quick Connect
            </h3>
            <div className="space-y-4">
              <div className="text-center">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-medium text-gray-700">WeChat Contact</p>
                  <button 
                    onClick={() => setEditingQR('wechat')}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                </div>
                {editingQR === 'wechat' ? (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <input
                      type="text"
                      value={qrContacts.wechat}
                      onChange={(e) => setQrContacts(prev => ({ ...prev, wechat: e.target.value }))}
                      className="w-full text-xs p-2 border rounded mb-2"
                      placeholder="Enter WeChat ID"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateQRContact('wechat', qrContacts.wechat)}
                        className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingQR(null)}
                        className="text-xs bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <img 
                      src={generateQRCode('wechat', qrContacts.wechat)} 
                      alt="WeChat QR" 
                      className="mx-auto w-20 h-20"
                    />
                    <p className="text-xs text-gray-600 mt-1">Scan to add WeChat</p>
                    <p className="text-xs text-gray-500">ID: {qrContacts.wechat}</p>
                  </div>
                )}
              </div>
              <div className="text-center">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-medium text-gray-700">WhatsApp Contact</p>
                  <button 
                    onClick={() => setEditingQR('whatsapp')}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                </div>
                {editingQR === 'whatsapp' ? (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <input
                      type="text"
                      value={qrContacts.whatsapp}
                      onChange={(e) => setQrContacts(prev => ({ ...prev, whatsapp: e.target.value }))}
                      className="w-full text-xs p-2 border rounded mb-2"
                      placeholder="Enter phone number with country code"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateQRContact('whatsapp', qrContacts.whatsapp)}
                        className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingQR(null)}
                        className="text-xs bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <img 
                      src={generateQRCode('whatsapp', qrContacts.whatsapp)} 
                      alt="WhatsApp QR" 
                      className="mx-auto w-20 h-20"
                    />
                    <p className="text-xs text-gray-600 mt-1">Scan to chat</p>
                    <p className="text-xs text-gray-500">Phone: {qrContacts.whatsapp}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Document Status Tracker */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="mr-2 h-5 w-5 text-primary" />
              Document Status
            </h3>
            <div className="space-y-3">
              {documents.map(doc => {
                const status = getDocumentStatus(doc.expiry);
                return (
                  <div key={doc.name} className={`p-3 rounded-lg border ${
                    status.color === 'red' ? 'bg-red-50 border-red-200' :
                    status.color === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-green-50 border-green-200'
                  }`}>
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">{doc.name}</p>
                            {editingDoc === doc.id ? (
                              <div className="mt-1">
                                <input
                                  type="date"
                                  value={doc.expiry}
                                  onChange={(e) => setDocuments(prev => prev.map(d => 
                                    d.id === doc.id ? { ...d, expiry: e.target.value } : d
                                  ))}
                                  className="text-xs p-1 border rounded"
                                />
                                <div className="flex gap-1 mt-1">
                                  <button
                                    onClick={() => updateDocumentExpiry(doc.id, doc.expiry)}
                                    className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingDoc(null)}
                                    className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <p className="text-xs text-gray-600">Expires: {doc.expiry}</p>
                                <button
                                  onClick={() => setEditingDoc(doc.id)}
                                  className="text-xs text-blue-600 hover:text-blue-800"
                                >
                                  Edit
                                </button>
                              </div>
                            )}
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            status.color === 'red' ? 'bg-red-100 text-red-800' :
                            status.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {status.status === 'expired' ? 'Expired' :
                             status.status === 'expiring' ? `${status.days}d left` :
                             'Valid'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Transportation Hub */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Car className="mr-2 h-5 w-5 text-primary" />
            Transportation Hub
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Traffic Conditions */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                <MapIcon className="mr-1 h-4 w-4" />
                Traffic Status
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Airport → Hotel</span>
                  <span className="text-green-600">25 min</span>
                </div>
                <div className="flex justify-between">
                  <span>Hotel → Meeting</span>
                  <span className="text-yellow-600">45 min</span>
                </div>
                <div className="flex justify-between">
                  <span>Meeting → Factory</span>
                  <span className="text-red-600">1h 20m</span>
                </div>
              </div>
            </div>

            {/* Didi/Taxi Booking */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">🚗 Ride Booking</h4>
              <div className="space-y-2">
                <button className="w-full bg-orange-500 text-white text-xs py-2 px-3 rounded hover:bg-orange-600">
                  Book Didi Now
                </button>
                <button className="w-full bg-yellow-500 text-white text-xs py-2 px-3 rounded hover:bg-yellow-600">
                  Call Taxi
                </button>
                <p className="text-xs text-green-700">Est. arrival: 5-8 min</p>
              </div>
            </div>

            {/* High-speed Train */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2 flex items-center">
                <Train className="mr-1 h-4 w-4" />
                High-Speed Rail
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Beijing → Shanghai</span>
                  <span className="text-purple-600">4h 28m</span>
                </div>
                <div className="flex justify-between">
                  <span>Next departure</span>
                  <span className="text-purple-600">14:30</span>
                </div>
                <button className="w-full bg-purple-500 text-white text-xs py-1 px-2 rounded hover:bg-purple-600">
                  Check Schedule
                </button>
              </div>
            </div>

            {/* Metro/Subway */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">🚇 Metro Planner</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Line 1 → Line 10</span>
                  <span className="text-gray-600">32 min</span>
                </div>
                <div className="flex justify-between">
                  <span>2 transfers</span>
                  <span className="text-gray-600">¥6</span>
                </div>
                <button className="w-full bg-gray-500 text-white text-xs py-1 px-2 rounded hover:bg-gray-600">
                  Route Details
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Dashboard Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4 mb-8">
          {/* Recent Activity Feed */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
            <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-4 flex items-center">
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

          {/* Quick Actions & Weather Combined */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
            <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={() => window.location.href = '#/suppliers'}
                className="w-full flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Supplier
              </button>
              <button 
                onClick={() => window.location.href = '#/calendar'}
                className="w-full flex items-center justify-center px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Meeting
              </button>
              <button 
                onClick={() => window.location.href = '#/expenses'}
                className="w-full flex items-center justify-center px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
              >
                <DollarSign className="mr-2 h-4 w-4" />
                Add Expense
              </button>
              <button 
                onClick={() => window.location.href = '#/contacts'}
                className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Users className="mr-2 h-4 w-4" />
                Add Contact
              </button>
              <button 
                onClick={() => window.location.href = '#/itinerary'}
                className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plane className="mr-2 h-4 w-4" />
                Plan Travel
              </button>
            </div>
            
            {/* Weather Widget */}
            <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-4 flex items-center">
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
        </div>

        {/* Business Insights Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4 mb-8">
          {/* Top Suppliers */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
            <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-4 flex items-center">
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
            <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-4 flex items-center">
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
          <h3 className="text-lg md:text-xl font-semibold mb-4">🇨🇳 China Business Travel Intelligence</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <h4 className="font-semibold mb-2">💳 Payment Methods</h4>
              <p className="text-xs md:text-sm text-white text-opacity-90">
                WeChat Pay and Alipay are essential. Download apps before arrival and bring cash as backup.
              </p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <h4 className="font-semibold mb-2">📱 Essential Apps</h4>
              <p className="text-xs md:text-sm text-white text-opacity-90">
                WeChat, Didi (ride-hailing), Baidu Maps, and Google Translate for smooth navigation.
              </p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <h4 className="font-semibold mb-2">🤝 Business Etiquette</h4>
              <p className="text-xs md:text-sm text-white text-opacity-90">
                Exchange business cards with both hands, arrive early for meetings, and bring gifts.
              </p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <h4 className="font-semibold mb-2">✈️ Travel Timing</h4>
              <p className="text-xs md:text-sm text-white text-opacity-90">
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