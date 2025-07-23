import { Appointment } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Get dates for sample appointments
const getToday = () => {
  return new Date().toISOString().split('T')[0];
};

const getTomorrow = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

const getNextWeek = () => {
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  return nextWeek.toISOString().split('T')[0];
};

export const sampleAppointments: Appointment[] = [
  {
    id: uuidv4(),
    title: 'Supplier Meeting - Shenzhen Electronics',
    description: 'Discuss new product line and pricing for Q2 orders',
    start_date: getTomorrow(),
    start_time: '10:00',
    end_time: '11:30',
    location: 'Shenzhen Electronics Manufacturing Co., Building A',
    attendees: ['Li Wei', 'Zhang Ming'],
    type: 'Supplier Meeting',
    status: 'Confirmed',
    reminder: 30,
    notes: 'Bring product samples and pricing sheets',
    supplier_id: 'supplier-1',
    assigned_to: 'Both',
  },
  {
    id: uuidv4(),
    title: 'Video Call - US Headquarters',
    description: 'Weekly status update on China operations',
    start_date: getToday(),
    start_time: '09:00',
    end_time: '10:00',
    location: 'Hotel Business Center',
    attendees: ['Sarah Johnson', 'Mike Chen'],
    type: 'Call',
    status: 'Scheduled',
    reminder: 15,
    notes: 'Prepare supplier evaluation report',
    assigned_to: 'Both',
  },
  {
    id: uuidv4(),
    title: 'Factory Tour - Guangzhou Textile',
    description: 'Quality inspection and production capacity assessment',
    start_date: getNextWeek(),
    start_time: '14:00',
    end_time: '17:00',
    location: 'Guangzhou Textile Solutions Ltd., Factory Floor',
    attendees: ['Zhang Ming', 'Quality Manager'],
    type: 'Factory Visit',
    status: 'Scheduled',
    reminder: 60,
    notes: 'Bring safety equipment and quality checklist',
    supplier_id: 'supplier-2',
    assigned_to: 'Archie',
  },
  {
    id: uuidv4(),
    title: 'Business Dinner',
    description: 'Relationship building with key suppliers',
    start_date: getTomorrow(),
    start_time: '19:00',
    end_time: '21:00',
    location: 'Jade Garden Restaurant, Private Room 3',
    attendees: ['Li Wei', 'Wang Xiaoli', 'Chen Hui'],
    type: 'Meeting',
    status: 'Confirmed',
    reminder: 45,
    notes: 'Traditional Chinese business etiquette expected',
    assigned_to: 'Both',
  },
];