# Manual Resume Analysis Processing

This document explains how to use the asynchronous resume analysis system with manual processing. This approach addresses timeout issues with long-running AI processes in a way that doesn't rely on cron jobs.

## System Overview

1. When a resume is submitted, we store the job in the database with a "pending" status and return immediately
2. In the admin dashboard, you can manually process jobs one by one or automatically process the next pending job
3. The system shows you the status and results of each processing job

## Setup Instructions

1. **Run the Supabase migration script**
   
   Execute the SQL file `supabase/migrations/20240425_analysis_jobs.sql` in your Supabase database to create the required table and indexes.

2. **Add environment variables**

   Add these variables to your project's environment:

   ```
   CRON_SECRET="your_secret_key_here"
   NEXT_PUBLIC_CRON_SECRET="your_secret_key_here"
   ```

   Use the same value for both variables. This is used to authenticate requests to the processing endpoint.

3. **Restart your application**

   After adding the environment variables, restart your Next.js server to load them.

## How to Use

1. **Access the manual processing dashboard**

   Navigate to `/dashboard/analyze/manual-process` in your application to see pending jobs and process them.

2. **Process jobs**

   - Click "Process Next Job" to process the oldest pending job
   - Or click "Process Now" on a specific job to process it directly
   - You can enable auto-refresh to keep the list updated

3. **Monitor results**

   When a job completes processing, you'll see the status and results displayed in the UI.

## Key Files

- `app/api/analyze/route.ts`: Queues new analysis jobs
- `app/api/analyze/status/route.ts`: Checks job status
- `app/api/analyze/process/route.ts`: Processes jobs
- `app/api/analyze/jobs/pending/route.ts`: Lists pending jobs
- `app/dashboard/analyze/manual-process/page.tsx`: Dashboard for job processing
- `utils/analysis-jobs.ts`: Utility functions for working with jobs
- `app/types/analysis.ts`: Type definitions

## Benefits of This Approach

- No timeouts on API requests
- Transparent processing with visibility into job status
- Ability to prioritize which jobs to process
- Control over resource usage by deciding when to process jobs
- Job results are stored and can be retrieved repeatedly

## Notes for Deployment

This solution works both in development and in production. On Vercel or similar platforms, be sure to:

1. Set up the environment variables in your project settings
2. Run the Supabase migration in your production database
3. Add appropriate authentication to protect the manual processing dashboard 