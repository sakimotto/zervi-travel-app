import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, parseISO, addMonths, subMonths, startOfWeek, endOfWeek, addDays, startOfDay, isSameMonth } from 'date-fns';
import { ChevronLeft, ChevronRight, Filter, Calendar as CalendarIcon, Plane, Hotel, Car, Building2, Users, Clock, MapPin, Plus } from 'lucide-react';
import { ItineraryItem, Appointment, TodoItem } from '../types';
import AddAppointmentModal from './AddAppointmentModal';
import { useSuppliers, useBusinessContacts } from '../hooks/useSupabase';

interface CalendarViewProps {
  itinerary: ItineraryItem[];
  appointments: Appointment[];
  todos: TodoItem[];
}

interface CalendarEvent {
  id: string;
  title: string;
  type: 'itinerary' | 'appointment' | 'todo';
  subType?: string;
  date: string;
  endDate?: string;
  time?: string;
  color: string;
  icon: React.ReactNode;
  confirmed?: boolean;
  priority?: string;
  assigned_to?: string;
}

type ViewMode = 'month' | 'week' | 'day' | 'year';

const CalendarView: React.FC<CalendarViewProps> = ({ itinerary, appointments, todos }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [filterType, setFilterType] = useState<'all' | 'itinerary' | 'appointments' | 'todos'>('all');
  const [filterAssignee, setFilterAssignee] = useState<'all' | 'Archie' | 'Yok' | 'Both'>('all');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEditAppointmentModal, setShowEditAppointmentModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  
  // Get suppliers and contacts for appointment editing
  const { data: suppliers } = useSuppliers();
  const { data: contacts } = useBusinessContacts();

  // Handle appointment editing
  const handleEditAppointment = (appointmentId: string) => {
    const appointment = appointments.find(apt => apt.id === appointmentId);
    if (appointment) {
      setEditingAppointment(appointment);
      setShowEditAppointmentModal(true);
      setSelectedEvent(null);
    }
  };

  const handleSaveAppointment = (appointment: Appointment) => {
    // This would typically update the appointment in the database
    // For now, we'll just close the modal
    setShowEditAppointmentModal(false);
    setEditingAppointment(null);
  };

  // Convert all data to calendar events
  const getCalendarEvents = (): CalendarEvent[] => {
    const events: CalendarEvent[] = [];

    // Add itinerary items
    itinerary.forEach(item => {
      const getItineraryColor = (type: string) => {
        switch (type) {
          case 'Flight': return 'bg-blue-500 text-white';
          case 'Hotel': return 'bg-indigo-500 text-white';
          case 'Train': return 'bg-amber-500 text-white';
          case 'Bus': return 'bg-lime-500 text-white';
          case 'TradeShow': return 'bg-green-500 text-white';
          case 'BusinessVisit': return 'bg-purple-500 text-white';
          case 'Sightseeing': return 'bg-emerald-500 text-white';
          default: return 'bg-gray-500 text-white';
        }
      };

      const getItineraryIcon = (type: string) => {
        switch (type) {
          case 'Flight': return <Plane size={12} />;
          case 'Hotel': return <Hotel size={12} />;
          case 'Train': return <Car size={12} />;
          case 'Bus': return <Car size={12} />;
          case 'TradeShow': return <Building2 size={12} />;
          case 'BusinessVisit': return <Building2 size={12} />;
          case 'Sightseeing': return <MapPin size={12} />;
          default: return <CalendarIcon size={12} />;
        }
      };

      events.push({
        id: item.id,
        title: item.title,
        type: 'itinerary',
        subType: item.type,
        date: item.start_date,
        endDate: item.end_date,
        time: item.start_time || item.type_specific_data?.departure_time || item.type_specific_data?.check_in_time,
        color: getItineraryColor(item.type),
        icon: getItineraryIcon(item.type),
        confirmed: item.confirmed,
        assigned_to: item.assigned_to
      });
    });

    // Add appointments
    appointments.forEach(appointment => {
      events.push({
        id: appointment.id,
        title: appointment.title,
        type: 'appointment',
        subType: appointment.type,
        date: appointment.start_date,
        endDate: appointment.end_date,
        time: appointment.start_time,
        color: 'bg-blue-600 text-white',
        icon: <Users size={12} />,
        confirmed: appointment.status === 'Confirmed',
        assigned_to: appointment.assigned_to
      });
    });

    // Add todos with due dates
    todos.forEach(todo => {
      if (todo.due_date) {
        const getPriorityColor = (priority: string) => {
          switch (priority) {
            case 'High': return 'bg-red-600 text-white';
            case 'Medium': return 'bg-yellow-600 text-white';
            case 'Low': return 'bg-green-600 text-white';
            default: return 'bg-gray-600 text-white';
          }
        };

        events.push({
          id: todo.id,
          title: todo.title,
          type: 'todo',
          date: todo.due_date,
          color: getPriorityColor(todo.priority),
          icon: <Clock size={12} />,
          priority: todo.priority,
          assigned_to: todo.assigned_to
        });
      }
    });

    return events;
  };

  const events = getCalendarEvents();

  // Filter events
  const filteredEvents = events.filter(event => {
    const matchesType = filterType === 'all' || 
                       (filterType === 'itinerary' && event.type === 'itinerary') ||
                       (filterType === 'appointments' && event.type === 'appointment') ||
                       (filterType === 'todos' && event.type === 'todo');
    
    const matchesAssignee = filterAssignee === 'all' || 
                           event.assigned_to === filterAssignee ||
                           (filterAssignee === 'Both' && event.assigned_to === 'Both');
    
    return matchesType && matchesAssignee;
  });

  // Get events for a specific date
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return filteredEvents.filter(event => {
      if (event.endDate) {
        const startDate = parseISO(event.date);
        const endDate = parseISO(event.endDate);
        return date >= startDate && date <= endDate;
      }
      return event.date === dateStr;
    }).sort((a, b) => (a.time || '00:00').localeCompare(b.time || '00:00'));
  };

  // Navigation functions
  const navigateDate = (direction: 'prev' | 'next') => {
    if (viewMode === 'month' || viewMode === 'year') {
      setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
    } else if (viewMode === 'week') {
      setCurrentDate(direction === 'prev' ? addDays(currentDate, -7) : addDays(currentDate, 7));
    } else if (viewMode === 'day') {
      setCurrentDate(direction === 'prev' ? addDays(currentDate, -1) : addDays(currentDate, 1));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Helper function to get multi-day events that span across the calendar
  const getMultiDayEvents = (days: Date[]) => {
    const multiDayEvents: Array<{
      event: CalendarEvent;
      startCol: number;
      endCol: number;
      row: number;
    }> = [];

    const processedEvents = new Set<string>();

    filteredEvents.forEach(event => {
      if (event.endDate && !processedEvents.has(event.id)) {
        const startDate = parseISO(event.date);
        const endDate = parseISO(event.endDate);
        
        // Find start and end positions in the calendar grid
        const startIndex = days.findIndex(day => isSameDay(day, startDate));
        const endIndex = days.findIndex(day => isSameDay(day, endDate));
        
        if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
          const startCol = startIndex % 7;
          const endCol = endIndex % 7;
          const startRow = Math.floor(startIndex / 7);
          const endRow = Math.floor(endIndex / 7);
          
          // Handle events that span multiple weeks
          if (startRow === endRow) {
            // Same row - simple case
            multiDayEvents.push({
              event,
              startCol,
              endCol,
              row: startRow
            });
          } else {
            // Multiple rows - create segments for each row
            for (let row = startRow; row <= endRow; row++) {
              const segmentStartCol = row === startRow ? startCol : 0;
              const segmentEndCol = row === endRow ? endCol : 6;
              
              multiDayEvents.push({
                event,
                startCol: segmentStartCol,
                endCol: segmentEndCol,
                row
              });
            }
          }
          processedEvents.add(event.id);
        }
      }
    });

    return multiDayEvents;
  };

  // Render different view modes
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    const multiDayEvents = getMultiDayEvents(days);
    const weeks = [];
    
    // Group days into weeks
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden w-full">
        <div className="grid grid-cols-7 bg-gray-50 border-b">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <div key={day} className="p-1 sm:p-3 text-center font-medium text-gray-700 border-r last:border-r-0 text-xs sm:text-sm">
              {day}
            </div>
          ))}
        </div>
        
        <div className="relative">
          {/* Multi-day event bars */}
          {multiDayEvents.map((multiEvent, index) => {
            const { event, startCol, endCol, row } = multiEvent;
            const width = ((endCol - startCol + 1) / 7) * 100;
            const left = (startCol / 7) * 100;
            const top = row * 120 + 30; // Adjust based on cell height
            
            return (
              <div
                key={`${event.id}-${row}-${index}`}
                onClick={() => setSelectedEvent(event)}
                className={`absolute z-10 ${event.color} rounded-md px-2 py-1 cursor-pointer hover:opacity-80 shadow-sm`}
                style={{
                  left: `${left}%`,
                  width: `${width}%`,
                  top: `${top}px`,
                  height: '20px'
                }}
                title={`${event.title} (${format(parseISO(event.date), 'MMM d')} - ${format(parseISO(event.endDate!), 'MMM d')})`}
              >
                <div className="flex items-center gap-1 text-xs truncate">
                  <span className="hidden sm:inline">{event.icon}</span>
                  <span className="truncate">{event.title}</span>
                  {event.subType === 'Hotel' && (
                    <span className="text-xs opacity-75">({Math.ceil((parseISO(event.endDate!) - parseISO(event.date)) / (1000 * 60 * 60 * 24))} nights)</span>
                  )}
                </div>
              </div>
            );
          })}
          
          {/* Regular calendar grid */}
          <div className="grid grid-cols-7">
            {days.map(day => {
              const dayEvents = getEventsForDate(day).filter(event => !event.endDate || isSameDay(parseISO(event.date), day));
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isCurrentDay = isToday(day);

              return (
                <div 
                  key={day.toISOString()} 
                  className={`min-h-[80px] sm:min-h-[120px] p-1 sm:p-2 border-r border-b last:border-r-0 relative ${
                    !isCurrentMonth ? 'bg-gray-50' : ''
                  } ${isCurrentDay ? 'bg-blue-50' : ''}`}
                >
                  <div className={`text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${
                    !isCurrentMonth ? 'text-gray-400' : isCurrentDay ? 'text-blue-600' : 'text-gray-700'
                  }`}>
                    {format(day, 'd')}
                  </div>
                  
                  {/* Single day events */}
                  <div className="space-y-0.5 sm:space-y-1 mt-6">
                    {dayEvents.slice(0, 2).map(event => (
                      <div
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        className={`text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded cursor-pointer ${event.color} truncate flex items-center gap-0.5 sm:gap-1 hover:opacity-80`}
                        title={`${event.title} ${event.time ? `at ${event.time}` : ''}`}
                      >
                        <span className="hidden sm:inline">{event.icon}</span>
                        <span className="truncate text-xs">{event.title}</span>
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div 
                        className="text-xs text-gray-500 px-1 sm:px-2 cursor-pointer hover:text-gray-700"
                        onClick={() => {
                          setCurrentDate(day);
                          setViewMode('day');
                        }}
                      >
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="grid grid-cols-8 bg-gray-50 border-b">
          <div className="p-3 border-r"></div>
          {weekDays.map(day => (
            <div key={day.toISOString()} className="p-3 text-center border-r last:border-r-0">
              <div className={`font-medium ${isToday(day) ? 'text-blue-600' : 'text-gray-700'}`}>
                {format(day, 'EEE')}
              </div>
              <div className={`text-lg ${isToday(day) ? 'text-blue-600 font-bold' : 'text-gray-900'}`}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {hours.map(hour => (
            <div key={hour} className="grid grid-cols-8 border-b">
              <div className="p-2 border-r bg-gray-50 text-xs text-gray-600 text-center">
                {format(new Date().setHours(hour, 0), 'HH:mm')}
              </div>
              {weekDays.map(day => {
                const dayEvents = getEventsForDate(day).filter(event => {
                  if (!event.time) return hour === 9; // Default to 9 AM for events without time
                  const eventHour = parseInt(event.time.split(':')[0]);
                  return eventHour === hour;
                });

                return (
                  <div key={`${day.toISOString()}-${hour}`} className="p-1 border-r last:border-r-0 min-h-[40px]">
                    {dayEvents.map(event => (
                      <div
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        className={`text-xs px-2 py-1 rounded cursor-pointer ${event.color} mb-1 flex items-center gap-1`}
                        title={event.title}
                      >
                        {event.icon}
                        <span className="truncate">{event.title}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const dayEvents = getEventsForDate(currentDate);
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gray-50 p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {format(currentDate, 'EEEE, MMMM d, yyyy')}
          </h3>
          <p className="text-sm text-gray-600">{dayEvents.length} events scheduled</p>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {hours.map(hour => {
            const hourEvents = dayEvents.filter(event => {
              if (!event.time) return hour === 9;
              const eventHour = parseInt(event.time.split(':')[0]);
              return eventHour === hour;
            });

            return (
              <div key={hour} className="flex border-b">
                <div className="w-20 p-3 bg-gray-50 border-r text-sm text-gray-600 text-center">
                  {format(new Date().setHours(hour, 0), 'HH:mm')}
                </div>
                <div className="flex-1 p-3 min-h-[60px]">
                  {hourEvents.map(event => (
                    <div
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className={`p-3 rounded-lg cursor-pointer ${event.color} mb-2 last:mb-0`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {event.icon}
                        <span className="font-medium">{event.title}</span>
                        {event.time && (
                          <span className="text-xs opacity-75">{event.time}</span>
                        )}
                      </div>
                      <div className="text-xs opacity-90">{event.subType}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderYearView = () => {
    const year = currentDate.getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {months.map(month => {
          const monthStart = startOfMonth(month);
          const monthEnd = endOfMonth(month);
          const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
          
          return (
            <div key={month.toISOString()} className="bg-white rounded-lg shadow-sm border p-3">
              <h4 className="font-semibold text-center mb-2 text-gray-900">
                {format(month, 'MMMM')}
              </h4>
              <div className="grid grid-cols-7 gap-1 text-xs">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                  <div key={day} className="text-center text-gray-500 font-medium p-1">
                    {day}
                  </div>
                ))}
                {monthDays.map(day => {
                  const dayEvents = getEventsForDate(day);
                  const hasEvents = dayEvents.length > 0;
                  
                  return (
                    <div
                      key={day.toISOString()}
                      onClick={() => {
                        setCurrentDate(day);
                        setViewMode('day');
                      }}
                      className={`p-1 text-center cursor-pointer rounded ${
                        isToday(day) ? 'bg-blue-500 text-white' : 
                        hasEvents ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
                      }`}
                    >
                      {format(day, 'd')}
                      {hasEvents && (
                        <div className="w-1 h-1 bg-current rounded-full mx-auto mt-0.5"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const getViewTitle = () => {
    switch (viewMode) {
      case 'month':
        return format(currentDate, 'MMMM yyyy');
      case 'week':
        const weekStart = startOfWeek(currentDate);
        const weekEnd = endOfWeek(currentDate);
        return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
      case 'day':
        return format(currentDate, 'EEEE, MMMM d, yyyy');
      case 'year':
        return format(currentDate, 'yyyy');
      default:
        return '';
    }
  };

  return (
    <section id="calendar" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-primary font-montserrat mb-3">
            Travel Calendar
          </h2>
          <p className="text-base text-gray-700 max-w-3xl mx-auto">
            Complete overview of your business travel plans, meetings, and tasks
          </p>
        </div>

        {/* Controls */}
        <div className="mb-4 sm:mb-8 flex flex-col gap-2 sm:gap-4">
          <div className="flex items-center gap-4">
            {/* View Mode Selector */}
            <div className="flex bg-gray-100 rounded-lg p-0.5 w-full sm:w-auto">
              {(['month', 'week', 'day', 'year'] as ViewMode[]).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`flex-1 sm:flex-none px-2 py-1 rounded-md text-xs font-medium capitalize ${
                    viewMode === mode 
                      ? 'bg-white shadow-sm text-primary' 
                      : 'text-gray-700 hover:text-primary'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => navigateDate('prev')}
                className="p-1 sm:p-1.5 hover:bg-gray-200 rounded-full"
              >
                <ChevronLeft size={16} />
              </button>
              <h3 className="text-xs sm:text-base font-semibold text-gray-900 min-w-[100px] sm:min-w-[200px] text-center">
                {getViewTitle()}
              </h3>
              <button
                onClick={() => navigateDate('next')}
                className="p-1 sm:p-1.5 hover:bg-gray-200 rounded-full"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <button
              onClick={goToToday}
              className="px-2 py-1 sm:py-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 text-xs"
            >
              Today
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-1 sm:gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1">
              <Filter size={14} className="text-gray-500" />
              <span className="text-gray-700 text-xs sm:text-sm hidden sm:inline">Filter:</span>
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="flex-1 sm:flex-none px-2 py-1 sm:py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-xs min-w-[80px] sm:min-w-[120px]"
            >
              <option value="all">All Events</option>
              <option value="itinerary">Travel & Itinerary</option>
              <option value="appointments">Appointments</option>
              <option value="todos">Tasks & Todos</option>
            </select>

            <select
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value as any)}
              className="flex-1 sm:flex-none px-2 py-1 sm:py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-xs min-w-[80px] sm:min-w-[120px]"
            >
              <option value="all">All Assignees</option>
              <option value="Archie">Archie</option>
              <option value="Yok">Yok</option>
              <option value="Both">Both</option>
            </select>
          </div>
        </div>

        {/* Calendar Content */}
        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'day' && renderDayView()}
        {viewMode === 'year' && renderYearView()}

        {/* Event Details Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-full ${selectedEvent.color}`}>
                    {selectedEvent.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedEvent.title}</h3>
                    <p className="text-sm text-gray-600">{selectedEvent.subType}</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">
                      {selectedEvent.endDate ? 'Duration:' : 'Date:'}
                    </span> 
                    {selectedEvent.endDate ? (
                      <span>
                        {format(parseISO(selectedEvent.date), 'MMM d, yyyy')} - {format(parseISO(selectedEvent.endDate), 'MMM d, yyyy')}
                        {selectedEvent.subType === 'Hotel' && (
                          <span className="text-gray-600 ml-2">
                            ({Math.ceil((parseISO(selectedEvent.endDate) - parseISO(selectedEvent.date)) / (1000 * 60 * 60 * 24))} nights)
                          </span>
                        )}
                      </span>
                    ) : (
                      format(parseISO(selectedEvent.date), 'MMMM d, yyyy')
                    )}
                  </div>
                  {selectedEvent.time && (
                    <div>
                      <span className="font-medium">Time:</span> {selectedEvent.time}
                    </div>
                  )}
                  {selectedEvent.assigned_to && (
                    <div>
                      <span className="font-medium">Assigned to:</span> {selectedEvent.assigned_to}
                    </div>
                  )}
                  {selectedEvent.confirmed !== undefined && (
                    <div>
                      <span className="font-medium">Status:</span> {selectedEvent.confirmed ? 'Confirmed' : 'Pending'}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between mt-6">
                  {selectedEvent.type === 'itinerary' && (
                    <button
                      onClick={() => {
                        setSelectedEvent(null);
                        window.location.href = '/itinerary';
                      }}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                    >
                      Open Itinerary
                    </button>
                  )}
                  {selectedEvent.type === 'appointment' && (
                    <button
                      onClick={() => {
                        handleEditAppointment(selectedEvent.id);
                      }}
                      className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90"
                    >
                      Edit Appointment
                    </button>
                  )}
                  {selectedEvent.type === 'todo' && (
                    <button
                      onClick={() => {
                        setSelectedEvent(null);
                        window.location.href = '/dashboard';
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Edit Task
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xl font-bold text-blue-600">
              {filteredEvents.filter(e => e.type === 'itinerary').length}
            </div>
            <div className="text-sm text-gray-600">Travel Items</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xl font-bold text-green-600">
              {filteredEvents.filter(e => e.type === 'appointment').length}
            </div>
            <div className="text-sm text-gray-600">Appointments</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xl font-bold text-yellow-600">
              {filteredEvents.filter(e => e.type === 'todo').length}
            </div>
            <div className="text-sm text-gray-600">Tasks</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xl font-bold text-purple-600">
              {filteredEvents.filter(e => e.confirmed === false).length}
            </div>
            <div className="text-sm text-gray-600">Unconfirmed</div>
          </div>
        </div>
      </div>

      {/* Edit Appointment Modal */}
      {showEditAppointmentModal && editingAppointment && (
        <AddAppointmentModal
          onClose={() => {
            setShowEditAppointmentModal(false);
            setEditingAppointment(null);
          }}
          onSave={handleSaveAppointment}
          editAppointment={editingAppointment}
          suppliers={suppliers}
          contacts={contacts}
          selectedDate={parseISO(editingAppointment.start_date)}
        />
      )}
    </section>
  );
};

export default CalendarView;