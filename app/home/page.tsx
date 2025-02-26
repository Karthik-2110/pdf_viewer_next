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
  

interface Job {
    slug: string;
    name: string;
    updated_on: string;
}

export default function home () {
    const [date, setDate] = React.useState<Date>()
    const [jobs, setJobs] = React.useState<Job[]>([])
    const [loading, setLoading] = React.useState(false)
    const [selectedJob, setSelectedJob] = React.useState<string>('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        console.log({
            selectedJob,
            date: date ? format(date, 'yyyy-MM-dd') : null
        })
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

            <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
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
                        <Button type="submit" className="w-full mt-4 bg-[#2CB46D] text-white hover:bg-[#1D9A5E]">Fetch Candidates</Button>
                    </form>
                </div>
            </div>
        </div>
    )
}