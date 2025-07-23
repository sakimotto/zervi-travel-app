import { TravelerOption } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const defaultTravelers: TravelerOption[] = [
  {
    id: uuidv4(),
    name: 'Archie',
    role: 'Business Development',
    active: true
  },
  {
    id: uuidv4(),
    name: 'Yok',
    role: 'Operations Manager',
    active: true
  },
  {
    id: uuidv4(),
    name: 'Both',
    role: 'Team Assignment',
    active: true
  }
];

// Get travelers from localStorage or use defaults
export const getTravelers = (): TravelerOption[] => {
  try {
    const stored = localStorage.getItem('zervi-travelers');
    if (stored) {
      return JSON.parse(stored);
    }
    return defaultTravelers;
  } catch (error) {
    console.error('Error loading travelers:', error);
    return defaultTravelers;
  }
};

// Save travelers to localStorage
export const saveTravelers = (travelers: TravelerOption[]): void => {
  try {
    localStorage.setItem('zervi-travelers', JSON.stringify(travelers));
  } catch (error) {
    console.error('Error saving travelers:', error);
  }
};

// Add a new traveler
export const addTraveler = (name: string, role?: string): TravelerOption => {
  const travelers = getTravelers();
  const newTraveler: TravelerOption = {
    id: uuidv4(),
    name: name.trim(),
    role: role?.trim(),
    active: true
  };
  
  const updatedTravelers = [...travelers, newTraveler];
  saveTravelers(updatedTravelers);
  return newTraveler;
};

// Get active traveler names for dropdowns
export const getActiveTravelerNames = (): string[] => {
  return getTravelers()
    .filter(t => t.active)
    .map(t => t.name);
};