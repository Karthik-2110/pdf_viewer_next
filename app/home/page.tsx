"use client"

import * as React from "react"
import { addDays, format } from "date-fns"
import { CalendarIcon } from "lucide-react"
 
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import styles from './home.module.css'
import { BoltIcon } from '@heroicons/react/24/solid'
import { EnvelopeIcon as HeroEnvelopeIcon } from '@heroicons/react/24/solid'

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectGroup,
    SelectLabel,
} from "@/components/ui/select"

// table starts here
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
// table ends here

import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
// import { MapPinIcon, BriefcaseIcon, BuildingIcon, ClockIcon, FileIcon, EnvelopeIcon } from "@/components/icons"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range"
import { DateRange } from "react-day-picker"

interface Job {
    slug: string;
    name: string;
    updated_on: string;
}

interface ProcessedCandidate {
    // Basic info
    id: number;
    slug: string;
    name: string;
    email: string;
    contact_number: string;
    
    // Professional info
    current_status: string;
    position: string;
    skills: string[];
    experience: string;
    status: string;
    
    // Resume info
    resumeLink: string | undefined;
    resumeText: string | null;
    resumeAnalysis: {
        score: number;
        status: string;
        suitable: boolean;
        summary: string;
        coldEmail: string;
    } | null;
    
    // Dates
    createdOn: string;
    
    // Additional details
    avatar?: string;
    gender_id?: number;
    qualification_id?: number;
    specialization?: string;
    work_ex_year?: number;
    candidate_dob?: string;
    current_salary?: string;
    salary_expectation?: string;
    willing_to_relocate?: number;
    current_organization?: string;
    notice_period?: number;
    currency_id?: number;
    
    // Social links
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    github?: string;
    xing?: string;
    
    // Location
    city?: string;
    locality?: string;
    state?: string;
    country?: string;
    address?: string;
    
    // Additional professional details
    relevant_experience?: number;
    available_from?: string;
    source?: string;
    language_skills?: string;
    candidate_summary?: string;
    custom_fields?: any[];
    
    // Communication history
    last_calllog_added_on?: string;
    last_email_sent_on?: string;
    last_sms_sent_on?: string;
    last_communication?: string;
}

interface CandidateData {
    candidate: {
        id: number;
        slug: string;
        first_name: string;
        last_name: string;
        email: string;
        contact_number: string;
        current_status: string;
        position: string;
        skill: string;
        experience: string;
        created_on: string;
        resume: {
            filename: string;
            file_link: string;
        };
        avatar?: string;
        gender_id?: number;
        qualification_id?: number;
        specialization?: string;
        work_ex_year?: number;
        candidate_dob?: string;
        current_salary?: string;
        salary_expectation?: string;
        willing_to_relocate?: number;
        current_organization?: string;
        notice_period?: number;
        currency_id?: number;
        facebook?: string;
        twitter?: string;
        linkedin?: string;
        github?: string;
        xing?: string;
        city?: string;
        locality?: string;
        state?: string;
        country?: string;
        address?: string;
        relevant_experience?: number;
        available_from?: string;
        source?: string;
        language_skills?: string;
        candidate_summary?: string;
        custom_fields?: any[];
        last_calllog_added_on?: string;
        last_email_sent_on?: string;
        last_sms_sent_on?: string;
        last_communication?: string;
    };
    status: {
        status_id: number;
        label: string;
    };
}

// Function to fetch API key from the server
const fetchApiKey = async (): Promise<string> => {
  try {
    const response = await fetch('/api/apikey');
    if (!response.ok) {
      console.error('Failed to fetch API key');
      return '';
    }
    const data = await response.json();
    return data.apiKey;
  } catch (error) {
    console.error('Error fetching API key:', error);
    return '';
  }
};

// Remove the hardcoded API key
// const RECRUIT_CRM_API_KEY = "uLMA7yLGleZcTV6SvclZaci4s4BEl4J487S3CbiueVsnLtKaUNc1FqBWATMLTca29vyW8Wwb6WMrwTkGPm8N_V8xNzQwMTUyNTk2Onw6cHJvZHVjdGlvbg==";
const RECRUIT_CRM_BASE_URL = 'https://api.recruitcrm.io/v1';

export default function Home() {
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
        from: undefined,
        to: undefined,
    })
    const [jobs, setJobs] = React.useState<Job[]>([])
    const [loading, setLoading] = React.useState(false)
    const [selectedJob, setSelectedJob] = React.useState<string>('')
    const [selectedJobInfo, setSelectedJobInfo] = React.useState<string>('')
    const [candidates, setCandidates] = React.useState<ProcessedCandidate[]>([])
    const [fetchingCandidates, setFetchingCandidates] = React.useState(false)
    const [jobDescription, setJobDescription] = React.useState<string>('')
    const [selectedCandidate, setSelectedCandidate] = React.useState<ProcessedCandidate | null>(null);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [showEmailModal, setShowEmailModal] = React.useState(false);
    const [analyzingCandidates, setAnalyzingCandidates] = React.useState(false);
    const [sendingEmail, setSendingEmail] = React.useState(false);
    const [recipientEmail, setRecipientEmail] = React.useState<string>('');
    const [emailSent, setEmailSent] = React.useState(false);
    const [apiKey, setApiKey] = React.useState<string>(''); // Store the API key

    // Fetch the API key when component mounts
    React.useEffect(() => {
        const getApiKey = async () => {
            const key = await fetchApiKey();
            setApiKey(key);
        };
        getApiKey();
    }, []);

    const handleDateRangeChange = (newDateRange: DateRange | undefined) => {
        setDateRange(newDateRange)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedJob) {
            alert('Please select a job')
            return
        }

        try {
            setFetchingCandidates(true)

            // Get the API key if not already available
            const currentApiKey = apiKey || await fetchApiKey();
            if (!currentApiKey) {
                throw new Error('API key not available');
            }

            // Fetch selected job details based on jobSlug
            // console.log(RECRUIT_CRM_API_KEY)
           
            const jobDetailsResponse = await fetch(`${RECRUIT_CRM_BASE_URL}/jobs/${selectedJob}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${currentApiKey}` }
            });

            const jobDetails = await jobDetailsResponse.json();
            setSelectedJobInfo(jobDetails)
        
            // console.log(selectedJobInfo)
            
            // Construct API URL with date range parameters
            const apiUrl = new URL('/api/candidates', window.location.origin);
            apiUrl.searchParams.set('jobSlug', selectedJob);
            
            // Add date range parameters if both from and to dates are available
            if (dateRange?.from && dateRange?.to) {
                // Use the original dates without converting to UTC
                // This preserves the local timezone information
                apiUrl.searchParams.set('fromDate', dateRange.from.toISOString());
                apiUrl.searchParams.set('toDate', dateRange.to.toISOString());
            }

            const response = await fetch(apiUrl.toString())
            
            if (!response.ok) {
                throw new Error('Failed to fetch candidates')
            }

            const data = await response.json()

            const initialCandidates = data.data || []
            
            // Log the list of candidates after fetching
            console.log('Fetched candidates:', initialCandidates)
            
            // Process each candidate and extract resume text
            const processCandidates = async () => {
                const candidatesWithResumes: ProcessedCandidate[] = [];
                
                for (let index = 0; index < initialCandidates.length; index++) {
                    const candidateData = initialCandidates[index];
                    const candidateInfo: ProcessedCandidate = {
                        // Basic info
                        id: candidateData.candidate.id,
                        slug: candidateData.candidate.slug,
                        name: `${candidateData.candidate.first_name} ${candidateData.candidate.last_name}`,
                        email: candidateData.candidate.email,
                        contact_number: candidateData.candidate.contact_number,
                        
                        // Professional info
                        current_status: candidateData.candidate.current_status,
                        position: candidateData.candidate.position,
                        skills: Array.isArray(candidateData.candidate.skill) 
                            ? candidateData.candidate.skill 
                            : candidateData.candidate.skill ? [candidateData.candidate.skill] : [],
                        experience: candidateData.candidate.experience,
                        status: candidateData.status.label,
                        
                        // Resume info
                        resumeLink: candidateData.candidate.resume?.file_link,
                        resumeText: null, // Will be populated if available
                        resumeAnalysis: null, // Will be populated if analysis is successful
                        
                        // Dates
                        createdOn: candidateData.candidate.created_on,
                        
                        // Additional details
                        avatar: candidateData.candidate.avatar,
                        gender_id: candidateData.candidate.gender_id,
                        qualification_id: candidateData.candidate.qualification_id,
                        specialization: candidateData.candidate.specialization,
                        work_ex_year: candidateData.candidate.work_ex_year,
                        candidate_dob: candidateData.candidate.candidate_dob,
                        current_salary: candidateData.candidate.current_salary,
                        salary_expectation: candidateData.candidate.salary_expectation,
                        willing_to_relocate: candidateData.candidate.willing_to_relocate,
                        current_organization: candidateData.candidate.current_organization,
                        notice_period: candidateData.candidate.notice_period,
                        currency_id: candidateData.candidate.currency_id,
                        
                        // Social links
                        facebook: candidateData.candidate.facebook,
                        twitter: candidateData.candidate.twitter,
                        linkedin: candidateData.candidate.linkedin,
                        github: candidateData.candidate.github,
                        xing: candidateData.candidate.xing,
                        
                        // Location
                        city: candidateData.candidate.city,
                        locality: candidateData.candidate.locality,
                        state: candidateData.candidate.state,
                        country: candidateData.candidate.country,
                        address: candidateData.candidate.address,
                        
                        // Additional professional details
                        relevant_experience: candidateData.candidate.relevant_experience,
                        available_from: candidateData.candidate.available_from,
                        source: candidateData.candidate.source,
                        language_skills: candidateData.candidate.language_skills,
                        candidate_summary: candidateData.candidate.candidate_summary,
                        custom_fields: candidateData.candidate.custom_fields,
                        
                        // Communication history
                        last_calllog_added_on: candidateData.candidate.last_calllog_added_on,
                        last_email_sent_on: candidateData.candidate.last_email_sent_on,
                        last_sms_sent_on: candidateData.candidate.last_sms_sent_on,
                        last_communication: candidateData.candidate.last_communication
                    };
                    
                    try {
                        // Extract resume text if resume link is available
                        if (candidateData.candidate.resume && candidateData.candidate.resume.file_link) {
                            // Call the PDF API to extract text
                            const pdfResponse = await fetch('/api/pdf', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    pdfUrl: candidateData.candidate.resume.file_link
                                }),
                            });
                            
                            if (pdfResponse.ok) {
                                const pdfData = await pdfResponse.json();
                                candidateInfo.resumeText = pdfData.text;
                            }
                        }
                    } catch (error) {
                        // Silently handle PDF extraction errors
                    }
                    
                    candidatesWithResumes.push(candidateInfo);
                }
                
                return candidatesWithResumes;
            };
            
            // Execute the async function to process candidates
            const processedCandidates = await processCandidates();

            // Set job description from the API response
            if (initialCandidates.length > 0 && initialCandidates[0].job_description_text) {
                setJobDescription(initialCandidates[0].job_description_text);
            }

            // Set candidates directly from the API response
            setCandidates(processedCandidates)
        } catch (error) {
            console.error('Error:', error)
            alert('Failed to fetch candidates')
        } finally {
            setFetchingCandidates(false)
        }
    }

    const analyzeCandidates = async () => {
        if (candidates.length === 0) {
            alert('Please fetch candidates first');
            return;
        }

        if (!jobDescription.trim()) {
            alert('Please enter a job description');
            return;
        }

        try {
            setAnalyzingCandidates(true);
            const updatedCandidates = [...candidates];

            for (let i = 0; i < updatedCandidates.length; i++) {
                const candidate = updatedCandidates[i];
                // console.log(candidate)
                // console.log(selectedJob)

                
                if (candidate.resumeText) {
                    try {
                        const analyzeResponse = await fetch('/api/analyze', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                text: candidate.resumeText,
                                jobDescription: jobDescription,
                                jobSlug: selectedJob,
                                candidateSlug: candidate.slug,
                                skills: candidate.skills[0],
                                specialization: candidate.specialization,
                                salary_expectation: candidate.salary_expectation,
                                current_salary: candidate.current_salary,
                                selectedJobInfo: selectedJobInfo
                            }),
                        });
                        
                        if (analyzeResponse.ok) {
                            const analyzeData = await analyzeResponse.json();
                            updatedCandidates[i] = {
                                ...candidate,
                                resumeAnalysis: {
                                    score: analyzeData.score,
                                    status: analyzeData.status,
                                    suitable: analyzeData.suitable,
                                    summary: analyzeData.summary,
                                    coldEmail: analyzeData.coldEmail
                                }
                            };
                        }
                    } catch (analyzeError) {
                        console.error(`Error analyzing candidate ${candidate.name}:`, analyzeError);
                    }
                }
            }

            setCandidates(updatedCandidates);
        } catch (error) {
            console.error('Error analyzing candidates:', error);
            alert('Failed to analyze candidates');
        } finally {
            setAnalyzingCandidates(false);
        }
    };

    const sendAnalysisEmail = async (candidate: ProcessedCandidate, email: string) => {
        if (!candidate || !candidate.resumeAnalysis) {
            alert('No analysis available for this candidate');
            return;
        }

        if (!email.trim()) {
            alert('Please enter a recipient email');
            return;
        }

        try {
            console.log('Send Report button clicked for candidate:', candidate.name, 'to email:', email);
            setSendingEmail(true);
            setEmailSent(false);
            
            const jobInfo = jobs.find(job => job.slug === selectedJob);
            const jobTitle = jobInfo ? jobInfo.name : 'Position';
            
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    candidate,
                    jobTitle,
                    companyName: 'Your Company', // You can customize this or make it a setting
                    recipientEmail: email
                }),
            });
            
            if (response.ok) {
                setEmailSent(true);
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to send email');
            }
        } catch (error) {
            console.error('Error sending email:', error);
            alert('Failed to send email. Please try again.');
        } finally {
            setSendingEmail(false);
        }
    };

    const fetchJobs = React.useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/jobs');
            if (!response.ok) throw new Error('Failed to fetch jobs');
            const data = await response.json();
            setJobs(data.data || []);
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchJobs();
    }, [])

    return (
        <div className={styles.bg}>
            <div className={styles.navbar_parent}>
                <div className="flex flex-row items-center">
                    <div className={styles.logo_parent}>
                        <div className={styles.logo}>
                            <BoltIcon className="h-6 w-6 text-white" />
                        </div>
                        <div className={styles.logo_text}>PDF Reader</div>
                    </div>
                </div>
            </div>
            <div className={styles.mass_container}>
                <div className="flex flex-col items-center">
                    <div className={styles.card_wrapper}>
                        <form onSubmit={handleSubmit}>
                            <div className='flex flex-col items-start mb-4'>
                                <h1 className={styles.selector_title}>Job Selector</h1>
                                <p className={styles.selector_sub_text}>Select a job to fetch candidates for</p>
                            </div>
                            <div className='flex flex-col items-start gap-4'>
                                <div className='w-full'>
                                    <Select
                                        value={selectedJob}
                                        onValueChange={setSelectedJob}
                                        disabled={loading}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select a job" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Jobs</SelectLabel>
                                                {jobs.map((job) => (
                                                    <SelectItem key={job.slug} value={job.slug}>
                                                        {job.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="w-full">
                                    <DatePickerWithRange 
                                        onDateRangeChange={handleDateRangeChange} 
                                    />
                                </div>
                            </div>
                            <Button 
                                type="submit" 
                                className="w-full mt-4 bg-[#2CB46D] text-white hover:bg-[#1D9A5E]"
                                disabled={fetchingCandidates || !selectedJob}
                            >
                                {fetchingCandidates ? 'Fetching Candidates...' : 'Fetch Candidates'}
                            </Button>
                        </form>
                    </div>

                    {/* analyse card starts here */}
                    <div className={`${styles.table} ${candidates.length === 0 ? 'hidden' : ''}`}>
                        <div className={styles.card_wrapper2}>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                analyzeCandidates();
                            }}>
                                <div className='flex flex-col items-start mb-4'>
                                    <h1 className={styles.selector_title}>{selectedJob && jobs.find(job => job.slug === selectedJob)?.name}</h1>
                                    <p className={styles.selector_sub_text}>Set recruitment rules and guidelines for your candidates</p>
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 mb-2">
                                        Job Description
                                    </label>
                                    <textarea
                                        id="jobDescription"
                                        value={jobDescription}
                                        onChange={(e) => setJobDescription(e.target.value)}
                                        placeholder="Enter detailed job requirements, skills, and responsibilities. Each point on a new line helps in better candidate matching."
                                        rows={5}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-white p-3 text-gray-800 border border-gray-300"
                                    />
                                    <p className="mt-2 text-xs text-gray-500">
                                        Tip: Be specific about required skills, experience, and job responsibilities. 
                                        Each new line will help our AI better match candidates.
                                    </p>
                                </div>

                                <Button 
                                    type="submit" 
                                    className="w-full mt-4 bg-[#2CB46D] text-white hover:bg-[#1D9A5E]"
                                    disabled={analyzingCandidates}
                                >
                                    {analyzingCandidates ? 'Analyzing Candidates...' : 'Analyze Candidates'}
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
                

                <div className={`${styles.table} ${candidates.length === 0 ? 'hidden' : ''}`}>
                    <div className="p-4 border rounded-md">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500">Number of candidates: {candidates.length}</span>
                            {candidates.some(c => c.resumeAnalysis) && (
                                <Button 
                                    onClick={() => {
                                        // Send email for all analyzed candidates
                                        const analyzedCandidates = candidates.filter(c => c.resumeAnalysis);
                                        if (analyzedCandidates.length > 0) {
                                            console.log('Send Candidates Report button clicked. Sending report for', analyzedCandidates.length, 'candidates');
                                            setSendingEmail(true);
                                            
                                            const jobInfo = jobs.find(job => job.slug === selectedJob);
                                            const jobTitle = jobInfo ? jobInfo.name : 'Position';
                                            
                                            fetch('/api/send-email', {
                                                method: 'POST',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                },
                                                body: JSON.stringify({
                                                    candidates: analyzedCandidates, // Send all analyzed candidates
                                                    jobTitle,
                                                    companyName: 'Your Company',
                                                    recipientEmail: 'karthik@humanx.io' // Using the hardcoded email
                                                }),
                                            })
                                            .then(response => {
                                                if (response.ok) {
                                                    alert('Analysis report sent successfully!');
                                                } else {
                                                    throw new Error('Failed to send email');
                                                }
                                            })
                                            .catch(error => {
                                                console.error('Error sending email:', error);
                                                alert('Failed to send email. Please try again.');
                                            })
                                            .finally(() => {
                                                setSendingEmail(false);
                                            });
                                        }
                                    }}
                                    disabled={sendingEmail || !candidates.some(c => c.resumeAnalysis)}
                                    className="flex items-center"
                                >
                                    {sendingEmail ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <HeroEnvelopeIcon className="h-4 w-4 mr-2" />
                                            Send Candidates Report
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                            <Table className="mt-4">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Result</TableHead>
                                        <TableHead>Score</TableHead>
                                        <TableHead>Cold Email</TableHead>
                                        <TableHead>Created On</TableHead>
                                        <TableHead>Resume</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {candidates.map((candidateData: ProcessedCandidate) => (
                                        <TableRow key={candidateData.id}>
                                            <TableCell className="font-medium">
                                                {candidateData.name}
                                            </TableCell>
                                            <TableCell>{candidateData.email}</TableCell>
                                            <TableCell>
                                                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                                    {candidateData.status}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {candidateData.resumeAnalysis ? (
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                                                candidateData.resumeAnalysis.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                                                candidateData.resumeAnalysis.status === 'Consider' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-red-100 text-red-800'
                                                            }`}>
                                                                {candidateData.resumeAnalysis.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-500">Not analyzed</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {candidateData.resumeAnalysis ? (
                                                    <span className="text-sm font-medium">
                                                        {candidateData.resumeAnalysis.score}/100
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-500">Not analyzed</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {candidateData.resumeAnalysis ? (
                                                        <Button 
                                                                variant="outline" 
                                                                size="sm"
                                                                className="ml-1 h-6 text-xs"
                                                                onClick={() => {
                                                                    console.log('Email button clicked for candidate:', candidateData.name);
                                                                    setSelectedCandidate(candidateData);
                                                                    setShowEmailModal(true);
                                                                }}
                                                            >
                                                                <HeroEnvelopeIcon className="h-3 w-3 mr-1" />
                                                                Email
                                                            </Button>
                                                ) : (
                                                    <span className="text-xs text-gray-500">Not analyzed</span>
                                                )}
                                            </TableCell>
                                            <TableCell>{format(new Date(candidateData.createdOn), 'PPP')}</TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                    onClick={() => {
                                                        console.log('Resume button clicked for candidate:', candidateData.name);
                                                        window.open(candidateData.resumeLink, '_blank');
                                                    }}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                                    </svg>

                                                    <span className="sr-only">Download Resume</span>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                </div>
            </div>

            {/* Candidate Details Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Candidate Details</DialogTitle>
                    </DialogHeader>
                    {selectedCandidate && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Name</Label>
                                <div className="col-span-3">{selectedCandidate.name}</div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Email</Label>
                                <div className="col-span-3">{selectedCandidate.email}</div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Phone</Label>
                                <div className="col-span-3">{selectedCandidate.contact_number}</div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Skills</Label>
                                <div className="col-span-3 flex flex-wrap gap-1">
                                    {Array.isArray(selectedCandidate.skills) ? (
                                        selectedCandidate.skills.map((skill: string, index: number) => (
                                            <Badge key={index} variant="outline">{skill}</Badge>
                                        ))
                                    ) : (
                                        <span>{selectedCandidate.skills}</span>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Resume Text</Label>
                                <div className="col-span-3 max-h-[200px] overflow-y-auto text-sm border p-2 rounded">
                                    {selectedCandidate.resumeText || 'No resume text available'}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Cold Email Dialog */}
            <Dialog open={showEmailModal} onOpenChange={setShowEmailModal}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Cold Email Template</DialogTitle>
                        <div className="text-sm text-gray-500">
                            {selectedCandidate?.name}
                        </div>
                    </DialogHeader>
                    {selectedCandidate?.resumeAnalysis?.coldEmail ? (
                        <div className="grid gap-4 py-4">
                            <div className="border p-4 rounded-md bg-gray-50">
                                <div className="whitespace-pre-wrap text-sm">
                                    {selectedCandidate.resumeAnalysis.coldEmail}
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="recipient-email">Send Analysis Report To:</Label>
                                    <div className="flex gap-2">
                                        <Input 
                                            id="recipient-email"
                                            type="email" 
                                            placeholder="recipient@example.com" 
                                            value={recipientEmail}
                                            onChange={(e) => setRecipientEmail(e.target.value)}
                                            className="flex-1"
                                        />
                                        <Button 
                                            onClick={() => sendAnalysisEmail(selectedCandidate, recipientEmail)}
                                            disabled={sendingEmail || !recipientEmail.trim()}
                                            className="whitespace-nowrap"
                                        >
                                            {sendingEmail ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <HeroEnvelopeIcon className="h-4 w-4 mr-2" />
                                                    Send Report
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                    {emailSent && (
                                        <div className="text-sm text-green-600 flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Email sent successfully!
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex justify-end">
                                <Button 
                                    onClick={() => {
                                        if (selectedCandidate?.resumeAnalysis?.coldEmail) {
                                            console.log('Copy to Clipboard button clicked for candidate:', selectedCandidate.name);
                                            navigator.clipboard.writeText(selectedCandidate.resumeAnalysis.coldEmail);
                                            // You could add a toast notification here
                                        }
                                    }}
                                    variant="outline"
                                >
                                    Copy to Clipboard
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="py-4 text-center text-gray-500">
                            No email template available
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}