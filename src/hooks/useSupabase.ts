import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';
import { logger } from '../utils/logger';

type Tables = Database['public']['Tables'];

// Generic hook for Supabase operations
export function useSupabaseTable<T extends keyof Tables>(tableName: T) {
  const [data, setData] = useState<Tables[T]['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all records
  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: result, error } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setData(result || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      logger.error(`Error fetching ${tableName}:`, err);
    } finally {
      setLoading(false);
    }
  };

  // Insert new record
  const insert = async (record: Tables[T]['Insert']) => {
    try {
      // Clean up the record to match database schema
      const cleanRecord = { ...record };

      // Get current user and add user_id if not present
      const { data: { user } } = await supabase.auth.getUser();
      if (user && !cleanRecord.user_id) {
        cleanRecord.user_id = user.id;
      }

      // Remove any undefined values that might cause issues, but keep null and empty strings
      Object.keys(cleanRecord).forEach(key => {
        if (cleanRecord[key] === undefined) {
          delete cleanRecord[key];
        }
      });

      const { data: result, error } = await supabase
        .from(tableName)
        .insert(cleanRecord)
        .select()
        .single();

      if (error) throw error;
      setData(prev => [result, ...prev]);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      logger.error(`Error inserting into ${tableName}:`, err);
      throw err;
    }
  };

  // Update record
  const update = async (id: string, updates: Tables[T]['Update']) => {
    try {
      logger.debug(`Updating ${tableName} with ID ${id}:`, updates);

      // Clean up the updates - convert undefined to null, remove empty strings
      const cleanUpdates: Record<string, unknown> = {};
      Object.keys(updates).forEach(key => {
        const value = updates[key];
        if (value === undefined || value === '') {
          cleanUpdates[key] = null;
        } else {
          cleanUpdates[key] = value;
        }
      });

      console.log(`useSupabase: Cleaned updates for ${tableName}:`, cleanUpdates);
      logger.debug(`Cleaned updates for ${tableName}:`, cleanUpdates);

      const { data: result, error } = await supabase
        .from(tableName)
        .update(cleanUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error(`Supabase update error for ${tableName}:`, error);
        throw error;
      }

      logger.debug(`Successfully updated ${tableName}:`, result);
      setData(prev => prev.map(item => item.id === id ? result : item));
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      logger.error(`Error updating ${tableName}:`, err);
      setError(errorMessage);
      throw err;
    }
  };

  // Delete record
  const remove = async (id: string) => {
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;
      setData(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      logger.error(`Error deleting from ${tableName}:`, err);
      throw err;
    }
  };

  useEffect(() => {
    fetchData();
  }, [tableName]);

  return {
    data,
    loading,
    error,
    insert,
    update,
    remove,
    refetch: fetchData
  };
}

// Specific hooks for each table
export const useDestinations = () => useSupabaseTable('destinations');
export const useSuppliers = () => useSupabaseTable('suppliers');
export const useBusinessContacts = () => useSupabaseTable('business_contacts');
export const useItineraryItems = () => useSupabaseTable('itinerary_items');
export const useExpenses = () => useSupabaseTable('expenses');
export const useTodos = () => useSupabaseTable('todos');
export const useAppointments = () => useSupabaseTable('appointments');

// New CRM and Travel module hooks
export const useCustomers = () => useSupabaseTable('customers');
export const useCustomerCategories = () => useSupabaseTable('customer_categories');
export const useTradeShows = () => useSupabaseTable('trade_shows');
export const useTradeShowMeetings = () => useSupabaseTable('trade_show_meetings');
export const useFlights = () => useSupabaseTable('flights');
export const useCars = () => useSupabaseTable('cars');
export const useHotels = () => useSupabaseTable('hotels');
export const useMeetings = () => useSupabaseTable('meetings');

// Unified Trips hook (parent for all travel)
export const useTrips = () => useSupabaseTable('trips');

// Unified Entities hook (replaces customers/suppliers/contacts)
export const useEntities = () => useSupabaseTable('entities');

// Item Types for dynamic itinerary types
export const useItemTypes = () => useSupabaseTable('item_types');