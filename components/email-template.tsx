import * as React from 'react';
import { ProcessedCandidate } from '@/app/types';

interface EmailTemplateProps {
  candidate: ProcessedCandidate;
  jobTitle: string;
  companyName: string;
}

export const CandidateAnalysisEmail: React.FC<EmailTemplateProps> = ({
  candidate,
  jobTitle,
  companyName,
}) => {
  // Calculate color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#34D399'; // Green
    if (score >= 60) return '#FBBF24'; // Yellow
    return '#F87171'; // Red
  };

  const scoreColor = candidate.resumeAnalysis ? getScoreColor(candidate.resumeAnalysis.score) : '#9CA3AF';
  
  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      color: '#1F2937',
      margin: '0 auto',
      padding: '20px',
      maxWidth: '600px',
    }}>
      <div style={{
        background: 'linear-gradient(to right, #2563EB, #3B82F6)',
        padding: '24px',
        borderRadius: '12px 12px 0 0',
        textAlign: 'center',
      }}>
        <h1 style={{ color: 'white', margin: '0', fontSize: '24px', fontWeight: '600' }}>
          Candidate Analysis Report
        </h1>
      </div>
      
      <div style={{
        background: 'white',
        padding: '24px',
        borderRadius: '0 0 12px 12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      }}>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>Candidate Information</h2>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ 
              width: '50px', 
              height: '50px', 
              borderRadius: '50%', 
              background: '#E5E7EB', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginRight: '12px',
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#4B5563',
            }}>
              {candidate.name.charAt(0)}
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '600' }}>{candidate.name}</div>
              <div style={{ fontSize: '14px', color: '#6B7280' }}>{candidate.email}</div>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>Position</div>
              <div style={{ fontSize: '16px' }}>{candidate.position || 'N/A'}</div>
            </div>
            <div>
              <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>Experience</div>
              <div style={{ fontSize: '16px' }}>{candidate.experience || 'N/A'}</div>
            </div>
          </div>
        </div>
        
        {candidate.resumeAnalysis && (
          <>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Analysis Results</h2>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                background: '#F3F4F6',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '16px'
              }}>
                <div>
                  <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>Match Score</div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: scoreColor }}>{candidate.resumeAnalysis.score}/100</div>
                </div>
                <div style={{ 
                  padding: '6px 12px', 
                  borderRadius: '9999px', 
                  fontSize: '14px', 
                  fontWeight: '600',
                  backgroundColor: candidate.resumeAnalysis.status === 'Approved' ? '#DCFCE7' : 
                                  candidate.resumeAnalysis.status === 'Consider' ? '#FEF3C7' : '#FEE2E2',
                  color: candidate.resumeAnalysis.status === 'Approved' ? '#166534' : 
                         candidate.resumeAnalysis.status === 'Consider' ? '#92400E' : '#B91C1C',
                }}>
                  {candidate.resumeAnalysis.status}
                </div>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>Summary</div>
                <div style={{ fontSize: '16px', lineHeight: '1.5' }}>{candidate.resumeAnalysis.summary}</div>
              </div>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>Recommended Action</h2>
              <div style={{ 
                padding: '16px', 
                borderRadius: '8px',
                border: '1px solid',
                borderColor: candidate.resumeAnalysis.status === 'Approved' ? '#D1FAE5' : 
                            candidate.resumeAnalysis.status === 'Consider' ? '#FEF3C7' : '#FEE2E2',
                backgroundColor: candidate.resumeAnalysis.status === 'Approved' ? '#ECFDF5' : 
                                candidate.resumeAnalysis.status === 'Consider' ? '#FFFBEB' : '#FEF2F2',
              }}>
                {candidate.resumeAnalysis.status === 'Approved' ? (
                  <div>This candidate is a strong match for the position. We recommend proceeding with an interview.</div>
                ) : candidate.resumeAnalysis.status === 'Consider' ? (
                  <div>This candidate shows potential but may need further evaluation. Consider a screening call.</div>
                ) : (
                  <div>This candidate does not appear to be a good match for this position.</div>
                )}
              </div>
            </div>
            
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>Suggested Cold Email</h2>
              <div style={{ 
                padding: '16px', 
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                backgroundColor: '#F9FAFB',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                fontSize: '14px',
                lineHeight: '1.5'
              }}>
                {candidate.resumeAnalysis.coldEmail}
              </div>
            </div>
          </>
        )}
        
        <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '14px', color: '#6B7280' }}>
          <p>This analysis was generated by AI based on the candidate's resume and the job requirements.</p>
          <p> {new Date().getFullYear()} {companyName} - AI Recruitment Assistant</p>
        </div>
      </div>
    </div>
  );
};

export default CandidateAnalysisEmail;