'use client';

import { useState, useEffect } from 'react';
// Create an inline spinner component instead of importing it
import { formatDistanceToNow } from 'date-fns';

// Simple inline spinner component
const Spinner = ({ className = '' }: { className?: string }) => (
  <div 
    className={`animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full inline-block ${className}`}
  />
);

// Define the AnalysisJob interface here instead of importing it
interface AnalysisJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  candidate_slug: string;
  job_slug: string;
  request_data: Record<string, any>;
  result?: any;
  error?: string | null;
  created_at: string;
  updated_at: string;
}

// Function to fetch pending jobs
async function fetchPendingJobs(): Promise<AnalysisJob[]> {
  try {
    const response = await fetch('/api/analyze/jobs/pending');
    
    if (!response.ok) {
      throw new Error('Failed to fetch pending jobs');
    }
    
    const data = await response.json();
    return data.jobs;
  } catch (error) {
    console.error('Error fetching pending jobs:', error);
    return [];
  }
}

// Function to process a specific job
async function processJob(jobId: string): Promise<any> {
  try {
    const response = await fetch('/api/analyze/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || 'manual_processing_secret_key'}`
      },
      body: JSON.stringify({ jobId })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to process job');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error processing job:', error);
    throw error;
  }
}

// Function to process next job
async function processNextJob(): Promise<any> {
  try {
    const response = await fetch('/api/analyze/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || 'manual_processing_secret_key'}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to process next job');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error processing next job:', error);
    throw error;
  }
}

export default function ManualProcess() {
  const [pendingJobs, setPendingJobs] = useState<AnalysisJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<{ jobId: string; status: string; message: string } | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Load pending jobs on mount and when needed
  const loadPendingJobs = async () => {
    setIsRefreshing(true);
    try {
      const jobs = await fetchPendingJobs();
      setPendingJobs(jobs);
    } catch (error) {
      console.error('Error loading pending jobs:', error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  useEffect(() => {
    loadPendingJobs();
  }, []);
  
  // Process a job
  const handleProcessJob = async (jobId: string) => {
    setLoading(true);
    setProcessingStatus({ jobId, status: 'processing', message: 'Processing job...' });
    
    try {
      const result = await processJob(jobId);
      setProcessingStatus({ 
        jobId, 
        status: 'success', 
        message: `Successfully processed job. Result: ${result.result?.status}` 
      });
      
      // Refresh the job list
      await loadPendingJobs();
    } catch (error) {
      setProcessingStatus({ 
        jobId, 
        status: 'error', 
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Process the next job
  const handleProcessNextJob = async () => {
    if (pendingJobs.length === 0) {
      setProcessingStatus({ 
        jobId: 'none', 
        status: 'error', 
        message: 'No pending jobs to process' 
      });
      return;
    }
    
    setLoading(true);
    setProcessingStatus({ jobId: 'next', status: 'processing', message: 'Processing next job...' });
    
    try {
      const result = await processNextJob();
      setProcessingStatus({ 
        jobId: result.jobId, 
        status: 'success', 
        message: `Successfully processed job. Result: ${result.result?.status}` 
      });
      
      // Refresh the job list
      await loadPendingJobs();
    } catch (error) {
      setProcessingStatus({ 
        jobId: 'next', 
        status: 'error', 
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Toggle auto-refresh
  const toggleAutoRefresh = () => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    } else {
      // Refresh every 10 seconds
      const interval = window.setInterval(loadPendingJobs, 10000);
      setRefreshInterval(interval as unknown as number);
    }
  };
  
  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [refreshInterval]);
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Manual Analysis Processing</h1>
      
      <div className="mb-6 flex justify-between items-center">
        <div>
          <button 
            onClick={loadPendingJobs} 
            disabled={isRefreshing}
            className="px-4 py-2 bg-gray-100 rounded mr-2 disabled:opacity-50"
          >
            {isRefreshing ? <Spinner className="mr-2 inline" /> : null}
            Refresh
          </button>
          
          <button 
            onClick={toggleAutoRefresh} 
            className={`px-4 py-2 rounded ${refreshInterval ? 'bg-red-100' : 'bg-gray-100'}`}
          >
            {refreshInterval ? 'Stop Auto-Refresh' : 'Start Auto-Refresh (10s)'}
          </button>
        </div>
        
        <button 
          onClick={handleProcessNextJob} 
          disabled={loading || pendingJobs.length === 0}
          className="px-4 py-2 bg-blue-500 text-white rounded ml-2 disabled:opacity-50"
        >
          {loading ? <Spinner className="mr-2 inline" /> : null}
          Process Next Job
        </button>
      </div>
      
      {/* Status message */}
      {processingStatus && (
        <div className={`mb-6 p-4 border rounded ${
          processingStatus.status === 'error' 
            ? 'border-red-500 bg-red-50' 
            : processingStatus.status === 'success' 
            ? 'border-green-500 bg-green-50' 
            : 'border-yellow-500 bg-yellow-50'
        }`}>
          <h3 className="font-semibold mb-2">Processing Status</h3>
          <p>{processingStatus.message}</p>
        </div>
      )}
      
      {/* Pending jobs list */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Pending Jobs 
          {pendingJobs.length > 0 && <span className="ml-2 px-2 py-1 text-xs bg-gray-200 rounded-full">{pendingJobs.length}</span>}
        </h2>
        
        {pendingJobs.length === 0 ? (
          <p className="text-gray-500">No pending jobs found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingJobs.map(job => (
              <div key={job.id} className="border rounded p-4 hover:shadow-md transition-shadow">
                <div className="mb-2">
                  <div className="flex justify-between">
                    <h3 className="font-semibold truncate">{job.candidate_slug}</h3>
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">{job.status}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Job: {job.job_slug}
                  </div>
                </div>
                <div className="mb-4">
                  <span className="text-sm text-gray-500">Created: </span>
                  <span className="text-sm">{formatDistanceToNow(new Date(job.created_at))} ago</span>
                </div>
                <div className="text-right">
                  <button 
                    onClick={() => handleProcessJob(job.id)} 
                    disabled={loading}
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded disabled:opacity-50"
                  >
                    {loading && processingStatus?.jobId === job.id ? <Spinner className="mr-2 inline" /> : null}
                    Process Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 