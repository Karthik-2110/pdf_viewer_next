'use server';

import { createClient } from '@supabase/supabase-js';
import { cache } from 'react';

// Create a cached version of the client to avoid creating multiple instances
const getSupabaseClient = cache(() => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
});

/**
 * Fetches a Recruit CRM API key from the Supabase database.
 * If an email is provided, it fetches the key for that specific organization.
 * If no email is provided, it returns the first API key found.
 * Falls back to the environment variable if no key is found in the database.
 */
export async function getRecruitApiKey(email?: string): Promise<string> {
  try {
    const supabase = getSupabaseClient();
    
    let query = supabase
      .from('Organisation')
      .select('recruit_api_key');
    
    // If email is provided, filter by email
    if (email) {
      query = query.eq('email', email);
    }
    
    const { data, error } = await query.maybeSingle();
    
    if (error) {
      console.error("Error fetching API key from Supabase:", error);
      // Fall back to environment variable
      return process.env.RECRUIT_CRM_API_KEY || '';
    }
    
    if (data && data.recruit_api_key) {
      return data.recruit_api_key;
    }
    
    // Fall back to environment variable if no key found in database
    return process.env.RECRUIT_CRM_API_KEY || '';
  } catch (error) {
    console.error("Unexpected error when fetching API key:", error);
    // Fall back to environment variable
    return process.env.RECRUIT_CRM_API_KEY || '';
  }
}

/**
 * Gets all organization records from the database
 */
export async function getAllOrganizations() {
  try {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('Organisation')
      .select('*');
    
    if (error) {
      console.error("Error fetching organizations:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Unexpected error when fetching organizations:", error);
    return [];
  }
} 