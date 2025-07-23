import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Appointment, ItineraryItem } from '../types';

interface MiniCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  appointments: Appointment[];
  itinerary: ItineraryItem[];
}

const MiniCalendar: React.FC<MiniCalendarProps> = ({ 
  selectedDate, 
  onDateSelect, 
  appointments, 
  itinerary 
}) => {
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const hasEvents = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const hasAppointment = appointments.some(apt => apt.startDate === dateStr);
    const hasItinerary = itinerary.some(item => item.startDate === dateStr);
    return hasAppointment || hasItinerary;
  };

  const getEventTypes = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const hasAppointment = appointments.some(apt => apt.startDate === dateStr);
    const hasItinerary = itinerary.some(item => item.startDate === dateStr);
    
    if (hasAppointment && hasItinerary) return 'both';
    if (hasAppointment) return 'appointment';
    if (hasItinerary) return 'itinerary';
    return 'none';
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    onDateSelect(newDate);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {format(selectedDate, 'MMMM yyyy')}
        </h3>
        <div className="flex gap-1">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map(day => (
          <button
            key={day.toISOString()}
            onClick={() => onDateSelect(day)}
            className={`
              relative p-2 text-sm rounded hover:bg-gray-100 transition-colors min-h-[2.5rem]
              ${isSameDay(day, selectedDate) ? 'bg-primary text-white hover:bg-primary/90' : ''}
              ${isToday(day) ? 'font-bold' : ''}
            `}
          >
            {format(day, 'd')}
            {getEventTypes(day) !== 'none' && (
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                {(getEventTypes(day) === 'appointment' || getEventTypes(day) === 'both') && (
                  <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                )}
                {(getEventTypes(day) === 'itinerary' || getEventTypes(day) === 'both') && (
                  <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                )}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MiniCalendar;