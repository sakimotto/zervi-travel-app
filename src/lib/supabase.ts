import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

logger.debug('Supabase URL:', supabaseUrl);
logger.debug('Supabase Anon Key:', supabaseAnonKey ? 'Present' : 'Missing');

// Create client even if env vars are missing (for development)
const defaultUrl = 'https://placeholder.supabase.co';
const defaultKey = 'placeholder-key';

export const supabase = createClient(
  supabaseUrl || defaultUrl, 
  supabaseAnonKey || defaultKey
);

// Database types
export type Database = {
  public: {
    Tables: {
      destinations: {
        Row: {
          id: string;
          name: string;
          description: string;
          image: string;
          region: string;
          activities: string[];
          best_time_to_visit: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          image: string;
          region: string;
          activities?: string[];
          best_time_to_visit?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          image?: string;
          region?: string;
          activities?: string[];
          best_time_to_visit?: string;
          updated_at?: string;
        };
      };
      suppliers: {
        Row: {
          id: string;
          company_name: string;
          contact_person: string;
          email: string;
          phone: string;
          address: string;
          city: string;
          province: string;
          industry: string;
          products: string[];
          certifications: string[];
          minimum_order: string;
          payment_terms: string;
          lead_time: string;
          notes: string;
          website: string;
          established: string;
          employees: string;
          rating: number;
          last_contact: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_name: string;
          contact_person: string;
          email: string;
          phone: string;
          address?: string;
          city: string;
          province: string;
          industry: string;
          products?: string[];
          certifications?: string[];
          minimum_order?: string;
          payment_terms?: string;
          lead_time?: string;
          notes?: string;
          website?: string;
          established?: string;
          employees?: string;
          rating?: number;
          last_contact?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_name?: string;
          contact_person?: string;
          email?: string;
          phone?: string;
          address?: string;
          city?: string;
          province?: string;
          industry?: string;
          products?: string[];
          certifications?: string[];
          minimum_order?: string;
          payment_terms?: string;
          lead_time?: string;
          notes?: string;
          website?: string;
          established?: string;
          employees?: string;
          rating?: number;
          last_contact?: string;
          status?: string;
          updated_at?: string;
        };
      };
      business_contacts: {
        Row: {
          id: string;
          name: string;
          nickname: string;
          title: string;
          company: string;
          email: string;
          phone: string;
          wechat: string;
          linkedin: string;
          address: string;
          city: string;
          industry: string;
          notes: string;
          last_contact: string | null;
          relationship: string;
          importance: string;
          linked_supplier_id: string | null;
          website: string;
          alibaba_store: string;
          shopee_store: string;
          amazon_store: string;
          other_ecommerce: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          nickname?: string;
          title: string;
          company: string;
          email: string;
          phone: string;
          wechat?: string;
          linkedin?: string;
          address?: string;
          city: string;
          industry?: string;
          notes?: string;
          last_contact?: string;
          relationship?: string;
          importance?: string;
          linked_supplier_id?: string;
          website?: string;
          alibaba_store?: string;
          shopee_store?: string;
          amazon_store?: string;
          other_ecommerce?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          nickname?: string;
          title?: string;
          company?: string;
          email?: string;
          phone?: string;
          wechat?: string;
          linkedin?: string;
          address?: string;
          city?: string;
          industry?: string;
          notes?: string;
          last_contact?: string;
          relationship?: string;
          importance?: string;
          linked_supplier_id?: string;
          website?: string;
          alibaba_store?: string;
          shopee_store?: string;
          amazon_store?: string;
          other_ecommerce?: string;
          updated_at?: string;
        };
      };
      itinerary_items: {
        Row: {
          id: string;
          type: string;
          title: string;
          description: string;
          start_date: string;
          end_date: string | null;
          start_time: string | null;
          end_time: string | null;
          location: string;
          assigned_to: string;
          confirmed: boolean;
          notes: string;
          type_specific_data: Record<string, unknown> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          type: string;
          title: string;
          description: string;
          start_date: string;
          end_date?: string;
          start_time?: string;
          end_time?: string;
          location: string;
          assigned_to: string;
          confirmed?: boolean;
          notes?: string;
          type_specific_data?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          type?: string;
          title?: string;
          description?: string;
          start_date?: string;
          end_date?: string;
          start_time?: string;
          end_time?: string;
          location?: string;
          assigned_to?: string;
          confirmed?: boolean;
          notes?: string;
          type_specific_data?: any;
          updated_at?: string;
        };
      };
      expenses: {
        Row: {
          id: string;
          date: string;
          category: string;
          description: string;
          amount: number;
          currency: string;
          payment_method: string;
          receipt: string;
          business_purpose: string;
          assigned_to: string;
          reimbursable: boolean;
          approved: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          category: string;
          description: string;
          amount: number;
          currency: string;
          payment_method: string;
          receipt?: string;
          business_purpose: string;
          assigned_to: string;
          reimbursable?: boolean;
          approved?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          category?: string;
          description?: string;
          amount?: number;
          currency?: string;
          payment_method?: string;
          receipt?: string;
          business_purpose?: string;
          assigned_to?: string;
          reimbursable?: boolean;
          approved?: boolean;
          updated_at?: string;
        };
      };
      todos: {
        Row: {
          id: string;
          title: string;
          description: string;
          completed: boolean;
          priority: string;
          due_date: string | null;
          category: string;
          assigned_to: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string;
          completed?: boolean;
          priority?: string;
          due_date?: string;
          category?: string;
          assigned_to: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          completed?: boolean;
          priority?: string;
          due_date?: string;
          category?: string;
          assigned_to?: string;
          updated_at?: string;
        };
      };
      appointments: {
        Row: {
          id: string;
          title: string;
          description: string;
          start_date: string;
          end_date: string | null;
          start_time: string;
          end_time: string | null;
          location: string;
          attendees: string[];
          type: string;
          status: string;
          reminder: number;
          notes: string;
          supplier_id: string | null;
          contact_id: string | null;
          assigned_to: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string;
          start_date: string;
          end_date?: string;
          start_time: string;
          end_time?: string;
          location?: string;
          attendees?: string[];
          type?: string;
          status?: string;
          reminder?: number;
          notes?: string;
          supplier_id?: string;
          contact_id?: string;
          assigned_to?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          start_date?: string;
          end_date?: string;
          start_time?: string;
          end_time?: string;
          location?: string;
          attendees?: string[];
          type?: string;
          status?: string;
          reminder?: number;
          notes?: string;
          supplier_id?: string;
          contact_id?: string;
          assigned_to?: string;
          updated_at?: string;
        };
      };
    };
  };
};