import React, { useState, useEffect } from 'react';
import Dashboard from '../components/Dashboard';
import Footer from '../components/Footer';
import SampleDataLoader from '../components/SampleDataLoader';
import { 
  useItineraryItems,
  useSuppliers,
  useBusinessContacts,
  useExpenses,
  useTodos,
  useAppointments
} from '../hooks/useSupabase';

const DashboardPage: React.FC = () => {
  // Use Supabase hooks for real-time data
  const { data: itinerary } = useItineraryItems();
  const { data: suppliers } = useSuppliers();
  const { data: contacts } = useBusinessContacts();
  const { data: expenses } = useExpenses();
  const { data: todos } = useTodos();
  const { data: appointments } = useAppointments();

  return (
    <>
      <Dashboard 
        itinerary={itinerary}
        suppliers={suppliers}
        contacts={contacts}
        expenses={expenses}
        todos={todos}
        appointments={appointments}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SampleDataLoader />
      </div>
      <Footer />
    </>
  );
};

export default DashboardPage;