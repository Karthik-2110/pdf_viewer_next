'use server';

import { createClient } from '@supabase/supabase-js';
import { cache } from 'react';
import { AnalysisJob, AnalysisJobStatus, AnalysisResult } from '@/app/types/analysis';

// Create a cached version of the client to avoid creating multiple instances
const getSupabaseClient = cache(() => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
});

/**
 * Creates a new analysis job in the database
 */
export async function createAnalysisJob(
  candidateSlug: string,
  jobSlug: string,
  requestData: Record<string, any>
): Promise<string> {
  try {
    const supabase = getSupabaseClient();
    
    const jobData = {
      status: 'pending' as AnalysisJobStatus,
      candidate_slug: candidateSlug,
      job_slug: jobSlug,
      request_data: requestData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('analysis_jobs')
      .insert(jobData)
      .select('id')
      .single();
      
    if (error) {
      console.error("Error creating analysis job:", error);
      throw new Error(`Failed to create analysis job: ${error.message}`);
    }
    
    return data.id;
  } catch (error) {
    console.error("Unexpected error creating analysis job:", error);
    throw error;
  }
}

/**
 * Gets an analysis job by its ID
 */
export async function getAnalysisJob(jobId: string): Promise<AnalysisJob | null> {
  try {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('analysis_jobs')
      .select('*')
      .eq('id', jobId)
      .single();
      
    if (error) {
      console.error("Error fetching analysis job:", error);
      return null;
    }
    
    return data as AnalysisJob;
  } catch (error) {
    console.error("Unexpected error fetching analysis job:", error);
    return null;
  }
}

/**
 * Updates the status of an analysis job
 */
export async function updateAnalysisJobStatus(
  jobId: string,
  status: AnalysisJobStatus,
  result?: AnalysisResult | null,
  error?: string | null
): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };
    
    if (result !== undefined) {
      updateData.result = result;
    }
    
    if (error !== undefined) {
      updateData.error = error;
    }
    
    const { error: updateError } = await supabase
      .from('analysis_jobs')
      .update(updateData)
      .eq('id', jobId);
      
    if (updateError) {
      console.error("Error updating analysis job:", updateError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Unexpected error updating analysis job:", error);
    return false;
  }
}

/**
 * Gets pending analysis jobs
 */
export async function getPendingAnalysisJobs(limit: number = 5): Promise<AnalysisJob[]> {
  try {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('analysis_jobs')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(limit);
      
    if (error) {
      console.error("Error fetching pending analysis jobs:", error);
      return [];
    }
    
    return data as AnalysisJob[];
  } catch (error) {
    console.error("Unexpected error fetching pending analysis jobs:", error);
    return [];
  }
} 