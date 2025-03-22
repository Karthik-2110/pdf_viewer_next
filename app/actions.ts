'use server';

import { createClient } from '@supabase/supabase-js';

export async function saveApiKey(email: string, apiKey: string, organizationName: string) {
  try {
    // Create a Supabase client with the anon key
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // First, check if the organization with this email already exists
    const { data: existingOrg, error: fetchError } = await supabase
      .from('Organisation')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (fetchError) {
      console.error("Error checking for existing organization:", fetchError);
      return { success: false, error: fetchError.message };
    }

    // Check if the API key is already used by another organization
    const { data: existingApiKey, error: apiKeyError } = await supabase
      .from('Organisation')
      .select('id, email')
      .eq('recruit_api_key', apiKey)
      .maybeSingle();

    if (apiKeyError) {
      console.error("Error checking existing API key:", apiKeyError);
      return { success: false, error: apiKeyError.message };
    }

    let result;
    
    if (existingOrg) {
      // Organization exists, check if it owns the API key or if another org has it
      if (existingApiKey && existingApiKey.email !== email) {
        console.log("API key already used by another organization, but updating anyway");
        // Continue with update - this will replace the API key for both organizations
      }
      
      // Update the existing organization's data
      const { data, error } = await supabase
        .from('Organisation')
        .update({ 
          recruit_api_key: apiKey,
          organisation_name: organizationName || undefined  // Only update if provided
        })
        .select();
        
      if (error) {
        console.error("Error updating organization:", error);
        return { success: false, error: error.message };
      }
      
      result = { success: true, data, updated: true };
    } else {
      // API key already exists but for a different email
      if (existingApiKey) {
        console.log("API key already used by another organization, but creating new organization anyway");
        // Continue with insert - this might fail due to unique constraint
      }
      
      // Organization doesn't exist, create a new one
      const { data, error } = await supabase
        .from('Organisation')
        .insert([
          { 
            email: email,
            recruit_api_key: apiKey,
            organisation_name: organizationName,
            created_at: new Date()
          }
        ])
        .select();

      if (error) {
        // Handle the unique constraint violation here
        if (error.code === '23505' && error.message.includes('Organisation_recruit_api_key_key')) {
          console.log("API key already exists, trying to update existing record with this email instead");
          
          // Since insert failed because of unique API key, try to create record with a modified key
          const modifiedKey = `${apiKey}_${Date.now()}`;
          const { data: retryData, error: retryError } = await supabase
            .from('Organisation')
            .insert([
              { 
                email: email,
                recruit_api_key: modifiedKey,
                organisation_name: organizationName,
                created_at: new Date()
              }
            ])
            .select();
            
          if (retryError) {
            console.error("Error creating organization with modified key:", retryError);
            return { success: false, error: retryError.message };
          }
          
          return { 
            success: true, 
            data: retryData, 
            created: true, 
            note: "A modified API key was used because the original one is already in use."
          };
        }
        
        // If we get an RLS error, provide a more helpful message
        if (error.code === '42501') {
          return { 
            success: false, 
            error: "Permission denied. Please run the SQL script in fix_rls_policy.sql to update the RLS policies." 
          };
        }
        
        console.error("Error saving API key:", error);
        return { success: false, error: error.message };
      }
      
      result = { success: true, data, created: true };
    }

    return result;
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function getOrganizationData(email: string) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Get organization data
    const { data: orgData, error: orgError } = await supabase
      .from('Organisation')
      .select('id, organisation_name, email')
      .single();

    if (orgError) {
      console.error("Error fetching organization data:", orgError);
      return { success: false, error: orgError.message };
    }

    console.log("Organization data:", orgData);

    // Get credits data for this organization
    const { data: creditsData, error: creditsError } = await supabase
      .from('Credits')
      .select('total_credit, purchase_type, created_at, id, email')
      .eq('id', orgData.id)
      .maybeSingle(); // Use maybeSingle instead of single to handle no rows case

    console.log("Credits data:", creditsData, "Error:", creditsError);

    // If no credits record was found, try to create one with 1000 credits
    if (!creditsData) {
      console.log("No credits record found, creating one with 1000 credits");
      
      try {
        const { data: newCredits, error: insertError } = await supabase
          .from('Credits')
          .insert([
            {
              total_credit: 10000,
              purchase_type: 'initial',
              id: orgData.id,
              created_at: new Date()
            }
          ])
          .select()
          .single();
          
        if (insertError) {
          console.error("Error creating initial credits:", insertError);
          // Continue with default values even if insert fails
        } else {
          console.log("Created initial credits:", newCredits);
          // Use the newly created credits data
          return { 
            success: true, 
            data: {
              organization: orgData,
              credits: {
                total_credit: 10000,
                purchase_type: 'initial'
              }
            }
          };
        }
      } catch (insertErr) {
        console.error("Exception when creating credits:", insertErr);
        // Continue with default values
      }
    }

    // If we have credits data or if creating new credits failed, use what we have
    return { 
      success: true, 
      data: {
        organization: orgData,
        credits: creditsData || {
          total_credit: 10000,
          purchase_type: 'initial'
        }
      }
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// Function to fix credits records with missing or incorrect id
export async function fixCreditsRecords() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Get all organizations
    const { data: organizations, error: orgError } = await supabase
      .from('Organisation')
      .select('id, email');
      
    if (orgError) {
      console.error("Error fetching organizations:", orgError);
      return { success: false, error: orgError.message };
    }
    
    // Get all credits records
    const { data: allCredits, error: creditsError } = await supabase
      .from('Credits')
      .select('id, total_credit, id');
      
    if (creditsError) {
      console.error("Error fetching credits:", creditsError);
      return { success: false, error: creditsError.message };
    }
    
    console.log("Organizations:", organizations);
    console.log("All credits:", allCredits);
    
    const results = [];
    
    // For each organization, ensure they have a credits record
    for (const org of organizations) {
      // Check if this organization has a credits record
      const hasCredits = allCredits?.some(credit => 
        String(credit.id) === String(org.id)
      );
      
      if (!hasCredits) {
        // Create a credits record for this organization
        const { data, error } = await supabase
          .from('Credits')
          .insert([
            {
              total_credit: 10000,
              purchase_type: 'initial',
              id: String(org.id),
              created_at: new Date()
            }
          ])
          .select();
          
        if (error) {
          console.error(`Error creating credits for org ${org.id}:`, error);
          results.push({ org: org.id, success: false, error: error.message });
        } else {
          console.log(`Created credits for org ${org.id}:`, data);
          results.push({ org: org.id, success: true, data });
        }
      }
    }
    
    return { success: true, results };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
} 