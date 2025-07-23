import React, { useState, useEffect } from 'react';
import CalendarView from '../components/CalendarView';
import Footer from '../components/Footer';
import { 
  useItineraryItems,
  useTodos,
  useAppointments
} from '../hooks/useSupabase';

const CalendarPage: React.FC = () => {
  // Use Supabase hooks for real-time data
  const { data: itinerary } = useItineraryItems();
  const { data: todos } = useTodos();
  const { data: appointments } = useAppointments();

  return (
    <>
      <CalendarView 
        itinerary={itinerary}
        appointments={appointments}
        todos={todos}
      />
      <Footer />
    </>
  );
};

export default CalendarPage;