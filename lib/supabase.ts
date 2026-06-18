import 'react-native-url-polyfill/auto';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { getSupabaseConfig } from '@/lib/env';

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

const WebStorageAdapter = {
  getItem: (key: string) => {
    if (typeof window === 'undefined') {
      return Promise.resolve(null);
    }
    return Promise.resolve(window.localStorage.getItem(key));
  },
  setItem: (key: string, value: string) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, value);
    }
    return Promise.resolve();
  },
  removeItem: (key: string) => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key);
    }
    return Promise.resolve();
  },
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          display_name?: string | null;
          updated_at?: string;
        };
      };
      households: {
        Row: {
          id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          updated_at?: string;
        };
      };
      household_members: {
        Row: {
          id: string;
          household_id: string;
          user_id: string;
          role: 'owner' | 'member';
          created_at: string;
        };
        Insert: {
          id?: string;
          household_id: string;
          user_id: string;
          role?: 'owner' | 'member';
          created_at?: string;
        };
        Update: {
          role?: 'owner' | 'member';
        };
      };
      shopping_list_items: {
        Row: {
          id: string;
          household_id: string;
          name: string;
          checked: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          household_id: string;
          name: string;
          checked?: boolean;
          created_at?: string;
        };
        Update: {
          name?: string;
          checked?: boolean;
        };
      };
      shopping_list_completions: {
        Row: {
          id: string;
          household_id: string;
          name: string;
          completed_at: string;
          completed_by: string | null;
        };
        Insert: {
          id?: string;
          household_id: string;
          name: string;
          completed_at?: string;
          completed_by?: string | null;
        };
        Update: {
          name?: string;
          completed_at?: string;
          completed_by?: string | null;
        };
      };
      pantry_items: {
        Row: {
          id: string;
          household_id: string;
          name: string;
          quantity: number;
          unit: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          household_id: string;
          name: string;
          quantity?: number;
          unit?: string;
          created_at?: string;
        };
        Update: {
          name?: string;
          quantity?: number;
          unit?: string;
        };
      };
      cleaning_tasks: {
        Row: {
          id: string;
          household_id: string;
          title: string;
          done: boolean;
          sort_order: number;
          assigned_to: string | null;
          completed_by: string | null;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          household_id: string;
          title: string;
          done?: boolean;
          sort_order?: number;
          assigned_to?: string | null;
          completed_by?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          title?: string;
          done?: boolean;
          sort_order?: number;
          assigned_to?: string | null;
          completed_by?: string | null;
          completed_at?: string | null;
        };
      };
      receipts: {
        Row: {
          id: string;
          household_id: string;
          uploaded_by: string;
          shopped_by: string | null;
          storage_path: string;
          store_name: string | null;
          purchase_date: string | null;
          total_amount: number | null;
          currency: string;
          status: 'pending' | 'parsed' | 'confirmed' | 'failed';
          error_message: string | null;
          created_at: string;
          confirmed_at: string | null;
        };
        Insert: {
          id?: string;
          household_id: string;
          uploaded_by: string;
          shopped_by?: string | null;
          storage_path: string;
          store_name?: string | null;
          purchase_date?: string | null;
          total_amount?: number | null;
          currency?: string;
          status?: 'pending' | 'parsed' | 'confirmed' | 'failed';
          error_message?: string | null;
          created_at?: string;
          confirmed_at?: string | null;
        };
        Update: {
          shopped_by?: string | null;
          store_name?: string | null;
          purchase_date?: string | null;
          total_amount?: number | null;
          status?: 'pending' | 'parsed' | 'confirmed' | 'failed';
          error_message?: string | null;
          confirmed_at?: string | null;
        };
      };
      org_events: {
        Row: {
          id: string;
          household_id: string;
          title: string;
          event_date: string;
          starts_at: string;
          ends_at: string | null;
          all_day: boolean;
          description: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          external_provider: string | null;
          external_calendar_id: string | null;
          external_event_id: string | null;
          sync_source: string | null;
          synced_at: string | null;
        };
        Insert: {
          id?: string;
          household_id: string;
          title: string;
          event_date: string;
          starts_at: string;
          ends_at?: string | null;
          all_day?: boolean;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          external_provider?: string | null;
          external_calendar_id?: string | null;
          external_event_id?: string | null;
          sync_source?: string | null;
          synced_at?: string | null;
        };
        Update: {
          title?: string;
          event_date?: string;
          starts_at?: string;
          ends_at?: string | null;
          all_day?: boolean;
          description?: string | null;
          updated_at?: string;
          deleted_at?: string | null;
          external_provider?: string | null;
          external_calendar_id?: string | null;
          external_event_id?: string | null;
          sync_source?: string | null;
          synced_at?: string | null;
        };
      };
      calendar_connections_public: {
        Row: {
          id: string;
          user_id: string;
          household_id: string;
          provider: string;
          calendar_id: string;
          watch_expires_at: string | null;
          last_synced_at: string | null;
          sync_error: string | null;
          created_at: string;
          updated_at: string;
          watch_active: boolean;
        };
      };
      push_tokens: {
        Row: {
          id: string;
          user_id: string;
          expo_push_token: string;
          platform: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          expo_push_token: string;
          platform?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          expo_push_token?: string;
          platform?: string | null;
          updated_at?: string;
        };
      };
    };
  };
};

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!client) {
    const { url, anonKey } = getSupabaseConfig();
    client = createClient(url, anonKey, {
      auth: {
        storage: Platform.OS === 'web' ? WebStorageAdapter : ExpoSecureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: Platform.OS === 'web',
      },
    });
  }

  return client;
}

/** @deprecated Prefer getSupabase() for lazy initialization */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const instance = getSupabase();
    const value = instance[prop as keyof SupabaseClient];
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});
