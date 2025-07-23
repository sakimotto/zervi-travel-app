import React, { useState, useEffect } from 'react';
import { ItineraryItem } from '../types';
import { format, parseISO, isAfter, isBefore, addDays, startOfDay } from 'date-fns';
import { 
  Plane, Hotel, Car, Briefcase, Building, Calendar, MapPin, Clock, Edit,
  LandPlot, Train, Bus
} from 'lucide-react';

interface ItinerarySummaryProps {
  itinerary: ItineraryItem[];
  onEditItem: (item: ItineraryItem) => void;
}

const ItinerarySummary: React.FC<ItinerarySummaryProps> = ({ itinerary, onEditItem }) => {
  const [upcomingItems, setUpcomingItems] = useState<ItineraryItem[]>([]);
  
  useEffect(() => {
    const today = startOfDay(new Date());
    
    // Get upcoming items (today and future)
    const upcoming = itinerary.filter(item => {
      const itemDate = startOfDay(parseISO(item.start_date));
      // Include items from today onwards
      return !isBefore(itemDate, today);
    });
    
    // Sort upcoming items by date
    const sorted = [...upcoming].sort((a, b) => {
      // Sort by start date
      const dateComparison = parseISO(a.start_date).getTime() - parseISO(b.start_date).getTime();
      
      // If same date, sort by departure/check-in time
      if (dateComparison === 0) {
        const timeA = a.departureTime || a.checkInTime || '';
        const timeB = b.departureTime || b.checkInTime || '';
        return timeA.localeCompare(timeB);
      }
      
      return dateComparison;
    });
    
    setUpcomingItems(sorted);
  }, [itinerary]);

  const getTypeIcon = (type: string, size = 20) => {
    switch (type) {
      case 'Flight':
        return <Plane size={size} className="text-blue-500" />;
      case 'Hotel':
        return <Hotel size={size} className="text-indigo-500" />;
      case 'Taxi':
        return <Car size={size} className="text-yellow-500" />;
      case 'Train':
        return <Train size={size} className="text-amber-500" />;
      case 'Bus':
        return <Bus size={size} className="text-lime-500" />;
      case 'TradeShow':
        return <Briefcase size={size} className="text-green-500" />;
      case 'BusinessVisit':
        return <Building size={size} className="text-purple-500" />;
      case 'Sightseeing':
        return <LandPlot size={size} className="text-emerald-500" />;
      default:
        return <Calendar size={size} className="text-gray-500" />;
    }
  };

  const groupItemsByDate = (items: ItineraryItem[]) => {
    const grouped: Record<string, ItineraryItem[]> = {};
    
    items.forEach(item => {
      const dateKey = item.start_date;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(item);
    });
    
    return grouped;
  };

  const isToday = (dateString: string) => {
    const today = startOfDay(new Date());
    const itemDate = startOfDay(parseISO(dateString));
    return today.getTime() === itemDate.getTime();
  };

  const isTomorrow = (dateString: string) => {
    const tomorrow = startOfDay(addDays(new Date(), 1));
    const itemDate = startOfDay(parseISO(dateString));
    return tomorrow.getTime() === itemDate.getTime();
  };

  // Group upcoming items by date
  const groupedItems = groupItemsByDate(upcomingItems);
  
  return (
    <div>
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <div className="bg-primary text-white px-6 py-4">
          <h3 className="text-xl font-semibold">Upcoming Itinerary</h3>
          <p className="text-sm mt-1 text-white text-opacity-90">
            Your schedule for the coming days
          </p>
        </div>
        
        <div className="divide-y divide-gray-200">
          {Object.keys(groupedItems).length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No upcoming events in your itinerary.</p>
              <p className="text-sm text-gray-400 mt-2">
                Use the "Add Item" button to schedule your trip.
              </p>
            </div>
          ) : (
            Object.keys(groupedItems)
              .sort()
              .map(dateKey => {
                const formattedDate = format(parseISO(dateKey), 'EEEE, MMMM d, yyyy');
                const isDateToday = isToday(dateKey);
                const isDateTomorrow = isTomorrow(dateKey);
                let dateLabel = formattedDate;
                
                if (isDateToday) dateLabel = `Today - ${formattedDate}`;
                if (isDateTomorrow) dateLabel = `Tomorrow - ${formattedDate}`;
                
                return (
                  <div key={dateKey} className="px-6 py-4">
                    <h4 className={`font-semibold mb-4 ${isDateToday ? 'text-secondary' : 'text-gray-700'}`}>
                      {dateLabel}
                    </h4>
                    
                    <div className="space-y-4">
                      {groupedItems[dateKey]
                        .sort((a, b) => {
                          const timeA = a.departureTime || a.checkInTime || '';
                          const timeB = b.departureTime || b.checkInTime || '';
                          return timeA.localeCompare(timeB);
                        })
                        .map(item => (
                          <div key={item.id} className={`border rounded-lg p-3 ${item.confirmed ? 'border-green-200' : 'border-yellow-200'}`}>
                            <div className="flex justify-between items-start">
                              <div className="flex items-start space-x-3">
                                <div className="p-2 rounded-full bg-gray-100 flex-shrink-0 mt-1">
                                  {getTypeIcon(item.type, 18)}
                                </div>
                                <div>
                                  <div className="flex items-center">
                                    <h5 className="font-semibold text-gray-900">{item.title}</h5>
                                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                                      item.confirmed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                      {item.confirmed ? 'Confirmed' : 'Unconfirmed'}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-500">{item.type}</p>
                                  {item.location && (
                                    <div className="flex items-center text-sm text-gray-600 mt-1">
                                      <MapPin size={14} className="mr-1" />
                                      {item.location}
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex flex-col items-end">
                                {(item.departureTime || item.checkInTime) && (
                                  <div className="flex items-center text-sm font-medium text-gray-700">
                                    <Clock size={14} className="mr-1" />
                                    {item.departureTime || item.checkInTime}
                                  </div>
                                )}
                                {(item.start_time || item.end_time) && (
                                  <span className="flex items-center gap-1">
                                    <Clock size={14} />
                                    {item.start_time}
                                  </span>
                                )}
                                <button
                                  onClick={() => onEditItem(item)}
                                  className="mt-2 text-blue-500 hover:text-blue-700 text-sm"
                                >
                                  <Edit size={16} />
                                </button>
                              </div>
                            </div>
                            
                            <div className="mt-2 text-sm text-gray-600">
                              <p>{item.description}</p>
                            </div>
                            
                            {/* Compact type-specific details */}
                            {item.type === 'Flight' && item.flightNumber && (
                              <div className="mt-2 bg-blue-50 text-blue-800 text-xs p-2 rounded">
                                <span className="font-semibold">{item.airline} {item.flightNumber}</span>
                                {item.departureTime && item.arrivalTime && (
                                  <span> • {item.departureTime} - {item.arrivalTime}</span>
                                )}
                              </div>
                            )}
                            
                            {item.type === 'Train' && item.trainNumber && (
                              <div className="mt-2 bg-amber-50 text-amber-800 text-xs p-2 rounded">
                                <span className="font-semibold">Train {item.trainNumber}</span>
                                {item.trainClass && <span> • {item.trainClass}</span>}
                                {item.departureTime && item.arrivalTime && (
                                  <span> • {item.departureTime} - {item.arrivalTime}</span>
                                )}
                                {item.platform && <span> • Platform {item.platform}</span>}
                              </div>
                            )}
                            
                            {item.type === 'Bus' && item.busNumber && (
                              <div className="mt-2 bg-lime-50 text-lime-800 text-xs p-2 rounded">
                                <span className="font-semibold">Bus {item.busNumber}</span>
                                {item.busCompany && <span> • {item.busCompany}</span>}
                                {item.departureTime && item.arrivalTime && (
                                  <span> • {item.departureTime} - {item.arrivalTime}</span>
                                )}
                                {item.busStop && <span> • Stop: {item.busStop}</span>}
                              </div>
                            )}
                            
                            {item.type === 'Hotel' && item.hotelName && (
                              <div className="mt-2 bg-indigo-50 text-indigo-800 text-xs p-2 rounded">
                                <span className="font-semibold">{item.hotelName}</span>
                                {item.roomType && <span> • {item.roomType}</span>}
                                {item.checkInTime && <span> • Check-in: {item.checkInTime}</span>}
                                {item.end_date && <span> • Until: {format(parseISO(item.end_date), 'MMM d')}</span>}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>
    </div>
  );
};

export default ItinerarySummary;