import React, { useState, useEffect } from 'react';
import Dashboard from '../components/Dashboard';
import Footer from '../components/Footer';
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
      <Footer />
    </>
  );
};

export default DashboardPage;