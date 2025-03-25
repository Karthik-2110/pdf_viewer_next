-- Create analysis_jobs table for tracking resume analysis jobs
CREATE TABLE IF NOT EXISTS analysis_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status VARCHAR(50) NOT NULL, -- 'pending', 'processing', 'completed', 'failed'
  candidate_slug VARCHAR(255) NOT NULL,
  job_slug VARCHAR(255) NOT NULL,
  request_data JSONB NOT NULL,
  result JSONB,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_analysis_jobs_status ON analysis_jobs(status);

-- Create index for query by candidate and job
CREATE INDEX IF NOT EXISTS idx_analysis_jobs_candidate_job ON analysis_jobs(candidate_slug, job_slug);

-- Note: Row Level Security has been removed as Supabase Auth is not being used 