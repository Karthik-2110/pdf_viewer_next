"use client"

import * as React from "react"
import Link from "next/link";
import Image from "next/image";
import { BoltIcon, PlusIcon } from '@heroicons/react/24/solid'
import { BoltIcon as BoltIconOutline } from '@heroicons/react/24/outline'
import { SparklesIcon } from '@heroicons/react/24/solid'
import { useState } from "react";
import { useSession } from "next-auth/react"
import { format } from "date-fns";

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { DateRange } from "react-day-picker"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select"
import { DatePickerWithRange } from "./ui/date-picker-with-range";

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"

  const invoices = [
    {
      invoice: "INV001",
      paymentStatus: "Paid",
      totalAmount: "$250.00",
      paymentMethod: "Credit Card",
    },
    {
      invoice: "INV002",
      paymentStatus: "Pending",
      totalAmount: "$150.00",
      paymentMethod: "PayPal",
    },
    {
      invoice: "INV003",
      paymentStatus: "Unpaid",
      totalAmount: "$350.00",
      paymentMethod: "Bank Transfer",
    },
    {
      invoice: "INV004",
      paymentStatus: "Paid",
      totalAmount: "$450.00",
      paymentMethod: "Credit Card",
    },
    {
      invoice: "INV005",
      paymentStatus: "Paid",
      totalAmount: "$550.00",
      paymentMethod: "PayPal",
    },
    {
      invoice: "INV006",
      paymentStatus: "Pending",
      totalAmount: "$200.00",
      paymentMethod: "Bank Transfer",
    },
    {
      invoice: "INV007",
      paymentStatus: "Unpaid",
      totalAmount: "$300.00",
      paymentMethod: "Credit Card",
    },
  ]


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

const RECRUIT_CRM_API_KEY = "uLMA7yLGleZcTV6SvclZaci4s4BEl4J487S3CbiueVsnLtKaUNc1FqBWATMLTca29vyW8Wwb6WMrwTkGPm8N_V8xNzQwMTUyNTk2Onw6cHJvZHVjdGlvbg==";
const RECRUIT_CRM_BASE_URL = 'https://api.recruitcrm.io/v1';



export default function Navbar() {
    const { data: session } = useSession()
    console.log(session)
  const [name, setName] = useState("Pedro Duarte");
  const [username, setUsername] = useState("@peduarte");
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined)
const [jobs, setJobs] = React.useState<Job[]>([])
const [loading, setLoading] = React.useState(false)
const [selectedJob, setSelectedJob] = React.useState<string>('')
const [selectedJobInfo, setSelectedJobInfo] = React.useState<string>('')
const [candidates, setCandidates] = React.useState<ProcessedCandidate[]>([])
const [fetchingCandidates, setFetchingCandidates] = React.useState(false)
const [fetchedCandidatesCount, setFetchedCandidatesCount] = React.useState<number | null>(null)
const [jobDescription, setJobDescription] = React.useState<string>('')
const [selectedCandidate, setSelectedCandidate] = React.useState<ProcessedCandidate | null>(null);
const [isDialogOpen, setIsDialogOpen] = React.useState(false);
const [showEmailModal, setShowEmailModal] = React.useState(false);
const [analyzingCandidates, setAnalyzingCandidates] = React.useState(false);
const [sendingEmail, setSendingEmail] = React.useState(false);
const [recipientEmail, setRecipientEmail] = React.useState<string>('');
const [emailSent, setEmailSent] = React.useState(false);
const [sheetOpen, setSheetOpen] = React.useState(false)

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
        setCandidates([]) // Clear previous candidates
        setFetchedCandidatesCount(null) // Reset count

        // Fetch selected job details based on jobSlug
        // console.log(RECRUIT_CRM_API_KEY)
       
        const jobDetailsResponse = await fetch(`${RECRUIT_CRM_BASE_URL}/jobs/${selectedJob}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${RECRUIT_CRM_API_KEY}` }
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
        setFetchedCandidatesCount(initialCandidates.length)
        
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
        
        // Only close the sheet if candidates were successfully fetched
        if (processedCandidates.length > 0) {
            // Close the sheet after a short delay to show the loaded candidates
            setTimeout(() => {
                setSheetOpen(false);
            }, 1000);
        }
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

const handleSheetOpenChange = (open: boolean) => {
  setSheetOpen(open)
  // When sheet is closed, reset form values
  if (!open) {
    setSelectedJob('')
    setDateRange(undefined)
  }
}

  return (
    <>
      <nav className="flex flex-row justify-between items-center p-4 bg-[#171717] border-b border-[#2E2E2E]">
        <div className="logo_wrapper">
          <Link href="/" className="flex flex-row items-center gap-2">
            <SparklesIcon className="size-5 text-[#fafafa]" />
            <span className="text-[#FAFAFA]">Candidate analyser</span>
          </Link>
        </div>



        <div className="menu_wrapper flex flex-row gap-2 items-center">
          <div className="create_workflow_btn mr-4">
            <form
            // action={async () => {
            //     "use server"
            //     await signIn("google")
            // }}
            >
              
              <Sheet open={sheetOpen} onOpenChange={handleSheetOpenChange}>
                <SheetTrigger asChild>
                  {/* <Button variant="outline">Open</Button> */}
                  <button className="bg-[#00623A] text-[#FAFAFA] border border-[#148253] font-semibold text-xs px-3 py-2 rounded-md flex flex-row items-center">
                <BoltIconOutline className="size-4 text-[#fafafa] mr-1" />
                Start analysis
              </button>
                </SheetTrigger>
                <SheetContent className="bg-[#171717] border-l border-[#2E2E2E] p-0 w-[40%] max-w-[40%] sm:max-w-[40%] flex flex-col">
                  <SheetHeader className="p-4 border-b border-[#2E2E2E]">
                    <SheetTitle className="text-[#FAFAFA] text-lg font-medium">Start a new analysis</SheetTitle>
                    {/* <SheetDescription className="text-[#B4B4B4] text-sm">
                        Select a job role to start run an analysis
                    </SheetDescription> */}
                  </SheetHeader>
                  <form onSubmit={handleSubmit} className="flex flex-col flex-1 justify-between">
                    <div className="p-0">
                      <div className='flex flex-col items-start gap-4'>
                          <div className='deaigner_wrapper w-full flex flex-row items-center px-4'>
                              <div className="flex flex-col items-start w-2/4">
                                  <span className="text-[#FAFAFA] text-md font-semibold mb-1">Job role</span>
                                  <p className="text-[#CECECE] text-sm">Select a job to fetch candidates for</p>
                              </div>
                              <Select
                                  value={selectedJob}
                                  onValueChange={setSelectedJob}
                                  disabled={loading}
                              >
                                  <SelectTrigger className="w-2/4 bg-[#1F1F1F] border border-[#2E2E2E] rounded-md text-[#CECECE] focus:border-[#2CB46D] focus:ring-[#2CB46D] hover:border-[#2CB46D] h-10">
                                      <SelectValue placeholder="Select a job" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-[#1F1F1F] border border-[#2E2E2E] rounded-md text-[#B4B4B4] [&>*]:bg-[#1F1F1F]">
                                      <SelectGroup className=" bg-[#1F1F1F]">
                                          {jobs.map((job) => (
                                              <SelectItem 
                                                  key={job.slug} 
                                                  value={job.slug} 
                                                  className="bg-[#1F1F1F] text-[#CECECE] my-1 cursor-pointer hover:bg-[#2E2E2E] data-[highlighted]:bg-[#2E2E2E] data-[highlighted]:text-white rounded-md hover:text-[#CECECE]"
                                              >
                                                  {job.name}
                                              </SelectItem>
                                          ))}
                                      </SelectGroup>
                                  </SelectContent>
                              </Select>
                          </div>

                          <div className='date_wrapper w-full flex flex-row items-center mt-4 px-4'>
                              <div className="flex flex-col items-start w-2/4">
                                  <span className="text-[#FAFAFA] text-md font-semibold mb-1">Date range</span>
                                  <p className="text-[#CECECE] text-sm">Select a time period to analyze</p>
                              </div>
                              <div className="w-2/4">
                                  <DatePickerWithRange 
                                      onDateRangeChange={handleDateRangeChange}
                                      className="w-full"
                                  />
                              </div>
                          </div>

                          <div className='fetched_candidates_wrapper w-full mt-4 border-t border-[#2E2E2E] p-4'>
                            <span className="text-[#FAFAFA] text-md font-semibold">
                              {fetchingCandidates 
                                ? 'Fetching candidates...' 
                                : fetchedCandidatesCount !== null 
                                  ? `${fetchedCandidatesCount} ${fetchedCandidatesCount === 1 ? 'Candidate' : 'Candidates'} found` 
                                  : candidates.length > 0 
                                    ? `${candidates.length} ${candidates.length === 1 ? 'Candidate' : 'Candidates'}`
                                    : 'No candidates to show'}
                              {selectedJob && !fetchingCandidates && (candidates.length > 0 || fetchedCandidatesCount !== null) && 
                                ` for ${jobs.find(job => job.slug === selectedJob)?.name || 'Selected Job'}`}
                            </span>
                            <p className="text-[#CECECE] text-sm mt-1">
                              {fetchingCandidates 
                                ? 'Please wait while we fetch candidates...' 
                                : candidates.length > 0 
                                  ? dateRange?.from && dateRange?.to 
                                    ? `Showing candidates from ${format(dateRange.from, "MMM dd, yyyy")} to ${format(dateRange.to, "MMM dd, yyyy")}`
                                    : 'Please select additional configurations to get a better analysis' 
                                  : 'Please select a job and date range to fetch candidates'}
                            </p>
                              <div className="candidates_list_wrapper w-full">
                              <Table className="w-full p-0 m-0">
                                    <TableHeader>
                                        <TableRow>
                                        <TableHead className="text-[#B4B4B4] w-[250px]">Candidate</TableHead>
                                        <TableHead className="text-[#B4B4B4]">Status</TableHead>
                                        <TableHead className="text-[#B4B4B4]">Resume</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {fetchingCandidates ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center text-[#B4B4B4] py-8">
                                                    <div className="flex flex-col items-center justify-center gap-2">
                                                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#00623A]"></div>
                                                        <span>Loading candidates...</span>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : candidates.length > 0 ? (
                                            candidates.slice(0, 5).map((candidate) => (
                                                <TableRow key={candidate.id} className="hover:bg-[#1F1F1F] cursor-pointer">
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            {candidate.avatar ? (
                                                                <Image 
                                                                    src={candidate.avatar} 
                                                                    alt={candidate.name} 
                                                                    width={36} 
                                                                    height={36}
                                                                    className="rounded-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-9 h-9 rounded-full bg-[#2E2E2E] flex items-center justify-center text-[#FAFAFA]">
                                                                    {candidate.name.charAt(0).toUpperCase()}
                                                                </div>
                                                            )}
                                                            <div className="flex flex-col">
                                                                <span className="font-medium text-[#FAFAFA]">{candidate.name}</span>
                                                                <span className="text-[#B4B4B4] text-xs">{candidate.email}</span>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                                            candidate.status === 'Active' ? 'bg-[#143C2E] text-[#2CB46D]' : 
                                                            candidate.status === 'Inactive' ? 'bg-[#3C2E14] text-[#B4882C]' :
                                                            'bg-[#2E2E2E] text-[#B4B4B4]'
                                                        }`}>
                                                            {candidate.status}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        {candidate.resumeLink ? (
                                                            <a 
                                                                href={candidate.resumeLink} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-1 text-[#2CB46D] hover:underline"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                                                    <polyline points="14 2 14 8 20 8"></polyline>
                                                                    <line x1="16" y1="13" x2="8" y2="13"></line>
                                                                    <line x1="16" y1="17" x2="8" y2="17"></line>
                                                                    <polyline points="10 9 9 9 8 9"></polyline>
                                                                </svg>
                                                                Resume
                                                            </a>
                                                        ) : (
                                                            <span className="text-[#8A8A8A] text-xs">No resume available</span>
                                                        )}
                                                    </TableCell>
                                                   
                                                </TableRow>
                                            ))
                                        ) : selectedJob && dateRange?.from && dateRange?.to ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center text-[#B4B4B4] py-8">
                                                    No candidates found for the selected criteria
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center text-[#B4B4B4] py-8">
                                                    {!selectedJob ? 'Select a job to view candidates' : 'Select a date range to view candidates'}
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                    {candidates.length > 5 && (
                                        <TableFooter>
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-right text-[#B4B4B4]">
                                                    <div className="flex justify-between items-center">
                                                        <span>{candidates.length} total candidates found</span>
                                                        <span>{candidates.length - 5} more candidates not shown</span>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        </TableFooter>
                                    )}
                                </Table>
                              </div>
                          </div>
                      </div>
                    </div>
                    
                    <div className="p-4 mt-auto border-t border-[#2E2E2E] bg-[#171717] sticky bottom-0 w-full">
                     
                          <Button 
                          variant={"default"}
                            type="submit" 
                            className="w-full bg-[#00623A] text-[#FAFAFA] border border-[#148253] font-semibold text-xs px-3 py-2 rounded-md flex flex-row items-center justify-center hover:bg-[#1E2823] hover:border-[#148253] hover:text-[#FAFAFA]"
                            disabled={fetchingCandidates || !selectedJob || !(dateRange?.from && dateRange?.to)}
                          >
                              {fetchingCandidates ? 'Fetching Candidates...' : candidates.length > 0 ? 'Update Candidates' : 'Fetch Candidates'}
                          </Button>
                      {!fetchingCandidates && (
                        <p className="text-[#8A8A8A] text-xs mt-2 text-center">
                          {!selectedJob ? 'Please select a job role' : 
                           !(dateRange?.from && dateRange?.to) ? 'Please select a date range' : 
                           candidates.length > 0 ? `${candidates.length} candidates fetched successfully` :
                           `Ready to fetch candidates for ${jobs.find(job => job.slug === selectedJob)?.name || selectedJob} from ${dateRange?.from ? format(dateRange.from, "MMM dd, yyyy") : ""} to ${dateRange?.to ? format(dateRange.to, "MMM dd, yyyy") : ""}`}
                        </p>
                      )}
                    </div>
                  </form>
                </SheetContent>
              </Sheet>
            </form>
          </div>
          <div className="profile_wrapper flex flex-row gap-2 items-center">
                {session?.user?.image ? (
                  <Image src={session.user.image} alt="Profile" width={40} height={40} className="rounded-full" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#2E2E2E] flex items-center justify-center text-[#FAFAFA]">
                    {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                )}
            <Link href="/" className="flex flex-col">
              <span className="text-[#FAFAFA] font-semibold text-sm">
              {session?.user?.name || "User"}
              </span>
              <span className="text-[#B4B4B4] text-sm">
              {session?.user?.email || "Not signed in"}
              </span>
            </Link>
          </div>

        </div>
      </nav>


    </>



  );
}