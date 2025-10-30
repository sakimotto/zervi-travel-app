import { TravelerOption } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

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

// Sample traveler profiles with passport/visa details
export const sampleTravelerProfiles = [
  {
    id: uuidv4(),
    name: 'Archie',
    email: 'archie@zervi.com',
    phone: '+1 555 0123',
    passport_number: 'US123456789',
    passport_expiry: '2028-06-15',
    passport_country: 'United States',
    visa_status: 'Valid' as const,
    visa_expiry: '2025-12-31',
    emergency_contact_name: 'Sarah Johnson',
    emergency_contact_phone: '+1 555 0199',
    dietary_restrictions: ['No shellfish'],
    preferred_airlines: ['Air China', 'United Airlines'],
    frequent_flyer_numbers: {
      'Air China': 'AC123456789',
      'United': 'UA987654321'
    },
    hotel_preferences: 'Business hotels near city center, non-smoking rooms',
    travel_insurance: 'Global Travel Insurance - Policy #GTI789456',
    medical_conditions: 'None'
  },
  {
    id: uuidv4(),
    name: 'Yok',
    email: 'yok@zervi.com',
    phone: '+66 2 415 2174',
    passport_number: 'TH987654321',
    passport_expiry: '2027-03-20',
    passport_country: 'Thailand',
    visa_status: 'Valid' as const,
    visa_expiry: '2025-11-15',
    emergency_contact_name: 'Somchai Zervi',
    emergency_contact_phone: '+66 2 415 2175',
    dietary_restrictions: ['Vegetarian'],
    preferred_airlines: ['Thai Airways', 'China Southern'],
    frequent_flyer_numbers: {
      'Thai Airways': 'TG555666777',
      'China Southern': 'CZ111222333'
    },
    hotel_preferences: 'Hotels with gym facilities, vegetarian restaurant options',
    travel_insurance: 'Asia Travel Cover - Policy #ATC456123',
    medical_conditions: 'Mild food allergies'
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
    logger.error('Error loading travelers:', error);
    return defaultTravelers;
  }
};

// Save travelers to localStorage
export const saveTravelers = (travelers: TravelerOption[]): void => {
  try {
    localStorage.setItem('zervi-travelers', JSON.stringify(travelers));
  } catch (error) {
    logger.error('Error saving travelers:', error);
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