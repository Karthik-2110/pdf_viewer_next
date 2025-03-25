// Analysis job status types
export type AnalysisJobStatus = 'pending' | 'processing' | 'completed' | 'failed';

// Analysis job database model
export interface AnalysisJob {
  id: string;
  status: AnalysisJobStatus;
  candidate_slug: string;
  job_slug: string;
  request_data: Record<string, any>;
  result?: AnalysisResult | null;
  error?: string | null;
  created_at: string;
  updated_at: string;
}

// Analysis result format (matches your existing response format)
export interface AnalysisResult {
  score: number;
  status: string;
  suitable: boolean;
  summary: string;
  coldEmail: string;
}

// Request format for submitting an analysis job
export interface SubmitAnalysisRequest {
  jobDescription?: string;
  text: string;
  jobSlug: string;
  candidateSlug: string;
  skills?: string;
  specialization?: string;
  salary_expectation?: string;
  current_salary?: string;
  selectedJobInfo?: {
    job_description_text?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

// Response format for job submission
export interface SubmitAnalysisResponse {
  jobId: string;
  status: AnalysisJobStatus;
  message: string;
}

// Response format for job status check
export interface CheckAnalysisStatusResponse {
  jobId: string;
  status: AnalysisJobStatus;
  message?: string;
  result?: AnalysisResult;
  error?: string;
} 