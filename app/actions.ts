'use server';

import { createClient } from '@supabase/supabase-js';

export async function saveApiKey(name: string, apiKey: string, email: string) {
  try {
    // Create a Supabase client with the anon key
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Insert data into the organization table - only save name and API key
    const { data, error } = await supabase
      .from('organization')
      .insert([
        { 
          name: name,
          recruit_api_key: apiKey,
          credits_left: 1000
        }
      ])
      .select();

    if (error) {
      console.error("Error saving API key:", error);
      
      // If we get an RLS error, provide a more helpful message
      if (error.code === '42501') {
        return { 
          success: false, 
          error: "Permission denied. Please run the SQL script in fix_rls_policy.sql to update the RLS policies." 
        };
      }
      
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
} 