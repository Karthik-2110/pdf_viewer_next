'use client';

import { useState, useEffect } from 'react';

export default function ManualProcess() {
  const [pendingJobs, setPendingJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Load pending jobs
  const loadPendingJobs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/analyze/jobs/pending');
      if (response.ok) {
        const data = await response.json();
        setPendingJobs(data.jobs || []);
      } else {
        setMessage('Failed to load jobs. Please try again.');
      }
    } catch (error) {
      setMessage('Error: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

  // Process next job
  const processNextJob = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/analyze/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || 'manual_processing_secret_key'}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage(`Successfully processed job: ${data.jobId}`);
        // Refresh the job list
        await loadPendingJobs();
      } else {
        setMessage(`Error: ${data.error || 'Failed to process job'}`);
      }
    } catch (error) {
      setMessage('Error: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

  // Load jobs on mount
  useEffect(() => {
    loadPendingJobs();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Manual Processing Dashboard</h1>
      
      {message && (
        <div className="bg-gray-100 p-4 mb-4 rounded">
          {message}
        </div>
      )}
      
      <div className="mb-4">
        <button 
          onClick={loadPendingJobs}
          disabled={loading}
          className="bg-gray-200 px-4 py-2 rounded mr-2"
        >
          {loading ? 'Loading...' : 'Refresh Jobs'}
        </button>
        
        <button 
          onClick={processNextJob}
          disabled={loading || pendingJobs.length === 0}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {loading ? 'Processing...' : 'Process Next Job'}
        </button>
      </div>
      
      <div>
        <h2 className="text-xl font-bold mb-2">Pending Jobs ({pendingJobs.length})</h2>
        
        {pendingJobs.length === 0 ? (
          <p className="text-gray-500">No pending jobs found.</p>
        ) : (
          <ul className="space-y-2">
            {pendingJobs.map(job => (
              <li key={job.id} className="border p-3 rounded">
                <div className="flex justify-between">
                  <span className="font-bold">{job.candidate_slug}</span>
                  <span className="text-sm bg-gray-100 px-2 py-1 rounded">{job.status}</span>
                </div>
                <div className="text-sm">
                  Job: {job.job_slug}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 