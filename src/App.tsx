import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TravelChatbot from './components/TravelChatbot';
import { useState, useEffect } from 'react';
import {
  useItineraryItems,
  useSuppliers,
  useBusinessContacts,
  useExpenses,
  useTodos,
  useAppointments
} from './hooks/useSupabase';

// Lazy load components for better performance
const HomePage = React.lazy(() => import('./pages/HomePage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const TripsPage = React.lazy(() => import('./pages/TripsPage'));
const EntitiesPage = React.lazy(() => import('./pages/EntitiesPage'));
const CustomersPage = React.lazy(() => import('./pages/CustomersPage'));
const TradeShowsPage = React.lazy(() => import('./pages/TradeShowsPage'));
const FlightsPage = React.lazy(() => import('./pages/FlightsPage'));
const CarsPage = React.lazy(() => import('./pages/CarsPage'));
const HotelsPage = React.lazy(() => import('./pages/HotelsPage'));
const MeetingsPage = React.lazy(() => import('./pages/MeetingsPage'));
const DestinationsPage = React.lazy(() => import('./pages/DestinationsPage'));
const SuppliersPage = React.lazy(() => import('./pages/SuppliersPage'));
const ContactsPage = React.lazy(() => import('./pages/ContactsPage'));
const ItineraryPage = React.lazy(() => import('./pages/ItineraryPage'));
const CalendarPage = React.lazy(() => import('./pages/CalendarPage'));
const ExpensesPage = React.lazy(() => import('./pages/ExpensesPage'));
const TipsPage = React.lazy(() => import('./pages/TipsPage'));
const PhrasesPage = React.lazy(() => import('./pages/PhrasesPage'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));
const UserManualPage = React.lazy(() => import('./pages/UserManualPage'));

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
  // Use live Supabase data for chatbot
  const { data: itinerary } = useItineraryItems();
  const { data: suppliers } = useSuppliers();
  const { data: contacts } = useBusinessContacts();
  const { data: expenses } = useExpenses();
  const { data: todos } = useTodos();
  const { data: appointments } = useAppointments();

  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="lg:ml-64">
          <React.Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/trips" element={<TripsPage />} />
              <Route path="/entities" element={<EntitiesPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/tradeshows" element={<TradeShowsPage />} />
              <Route path="/flights" element={<FlightsPage />} />
              <Route path="/cars" element={<CarsPage />} />
              <Route path="/hotels" element={<HotelsPage />} />
              <Route path="/meetings" element={<MeetingsPage />} />
              <Route path="/destinations" element={<DestinationsPage />} />
              <Route path="/suppliers" element={<SuppliersPage />} />
              <Route path="/contacts" element={<ContactsPage />} />
              <Route path="/itinerary" element={<ItineraryPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/expenses" element={<ExpensesPage />} />
              <Route path="/tips" element={<TipsPage />} />
              <Route path="/phrases" element={<PhrasesPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/user-manual" element={<UserManualPage />} />
            </Routes>
          </React.Suspense>

          {/* Global Travel Chatbot - Available on all pages */}
          <TravelChatbot
            itinerary={itinerary}
            suppliers={suppliers}
            contacts={contacts}
            expenses={expenses}
            todos={todos}
            appointments={appointments}
          />
        </div>
      </div>
    </Router>
  );
}

export default App;