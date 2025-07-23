import { ItineraryItem } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { hasCustomSampleData, getCustomSampleItinerary } from '../utils/localStorage';

// Get custom sample data if it exists
const customItinerary = hasCustomSampleData() ? getCustomSampleItinerary() : null;

// Get tomorrow's date for the initial sample data
const getTomorrow = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

// Get date 2 days from now
const getDayAfterTomorrow = () => {
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);
  return dayAfter.toISOString().split('T')[0];
};

// Get date 3 days from now
const getThreeDaysFromNow = () => {
  const threeDays = new Date();
  threeDays.setDate(threeDays.getDate() + 3);
  return threeDays.toISOString().split('T')[0];
};

// Get date 4 days from now
const getFourDaysFromNow = () => {
  const fourDays = new Date();
  fourDays.setDate(fourDays.getDate() + 4);
  return fourDays.toISOString().split('T')[0];
};

// Next week dates for Canton Fair
const getNextWeekStart = () => {
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  return nextWeek.toISOString().split('T')[0];
};

const getNextWeekEnd = () => {
  const nextWeekEnd = new Date();
  nextWeekEnd.setDate(nextWeekEnd.getDate() + 11); // 5 days after next week starts
  return nextWeekEnd.toISOString().split('T')[0];
};

// Default itinerary if no custom data exists
const defaultItinerary: ItineraryItem[] = [
  {
    id: uuidv4(),
    type: 'Flight',
    title: 'Flight to Beijing',
    description: 'International flight from LAX to PEK',
    start_date: getTomorrow(),
    start_time: '13:40',
    end_time: '18:20',
    location: 'Los Angeles to Beijing',
    assigned_to: 'Both',
    confirmed: true,
    notes: 'Remember to arrive 3 hours early',
    type_specific_data: {
      flightNumber: 'CA988',
      airline: 'Air China',
      departureTime: '13:40',
      arrivalTime: '18:20',
    },
  },
  {
    id: uuidv4(),
    type: 'Hotel',
    title: 'Beijing International Hotel',
    description: 'Hotel stay in downtown Beijing',
    start_date: getTomorrow(),
    end_date: getFourDaysFromNow(),
    start_time: '15:00',
    end_time: '12:00',
    location: 'Beijing',
    assigned_to: 'Both',
    confirmed: true,
    type_specific_data: {
      hotelName: 'Beijing International Hotel',
      roomType: 'Double Suite',
      checkInTime: '15:00',
      checkOutTime: '12:00',
    },
  },
  {
    id: uuidv4(),
    type: 'TradeShow',
    title: 'China International Import Expo',
    description: 'Annual trade show for international products',
    start_date: getDayAfterTomorrow(),
    end_date: getThreeDaysFromNow(),
    start_time: '09:00',
    end_time: '18:00',
    location: 'National Exhibition Center, Shanghai',
    assigned_to: 'Both',
    confirmed: true,
    notes: 'Bring business cards and product samples',
  },
  {
    id: uuidv4(),
    type: 'Train',
    title: 'Fast Train to Shanghai',
    description: 'High-speed train from Beijing to Shanghai',
    start_date: getDayAfterTomorrow(),
    start_time: '08:00',
    end_time: '12:30',
    location: 'Beijing South Railway Station',
    assigned_to: 'Both',
    confirmed: true,
    notes: 'Tickets are e-tickets, show passport at station',
    type_specific_data: {
      trainNumber: 'G13',
      trainClass: 'First Class',
      departureTime: '08:00',
      arrivalTime: '12:30',
      platform: '5',
    },
  },
  {
    id: uuidv4(),
    type: 'BusinessVisit',
    title: 'Meeting with Sunshine Tech',
    description: 'Product presentation and partnership discussion',
    start_date: getDayAfterTomorrow(),
    start_time: '14:00',
    end_time: '16:00',
    location: 'Sunshine Tech HQ, Shanghai',
    assigned_to: 'Archie',
    confirmed: false,
    type_specific_data: {
      contactName: 'Li Wei',
      contactPhone: '+86 10 12345678',
      companyName: 'Sunshine Tech Co., Ltd.',
    },
  },
  {
    id: uuidv4(),
    type: 'Sightseeing',
    title: 'Visit the Bund',
    description: 'Exploring the famous waterfront area of Shanghai',
    start_date: getThreeDaysFromNow(),
    start_time: '10:00',
    end_time: '13:00',
    location: 'The Bund, Shanghai',
    assigned_to: 'Both',
    confirmed: true,
    notes: 'Great photo opportunity of the Pudong skyline',
    type_specific_data: {
      entranceFee: 'Free',
      openingHours: 'All day',
      tourDuration: '3 hours',
    },
  },
  {
    id: uuidv4(),
    type: 'Bus',
    title: 'City Bus Tour',
    description: 'Sightseeing bus tour around Shanghai',
    start_date: getThreeDaysFromNow(),
    start_time: '14:00',
    end_time: '17:00',
    location: 'Shanghai City Center',
    assigned_to: 'Both',
    confirmed: true,
    notes: 'Hop-on, hop-off service, ticket valid all day',
    type_specific_data: {
      busNumber: '77',
      busCompany: 'Shanghai Tourist Bus Co.',
      departureTime: '14:00',
      arrivalTime: '17:00',
      busStop: 'People\'s Square Main Station',
    },
  },
  {
    id: uuidv4(),
    type: 'Train',
    title: 'Return to Beijing',
    description: 'High-speed train back to Beijing',
    start_date: getFourDaysFromNow(),
    start_time: '09:30',
    end_time: '14:00',
    location: 'Shanghai Hongqiao Railway Station',
    assigned_to: 'Both',
    confirmed: true,
    type_specific_data: {
      trainNumber: 'G22',
      trainClass: 'Business Class',
      departureTime: '09:30',
      arrivalTime: '14:00',
      platform: '8',
    },
  },
  {
    id: uuidv4(),
    type: 'Taxi',
    title: 'Airport to Hotel Transfer',
    description: 'Private car service from PEK to hotel',
    start_date: getTomorrow(),
    start_time: '19:00',
    end_time: '20:30',
    location: 'Beijing Capital International Airport',
    assigned_to: 'Both',
    confirmed: true,
    notes: 'Driver will be holding a sign with "Archie & Yok"',
  },
  // Canton Fair entries
  {
    id: uuidv4(),
    type: 'Flight',
    title: 'Flight to Guangzhou',
    description: 'Flight to attend the Canton Fair',
    start_date: getNextWeekStart(),
    start_time: '09:15',
    end_time: '12:00',
    location: 'Beijing to Guangzhou',
    assigned_to: 'Both',
    confirmed: true,
    notes: 'Check-in luggage with product samples',
    type_specific_data: {
      flightNumber: 'CZ3104',
      airline: 'China Southern',
      departureTime: '09:15',
      arrivalTime: '12:00',
    },
  },
  {
    id: uuidv4(),
    type: 'Hotel',
    title: 'LN Garden Hotel Guangzhou',
    description: 'Stay during Canton Fair period',
    start_date: getNextWeekStart(),
    end_date: getNextWeekEnd(),
    start_time: '14:00',
    location: 'Guangzhou',
    assigned_to: 'Both',
    confirmed: true,
    notes: 'Hotel offers free shuttle to Canton Fair Complex',
    type_specific_data: {
      hotelName: 'LN Garden Hotel Guangzhou',
      roomType: 'Business Suite',
      checkInTime: '14:00',
      checkOutTime: '12:00',
    },
  },
  {
    id: uuidv4(),
    type: 'TradeShow',
    title: 'Canton Fair - Phase 1',
    description: 'China Import and Export Fair (Canton Fair) attendance',
    start_date: getNextWeekStart(),
    end_date: getNextWeekEnd(),
    start_time: '09:00',
    end_time: '18:00',
    location: 'Canton Fair Complex, Guangzhou',
    assigned_to: 'Both',
    confirmed: true,
    notes: 'Bring business cards, product catalogs, and comfortable shoes. Focus on Halls 1-5 (Electronics & Household Appliances). Pre-register for faster entry.',
  },
  {
    id: uuidv4(),
    type: 'BusinessVisit',
    title: 'Meeting with GZ Trading Co.',
    description: 'Follow-up meeting with Canton Fair contact',
    start_date: getNextWeekEnd(),
    start_time: '10:00',
    end_time: '12:00',
    location: 'GZ Trading Co. Office, Guangzhou',
    assigned_to: 'Both',
    confirmed: false,
    notes: 'Discuss potential partnership and product orders',
    type_specific_data: {
      contactName: 'Zhang Wei',
      contactPhone: '+86 20 87654321',
      companyName: 'GZ Trading Co.',
    },
  }
];

// Export either custom or default itinerary
export const sampleItinerary: ItineraryItem[] = customItinerary || defaultItinerary;