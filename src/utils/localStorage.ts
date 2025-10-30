import { ItineraryItem } from '../types';
import { Destination } from '../types';
import { TodoItem, Appointment, Supplier, BusinessContact, Expense } from '../types';
import { logger } from './logger';

// Local storage keys
const ITINERARY_STORAGE_KEY = 'china-explorer-itinerary';
const DESTINATIONS_STORAGE_KEY = 'china-explorer-destinations';
const TODOS_STORAGE_KEY = 'china-business-todos';
const APPOINTMENTS_STORAGE_KEY = 'china-business-appointments';
const SUPPLIERS_STORAGE_KEY = 'china-business-suppliers';
const CONTACTS_STORAGE_KEY = 'china-business-contacts';
const EXPENSES_STORAGE_KEY = 'china-business-expenses';
const CUSTOM_SAMPLE_ITINERARY_KEY = 'china-explorer-custom-sample-itinerary';
const CUSTOM_SAMPLE_DESTINATIONS_KEY = 'china-explorer-custom-sample-destinations';
const CUSTOM_SAMPLE_EXISTS_KEY = 'china-explorer-custom-sample-exists';
const LAST_SYNC_KEY = 'china-explorer-last-sync';

/**
 * Get the last sync timestamp
 */
const getLastSyncTime = (): number => {
  try {
    const timestamp = localStorage.getItem(LAST_SYNC_KEY);
    return timestamp ? parseInt(timestamp, 10) : 0;
  } catch (error) {
    return 0;
  }
};

/**
 * Update the last sync timestamp
 */
const updateLastSyncTime = () => {
  localStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
};

/**
 * Save itinerary items to local storage
 */
export const saveItineraryToLocalStorage = (items: ItineraryItem[]): void => {
  try {
    localStorage.setItem(ITINERARY_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    logger.error('Error saving itinerary to local storage:', error);
  }
};

/**
 * Get itinerary items from local storage
 */
export const getItineraryFromLocalStorage = (): ItineraryItem[] | null => {
  try {
    const storedItems = localStorage.getItem(ITINERARY_STORAGE_KEY);
    if (storedItems) {
      return JSON.parse(storedItems);
    }
    return null;
  } catch (error) {
    logger.error('Error retrieving itinerary from local storage:', error);
    return null;
  }
};

/**
 * Clear itinerary items from local storage
 */
export const clearItineraryFromLocalStorage = (): void => {
  try {
    localStorage.removeItem(ITINERARY_STORAGE_KEY);
  } catch (error) {
    logger.error('Error clearing itinerary from local storage:', error);
  }
};

/**
 * Save destinations to local storage
 */
export const saveDestinationsToLocalStorage = (destinations: Destination[]): void => {
  try {
    localStorage.setItem(DESTINATIONS_STORAGE_KEY, JSON.stringify(destinations));
  } catch (error) {
    logger.error('Error saving destinations to local storage:', error);
  }
};

/**
 * Get destinations from local storage
 */
export const getDestinationsFromLocalStorage = (): Destination[] | null => {
  try {
    const storedDestinations = localStorage.getItem(DESTINATIONS_STORAGE_KEY);
    if (storedDestinations) {
      return JSON.parse(storedDestinations);
    }
    return null;
  } catch (error) {
    logger.error('Error retrieving destinations from local storage:', error);
    return null;
  }
};

/**
 * Clear destinations from local storage
 */
export const clearDestinationsFromLocalStorage = (): void => {
  try {
    localStorage.removeItem(DESTINATIONS_STORAGE_KEY);
  } catch (error) {
    logger.error('Error clearing destinations from local storage:', error);
  }
};

/**
 * Save current data as the default sample data
 */
export const saveAsDefaultSampleData = (destinations: Destination[], itinerary: ItineraryItem[]): void => {
  try {
    localStorage.setItem(CUSTOM_SAMPLE_DESTINATIONS_KEY, JSON.stringify(destinations));
    localStorage.setItem(CUSTOM_SAMPLE_ITINERARY_KEY, JSON.stringify(itinerary));
    localStorage.setItem(CUSTOM_SAMPLE_EXISTS_KEY, 'true');
    updateLastSyncTime();
    
    alert('Your data has been saved as the default sample data. To see these changes on other devices, please refresh those browser windows.');
  } catch (error) {
    logger.error('Error saving as default sample data:', error);
    alert('There was an error saving your data as default. Please try again.');
  }
};

/**
 * Check if custom sample data exists
 */
export const hasCustomSampleData = (): boolean => {
  const exists = localStorage.getItem(CUSTOM_SAMPLE_EXISTS_KEY) === 'true';
  if (!exists) return false;
  
  // Check if we have both required data sets
  const hasDestinations = localStorage.getItem(CUSTOM_SAMPLE_DESTINATIONS_KEY) !== null;
  const hasItinerary = localStorage.getItem(CUSTOM_SAMPLE_ITINERARY_KEY) !== null;
  
  return hasDestinations && hasItinerary;
};

/**
 * Get custom sample destinations
 */
export const getCustomSampleDestinations = (): Destination[] | null => {
  try {
    const customDestinations = localStorage.getItem(CUSTOM_SAMPLE_DESTINATIONS_KEY);
    if (customDestinations) {
      return JSON.parse(customDestinations);
    }
    return null;
  } catch (error) {
    logger.error('Error retrieving custom sample destinations:', error);
    return null;
  }
};

/**
 * Get custom sample itinerary
 */
export const getCustomSampleItinerary = (): ItineraryItem[] | null => {
  try {
    const customItinerary = localStorage.getItem(CUSTOM_SAMPLE_ITINERARY_KEY);
    if (customItinerary) {
      return JSON.parse(customItinerary);
    }
    return null;
  } catch (error) {
    logger.error('Error retrieving custom sample itinerary:', error);
    return null;
  }
};

/**
 * Clear custom sample data
 */
export const clearCustomSampleData = (): void => {
  try {
    localStorage.removeItem(CUSTOM_SAMPLE_DESTINATIONS_KEY);
    localStorage.removeItem(CUSTOM_SAMPLE_ITINERARY_KEY);
    localStorage.removeItem(CUSTOM_SAMPLE_EXISTS_KEY);
  } catch (error) {
    logger.error('Error clearing custom sample data:', error);
  }
};

/**
 * Todo Items Storage Functions
 */
export const saveTodosToLocalStorage = (todos: TodoItem[]): void => {
  try {
    localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(todos));
  } catch (error) {
    logger.error('Error saving todos to local storage:', error);
  }
};

export const getTodosFromLocalStorage = (): TodoItem[] | null => {
  try {
    const storedTodos = localStorage.getItem(TODOS_STORAGE_KEY);
    if (storedTodos) {
      return JSON.parse(storedTodos);
    }
    return null;
  } catch (error) {
    logger.error('Error retrieving todos from local storage:', error);
    return null;
  }
};

/**
 * Appointments Storage Functions
 */
export const saveAppointmentsToLocalStorage = (appointments: Appointment[]): void => {
  try {
    localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(appointments));
  } catch (error) {
    logger.error('Error saving appointments to local storage:', error);
  }
};

export const getAppointmentsFromLocalStorage = (): Appointment[] | null => {
  try {
    const storedAppointments = localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
    if (storedAppointments) {
      return JSON.parse(storedAppointments);
    }
    return null;
  } catch (error) {
    logger.error('Error retrieving appointments from local storage:', error);
    return null;
  }
};

/**
 * Suppliers Storage Functions
 */
export const saveSuppliersToLocalStorage = (suppliers: Supplier[]): void => {
  try {
    localStorage.setItem(SUPPLIERS_STORAGE_KEY, JSON.stringify(suppliers));
  } catch (error) {
    logger.error('Error saving suppliers to local storage:', error);
  }
};

export const getSuppliersFromLocalStorage = (): Supplier[] | null => {
  try {
    const storedSuppliers = localStorage.getItem(SUPPLIERS_STORAGE_KEY);
    if (storedSuppliers) {
      return JSON.parse(storedSuppliers);
    }
    return null;
  } catch (error) {
    logger.error('Error retrieving suppliers from local storage:', error);
    return null;
  }
};

/**
 * Business Contacts Storage Functions
 */
export const saveContactsToLocalStorage = (contacts: BusinessContact[]): void => {
  try {
    localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(contacts));
  } catch (error) {
    logger.error('Error saving contacts to local storage:', error);
  }
};

export const getContactsFromLocalStorage = (): BusinessContact[] | null => {
  try {
    const storedContacts = localStorage.getItem(CONTACTS_STORAGE_KEY);
    if (storedContacts) {
      return JSON.parse(storedContacts);
    }
    return null;
  } catch (error) {
    logger.error('Error retrieving contacts from local storage:', error);
    return null;
  }
};

/**
 * Expenses Storage Functions
 */
export const saveExpensesToLocalStorage = (expenses: Expense[]): void => {
  try {
    localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(expenses));
  } catch (error) {
    logger.error('Error saving expenses to local storage:', error);
  }
};

export const getExpensesFromLocalStorage = (): Expense[] | null => {
  try {
    const storedExpenses = localStorage.getItem(EXPENSES_STORAGE_KEY);
    if (storedExpenses) {
      return JSON.parse(storedExpenses);
    }
    return null;
  } catch (error) {
    logger.error('Error retrieving expenses from local storage:', error);
    return null;
  }
};