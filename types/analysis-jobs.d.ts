import { AnalysisJob, AnalysisJobStatus, AnalysisResult } from '@/app/types/analysis';

// Declare the module
declare module '@/utils/analysis-jobs' {
  export function createAnalysisJob(
    candidateSlug: string,
    jobSlug: string,
    requestData: Record<string, any>
  ): Promise<string>;

  export function getAnalysisJob(jobId: string): Promise<AnalysisJob | null>;

  export function updateAnalysisJobStatus(
    jobId: string,
    status: AnalysisJobStatus,
    result?: AnalysisResult | null,
    error?: string | null
  ): Promise<boolean>;

  export function getPendingAnalysisJobs(limit?: number): Promise<AnalysisJob[]>;
} 