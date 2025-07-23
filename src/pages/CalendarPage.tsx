import React, { useState, useEffect } from 'react';
import CalendarView from '../components/CalendarView';
import Footer from '../components/Footer';
import { 
  useItineraryItems,
  useSuppliers,
  useBusinessContacts,
  useTodos,
  useAppointments
} from '../hooks/useSupabase';

const CalendarPage: React.FC = () => {
  // Use Supabase hooks for real-time data
  const { data: itinerary } = useItineraryItems();
  const { data: suppliers } = useSuppliers();
  const { data: contacts } = useBusinessContacts();
  const { data: todos } = useTodos();
  const { data: appointments } = useAppointments();

  return (
    <>
      <CalendarView 
        itinerary={itinerary}
        appointments={appointments}
        todos={todos}
        suppliers={suppliers}
        contacts={contacts}
      />
      <Footer />
    </>
  );
};

export default CalendarPage;