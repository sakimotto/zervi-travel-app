import { TodoItem } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Get dates for sample todos
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

export const sampleTodos: TodoItem[] = [
  {
    id: uuidv4(),
    title: 'Prepare business cards for Canton Fair',
    description: 'Design and print 500 business cards with Chinese translation',
    completed: false,
    priority: 'High',
    due_date: getTomorrow(),
    category: 'Business',
    assigned_to: 'Both',
    created_at: new Date().toISOString()
  },
  {
    id: uuidv4(),
    title: 'Confirm hotel booking in Shanghai',
    description: 'Call Grand Hyatt Shanghai to confirm reservation and room preferences',
    completed: true,
    priority: 'High',
    due_date: getToday(),
    category: 'Travel',
    assigned_to: 'Yok',
    created_at: new Date().toISOString()
  },
  {
    id: uuidv4(),
    title: 'Research supplier certifications',
    description: 'Verify ISO certifications for top 3 electronics suppliers',
    completed: false,
    priority: 'Medium',
    due_date: getNextWeek(),
    category: 'Supplier',
    assigned_to: 'Archie',
    created_at: new Date().toISOString()
  },
  {
    id: uuidv4(),
    title: 'Download WeChat and set up account',
    description: 'Essential for business communication in China',
    completed: false,
    priority: 'High',
    due_date: getTomorrow(),
    category: 'Business',
    assigned_to: 'Both',
    created_at: new Date().toISOString()
  },
  {
    id: uuidv4(),
    title: 'Prepare product samples for meetings',
    description: 'Pack samples for supplier presentations and quality discussions',
    completed: false,
    priority: 'Medium',
    due_date: getNextWeek(),
    category: 'Business',
    assigned_to: 'Archie',
    created_at: new Date().toISOString()
  },
];