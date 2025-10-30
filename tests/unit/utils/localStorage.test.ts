import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveItineraryToLocalStorage,
  getItineraryFromLocalStorage,
  clearItineraryFromLocalStorage,
  saveDestinationsToLocalStorage,
  getDestinationsFromLocalStorage,
  hasCustomSampleData,
} from '../../../src/utils/localStorage';
import type { ItineraryItem, Destination } from '../../../src/types';

describe('localStorage utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('itinerary storage', () => {
    it('should save and retrieve itinerary items', () => {
      const items: ItineraryItem[] = [
        {
          id: '1',
          title: 'Test Item',
          date: '2025-11-01',
          time: '09:00',
          category: 'flight',
          description: 'Test description',
          location: 'Test location',
        },
      ];

      saveItineraryToLocalStorage(items);
      const retrieved = getItineraryFromLocalStorage();

      expect(retrieved).toEqual(items);
    });

    it('should return null when no itinerary exists', () => {
      const retrieved = getItineraryFromLocalStorage();
      expect(retrieved).toBeNull();
    });

    it('should clear itinerary from storage', () => {
      const items: ItineraryItem[] = [
        {
          id: '1',
          title: 'Test',
          date: '2025-11-01',
          time: '09:00',
          category: 'flight',
        },
      ];

      saveItineraryToLocalStorage(items);
      clearItineraryFromLocalStorage();
      const retrieved = getItineraryFromLocalStorage();

      expect(retrieved).toBeNull();
    });
  });

  describe('destinations storage', () => {
    it('should save and retrieve destinations', () => {
      const destinations: Destination[] = [
        {
          id: '1',
          name: 'Beijing',
          country: 'China',
          description: 'Capital city',
          attractions: ['Great Wall'],
          bestTimeToVisit: 'Spring',
          imageUrl: 'https://example.com/beijing.jpg',
        },
      ];

      saveDestinationsToLocalStorage(destinations);
      const retrieved = getDestinationsFromLocalStorage();

      expect(retrieved).toEqual(destinations);
    });

    it('should return null when no destinations exist', () => {
      const retrieved = getDestinationsFromLocalStorage();
      expect(retrieved).toBeNull();
    });
  });

  describe('custom sample data', () => {
    it('should return false when no custom data exists', () => {
      expect(hasCustomSampleData()).toBe(false);
    });
  });
});
