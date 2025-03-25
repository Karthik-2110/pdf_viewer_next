declare module '@/app/types/analysis' {
  export type AnalysisJobStatus = 'pending' | 'processing' | 'completed' | 'failed';

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

  export interface AnalysisResult {
    score: number;
    status: string;
    suitable: boolean;
    summary: string;
    coldEmail: string;
  }

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

  export interface SubmitAnalysisResponse {
    jobId: string;
    status: AnalysisJobStatus;
    message: string;
  }

  export interface CheckAnalysisStatusResponse {
    jobId: string;
    status: AnalysisJobStatus;
    message?: string;
    result?: AnalysisResult;
    error?: string;
  }
} 