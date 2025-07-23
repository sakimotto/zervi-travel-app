import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import AuthGuard from './components/AuthGuard';
import TravelChatbot from './components/TravelChatbot';
import { useState, useEffect } from 'react';
import { sampleItinerary } from './data/itinerary';
import { sampleSuppliers } from './data/suppliers';
import { sampleBusinessContacts } from './data/businessContacts';
import { sampleExpenses } from './data/expenses';
import { sampleTodos } from './data/todos';
import { sampleAppointments } from './data/appointments';
import { 
  getItineraryFromLocalStorage,
  getSuppliersFromLocalStorage,
  getContactsFromLocalStorage,
  getExpensesFromLocalStorage,
  getTodosFromLocalStorage,
  getAppointmentsFromLocalStorage
} from './utils/localStorage';

// Lazy load components for better performance
const HomePage = React.lazy(() => import('./pages/HomePage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const DestinationsPage = React.lazy(() => import('./pages/DestinationsPage'));
const SuppliersPage = React.lazy(() => import('./pages/SuppliersPage'));
const ContactsPage = React.lazy(() => import('./pages/ContactsPage'));
const ItineraryPage = React.lazy(() => import('./pages/ItineraryPage'));
const CalendarPage = React.lazy(() => import('./pages/CalendarPage'));
const ExpensesPage = React.lazy(() => import('./pages/ExpensesPage'));
const TipsPage = React.lazy(() => import('./pages/TipsPage'));
const PhrasesPage = React.lazy(() => import('./pages/PhrasesPage'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

function App() {
  const [currentData, setCurrentData] = useState({
    itinerary: sampleItinerary,
    suppliers: sampleSuppliers,
    contacts: sampleBusinessContacts,
    expenses: sampleExpenses,
    todos: sampleTodos,
    appointments: sampleAppointments,
  });

  // Load data from localStorage on app mount
  useEffect(() => {
    const itinerary = getItineraryFromLocalStorage() || sampleItinerary;
    const suppliers = getSuppliersFromLocalStorage() || sampleSuppliers;
    const contacts = getContactsFromLocalStorage() || sampleBusinessContacts;
    const expenses = getExpensesFromLocalStorage() || sampleExpenses;
    const todos = getTodosFromLocalStorage() || sampleTodos;
    const appointments = getAppointmentsFromLocalStorage() || sampleAppointments;
    
    setCurrentData({ itinerary, suppliers, contacts, expenses, todos, appointments });
  }, []);

  return (
    <AuthGuard>
      <Router>
        <div className="min-h-screen bg-background">
          <Navbar />
          <React.Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/destinations" element={<DestinationsPage />} />
              <Route path="/suppliers" element={<SuppliersPage />} />
              <Route path="/contacts" element={<ContactsPage />} />
              <Route path="/itinerary" element={<ItineraryPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/expenses" element={<ExpensesPage />} />
              <Route path="/tips" element={<TipsPage />} />
              <Route path="/phrases" element={<PhrasesPage />} />
              <Route path="/about" element={<AboutPage />} />
            </Routes>
          </React.Suspense>
          
          {/* Global Travel Chatbot - Available on all pages */}
          <TravelChatbot 
            itinerary={currentData.itinerary}
            suppliers={currentData.suppliers}
            contacts={currentData.contacts}
            expenses={currentData.expenses}
            todos={currentData.todos}
            appointments={currentData.appointments}
          />
        </div>
      </Router>
    </AuthGuard>
  );
}

export default App;