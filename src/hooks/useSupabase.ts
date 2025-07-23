import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

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
      console.error(`Error fetching ${tableName}:`, err);
    } finally {
      setLoading(false);
    }
  };

  // Insert new record
  const insert = async (record: Tables[T]['Insert']) => {
    try {
      // Clean up the record to match database schema
      const cleanRecord = { ...record };
      
      // Remove any undefined or null values that might cause issues
      Object.keys(cleanRecord).forEach(key => {
        if (cleanRecord[key] === undefined || cleanRecord[key] === null || cleanRecord[key] === '') {
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
      console.error(`Error inserting into ${tableName}:`, err);
      throw err;
    }
  };

  // Update record
  const update = async (id: string, updates: Tables[T]['Update']) => {
    try {
      // Clean up the updates to match database schema
      const cleanUpdates = { ...updates };
      
      // Remove any undefined values that might cause issues
      Object.keys(cleanUpdates).forEach(key => {
        if (cleanUpdates[key] === undefined) {
          delete cleanUpdates[key];
        }
      });

      const { data: result, error } = await supabase
        .from(tableName)
        .update(cleanUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setData(prev => prev.map(item => item.id === id ? result : item));
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error(`Error updating ${tableName}:`, err);
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
      console.error(`Error deleting from ${tableName}:`, err);
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