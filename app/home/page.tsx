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

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
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

import { toast } from "sonner"
  

interface Job {
    slug: string;
    name: string;
    updated_on: string;
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
    };
    status: {
        status_id: number;
        label: string;
    };
}

export default function home () {
    const [date, setDate] = React.useState<Date>()
    const [jobs, setJobs] = React.useState<Job[]>([])
    const [loading, setLoading] = React.useState(false)
    const [selectedJob, setSelectedJob] = React.useState<string>('')
    const [candidates, setCandidates] = React.useState<CandidateData[]>([])
    const [fetchingCandidates, setFetchingCandidates] = React.useState(false)
    const [jobDescription, setJobDescription] = React.useState('')
    const [analyzing, setAnalyzing] = React.useState(false)

    const analyzeCandidates = async () => {
        setAnalyzing(true);
        try {
            for (const candidateData of candidates) {
                const response = await fetch('/api/analyze', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        candidate: candidateData.candidate,
                        jobDescription: jobDescription
                    })
                });

                if (!response.ok) throw new Error('Analysis failed');
                
                const data = await response.json();
                console.log(`Analysis for ${candidateData.candidate.first_name} ${candidateData.candidate.last_name}:`, data.result);
            }
            toast.success('Analysis completed');
        } catch (error) {
            console.error('Analysis error:', error);
            toast.error('Failed to analyze candidates');
        } finally {
            setAnalyzing(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedJob) {
            alert('Please select a job role')
            return
        }

        try {
            setFetchingCandidates(true)
            const response = await fetch(`/api/candidates?jobSlug=${selectedJob}`)
            
            if (!response.ok) {
                throw new Error('Failed to fetch candidates')
            }

            const data = await response.json()
            let filteredCandidates = data.data || []

            // Filter candidates by date if selected
            if (date) {
                const selectedDate = format(date, 'yyyy-MM-dd')
                filteredCandidates = filteredCandidates.filter((candidateData: CandidateData) => {
                    const candidateDate = format(new Date(candidateData.candidate.created_on), 'yyyy-MM-dd')
                    return candidateDate === selectedDate
                })
            }

            setCandidates(filteredCandidates)
            toast.success(`Found ${filteredCandidates.length} candidates for this position.`)
        } catch (error) {
            console.error('Error:', error)
            toast.error('Failed to fetch candidates')
        } finally {
            setFetchingCandidates(false)
        }
    }

    const fetchJobs = React.useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/jobs');
            if (!response.ok) throw new Error('Failed to fetch jobs');
            const data = await response.json();
            console.log(data)
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
                <BoltIcon className={styles.logo} /> <span className='ml-2'>Recruit Crm automation</span>
                </div>
            </div>

            <div className={styles.mass_container}>
                <div className="flex flex-col items-center">
                    <div className={styles.card_wrapper}>
                        <form onSubmit={handleSubmit}>
                            <div className='flex flex-col items-start'>
                                <h1 className={styles.selector_title}>Job Role</h1>
                                <p className={styles.selector_sub_text}>Take your recruitment to the next level with our Workflow Automation.</p>
                            </div>

                            <Select value={selectedJob} onValueChange={setSelectedJob}>
                                <SelectTrigger className="w-full mt-4">
                                    <SelectValue placeholder="Select a job role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {loading ? (
                                        <SelectItem value="loading" disabled>Loading jobs...</SelectItem>
                                    ) : jobs.length > 0 ? (
                                        jobs.map((job) => (
                                            <SelectItem key={job.slug} value={job.slug}>
                                                {job.name}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="no-jobs" disabled>No jobs found</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>

                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full mt-2 justify-start text-left font-normal",
                                            !date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon />
                                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    align="start"
                                    className="flex w-auto flex-col space-y-2 p-2"
                                >
                                    <Select
                                        onValueChange={(value) =>
                                            setDate(addDays(new Date(), parseInt(value)))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent position="popper">
                                            <SelectItem value="-2">Day Before yesterday</SelectItem>
                                            <SelectItem value="-1">Yesterday</SelectItem>
                                            <SelectItem value="0">Today</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <div className="rounded-md border">
                                        <Calendar mode="single" selected={date} onSelect={setDate} />
                                    </div>
                                </PopoverContent>
                            </Popover>
                            <Button 
                                type="submit" 
                                className="w-full mt-4 bg-[#2CB46D] text-white hover:bg-[#1D9A5E]"
                                disabled={fetchingCandidates}
                            >
                                {fetchingCandidates ? 'Fetching Candidates...' : 'Fetch Candidates'}
                            </Button>
                        </form>
                    </div>

                    {/* analyse card starts here */}
                    <div className={`${styles.table} ${candidates.length === 0 ? 'hidden' : ''}`}>
                        <div className={styles.card_wrapper2}>
                            <form onSubmit={handleSubmit}>
                                <div className='flex flex-col items-start mb-4'>
                                    <h1 className={styles.selector_title}>{selectedJob && jobs.find(job => job.slug === selectedJob)?.name}</h1>
                                    <p className={styles.selector_sub_text}>Set recruitment rules and guidelines for your candidates</p>
                                </div>

                                <Textarea 
                                    placeholder="Type your job description here." 
                                    className="min-h-[200px]"
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                />

                                <Button 
                                    type="button" 
                                    className="w-full mt-4 bg-[#2CB46D] text-white hover:bg-[#1D9A5E]"
                                    disabled={fetchingCandidates || analyzing || jobDescription.length < 20}
                                    onClick={analyzeCandidates}
                                >
                                    {analyzing ? 'Analyzing Resumes...' : 'Analyze Candidates'}
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
                

                <div className={`${styles.table} ${candidates.length === 0 ? 'hidden' : ''}`}>
                    <div className="p-4 border rounded-md">
                        <div>
                            <span className="text-gray-500 mt-1">Number of candidates: {candidates.length}</span>
                        </div>
                            <Table className="mt-4">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Position</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Resume</TableHead>
                                        <TableHead>Created On</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {candidates.map((candidateData) => (
                                        <TableRow key={candidateData.candidate.id}>
                                            <TableCell className="font-medium">
                                                {candidateData.candidate.first_name} {candidateData.candidate.last_name}
                                            </TableCell>
                                            <TableCell>{candidateData.candidate.email}</TableCell>
                                            <TableCell>
                                                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                                    {candidateData.candidate.position}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                                    {candidateData.status.label}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                    onClick={() => window.open(candidateData.candidate.resume.file_link, '_blank')}
                                                >
                                                    <svg
                                                        className="h-4 w-4"
                                                        fill="none"
                                                        height="24"
                                                        stroke="currentColor"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        viewBox="0 0 24 24"
                                                        width="24"
                                                    >
                                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                        <polyline points="7 10 12 15 17 10" />
                                                        <line x1="12" x2="12" y1="15" y2="3" />
                                                    </svg>
                                                    <span className="sr-only">Download Resume</span>
                                                </Button>
                                            </TableCell>
                                            <TableCell>{format(new Date(candidateData.candidate.created_on), 'PPP')}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                </div>
            </div>

            
        </div>
    )
}