"use client"

import Navbar from "@/components/navbar";
import { Bar, BarChart } from "recharts"

import { CartesianGrid, XAxis } from "recharts"
import {
    ChartConfig,
    ChartContainer
} from "@/components/ui/chart"
import { RocketLaunchIcon } from "@heroicons/react/24/outline";
import { useEffect, useState, useRef } from "react";
import { SessionProvider, useSession } from "next-auth/react"
// import { getOrganizationData } from "../actions";

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

const chartData = [
    { date: "2024-04-01", desktop: 222 },
    { date: "2024-04-02", desktop: 97 },
    { date: "2024-04-03", desktop: 167 },
    { date: "2024-04-04", desktop: 242 },
    { date: "2024-04-05", desktop: 373 },
    { date: "2024-04-06", desktop: 301 },
]

const chartConfig = {
    views: {
        label: "Page Views",
    },
    desktop: {
        label: "Desktop",
        color: "hsl(var(--chart-1))",
    },
    mobile: {
        label: "Mobile",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig


export default function Dashboard() {
    // Add state to track the hovered bar index
    const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
    const [displayValue, setDisplayValue] = useState<number>(0);
    const [displayDate, setDisplayDate] = useState<string>("");
    const [orgName, setOrgName] = useState<string>("Organization");
    const [credits, setCredits] = useState<number | string>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const { data: session } = useSession();
    
    // Analysis states
    const [isAnalysisInProgress, setIsAnalysisInProgress] = useState<boolean>(false);
    const [analysisResults, setAnalysisResults] = useState<any>(null);
    const [candidatesAnalyzed, setCandidatesAnalyzed] = useState<number>(0);
    const [totalCandidatesForAnalysis, setTotalCandidatesForAnalysis] = useState<number>(0);
    
    // Summary tooltip states
    const [activeSummary, setActiveSummary] = useState<{summary: string, candidateName: string} | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const summaryRef = useRef<HTMLDivElement>(null);
    
    // Handle tooltip display
    const showSummary = (summary: string, candidateName: string, event: React.MouseEvent) => {
        setActiveSummary({
            summary,
            candidateName
        });
        
        // Calculate tooltip position
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const tooltipWidth = 380;
        const tooltipHeight = 300; // Estimated height
        
        // Position to the right of cursor, but not off screen
        let x = event.clientX + 20;
        let y = event.clientY;
        
        // Adjust if too close to right edge
        if (x + tooltipWidth > viewportWidth - 20) {
            x = event.clientX - tooltipWidth - 10;
        }
        
        // Adjust if too close to bottom edge
        if (y + tooltipHeight/2 > viewportHeight - 20) {
            y = viewportHeight - tooltipHeight/2 - 20;
        }
        
        // Adjust if too close to top edge
        if (y - tooltipHeight/2 < 20) {
            y = tooltipHeight/2 + 20;
        }
        
        setTooltipPosition({ x, y });
    };
    
    const hideSummary = () => {
        setActiveSummary(null);
    };
    
    // Close the tooltip when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (summaryRef.current && !summaryRef.current.contains(event.target as Node)) {
                hideSummary();
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    
    // Handle analysis events
    useEffect(() => {
        const handleAnalysisComplete = (event: any) => {
            const { 
                candidates, 
                jobName, 
                hiringStage, 
                dateRange, 
                totalCandidates, 
                suitableCandidates 
            } = event.detail;
            
            console.log("Analysis complete event received:", event.detail);
            setIsAnalysisInProgress(false);
            setAnalysisResults({
                candidates,
                jobName,
                hiringStage,
                dateRange,
                totalCandidates,
                suitableCandidates,
                completedAt: new Date()
            });
            
            // Reset counter
            setCandidatesAnalyzed(0);
            setTotalCandidatesForAnalysis(0);
            
            // Reset sidebar sheet after analysis
            const resetEvent = new CustomEvent('resetSidebar', {
                detail: { reset: true }
            });
            window.dispatchEvent(resetEvent);
        };
        
        const handleCandidatesFetched = (event: any) => {
            const { count, jobName } = event.detail;
            console.log(`Received candidatesFetched event: ${count} candidates for ${jobName}`);
            setTotalCandidatesForAnalysis(count);
        };
        
        const handleAnalysisStarted = (event: any) => {
            console.log("Analysis started event received");
            setIsAnalysisInProgress(true);
            setAnalysisResults(null);
        };
        
        const handleCandidateAnalyzed = (event: any) => {
            const { index, total } = event.detail;
            setCandidatesAnalyzed(index + 1);
        };
        
        // Listen for the custom events from the navbar component
        window.addEventListener('candidateAnalysisComplete', handleAnalysisComplete);
        window.addEventListener('candidatesFetched', handleCandidatesFetched);
        window.addEventListener('analysisStarted', handleAnalysisStarted);
        window.addEventListener('candidateAnalyzed', handleCandidateAnalyzed);
        
        // Cleanup
        return () => {
            window.removeEventListener('candidateAnalysisComplete', handleAnalysisComplete);
            window.removeEventListener('candidatesFetched', handleCandidatesFetched);
            window.removeEventListener('analysisStarted', handleAnalysisStarted);
            window.removeEventListener('candidateAnalyzed', handleCandidateAnalyzed);
        };
    }, []);
    
    // Format date for display
    const formatDateRange = (dateRange: any) => {
        if (!dateRange || !dateRange.from || !dateRange.to) return "";
        
        const fromDate = new Date(dateRange.from);
        const toDate = new Date(dateRange.to);
        
        return `${fromDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        })} - ${toDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        })}`;
    };
    
    // Log session data for debugging
    useEffect(() => {
        // console.log("Session data:", session);
    }, [session]);

    // Find the highest value in the chart data
    useEffect(() => {
        const highestValueItem = chartData.reduce((prev, current) => 
            (prev.desktop > current.desktop) ? prev : current
        );
        setDisplayValue(highestValueItem.desktop);
        setDisplayDate(highestValueItem.date);
    }, []);

    // Fetch organization data
    // useEffect(() => {
    //     async function fetchOrgData() {
    //         if (session?.user?.email) {
    //             setIsLoading(true);
    //             try {
    //                 const result = await getOrganizationData(session.user.email);
    //                 console.log("Organization data result:", result);
                    
    //                 if (result.success && result.data) {
    //                     setOrgName(result.data.organization.organisation_name || "Organization");
                        
    //                     // Get total_credit from the credits object
    //                     if (result.data.credits && result.data.credits.total_credit) {
    //                         const creditValue = typeof result.data.credits.total_credit === 'string' 
    //                             ? parseInt(result.data.credits.total_credit, 10) 
    //                             : Number(result.data.credits.total_credit);
                                
    //                         console.log("Setting credits to:", creditValue, "Original value:", result.data.credits.total_credit);
    //                         setCredits(isNaN(creditValue) ? 0 : creditValue);
    //                     } else {
    //                         console.log("No credits data found, setting to 0");
    //                         setCredits(0);
    //                     }
    //                 }
    //             } catch (error) {
    //                 console.error("Error fetching organization data:", error);
    //             } finally {
    //                 setIsLoading(false);
    //             }
    //         }
    //     }
        
    //     fetchOrgData();
    // }, [session]);

    // Custom bar component to handle hover state
    const CustomBar = (props: any) => {
        const { x, y, width, height, index, dataKey, payload } = props;
        
        const isHovered = hoveredBarIndex === index;
        const opacity = hoveredBarIndex === null || isHovered ? 1 : 0.3;
        
        return (
            <g>
                <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    fill="#3ECE8E"
                    opacity={opacity}
                    onMouseEnter={() => {
                        setHoveredBarIndex(index);
                        setDisplayValue(payload[dataKey]);
                        setDisplayDate(payload.date);
                    }}
                    onMouseLeave={() => {
                        setHoveredBarIndex(null);
                        // Find highest value again when mouse leaves
                        const highestValueItem = chartData.reduce((prev, current) => 
                            (prev.desktop > current.desktop) ? prev : current
                        );
                        setDisplayValue(highestValueItem.desktop);
                        setDisplayDate(highestValueItem.date);
                    }}
                />
            </g>
        );
    };

    // Format the date for display
    const formatDate = (dateString: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric"
        });
    };

    return (
        <>
            <div className="master_wrapper bg-[#171717] h-screen w-full overflow-y-auto">
                <SessionProvider>
                    <Navbar />
                </SessionProvider>

                <div className="dashbaord p-8">
                    

                    {/* <div className="metrics_warapper flex flex-row gap-4 mt-6">
                        <div className="productivity_wrapper bg-[#1F1F1F] rounded-md p-4 border border-[#2E2E2E] w-1/4">
                            <div className="card_title flex flex-row items-center">
                                <div className="icon_wrapper bg-[#272727] rounded-md p-2 mr-2">
                                    <RocketLaunchIcon className="size-5 text-[#969696]" />
                                </div>

                                <span className="text-[#CECECE] text-lg">Busy days</span>
                            </div>

                            <div className="quantify_value flex flex-col items-start mt-4">
                                <span className="text-[#B4B4B4] text-md">Days with more applicants</span>
                                <span className="text-[#FAFAFA] text-lg">
                                    {displayValue} applicants {displayDate && `(${formatDate(displayDate)})`}
                                </span>
                            </div>

                            <div className="chart_wrapper mt-6">
                                <ChartContainer
                                    config={chartConfig}
                                    className="aspect-auto h-[150px] w-full"
                                >
                                    <BarChart
                                        accessibilityLayer
                                        data={chartData}
                                        margin={{
                                            left: 0,
                                            right: 0,
                                        }}
                                        barSize={10}
                                        style={{ 
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <CartesianGrid vertical={false} horizontal={false} />
                                        <XAxis
                                            dataKey="date"
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                            minTickGap={32}
                                            tickFormatter={(value) => {
                                                const date = new Date(value)
                                                return date.toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                })
                                            }}
                                        />
                                        <Bar 
                                            dataKey="desktop" 
                                            shape={<CustomBar />}
                                        />
                                    </BarChart>
                                </ChartContainer>
                            </div>
                        </div>

                        <div className="productivity_wrapper bg-[#1F1F1F] rounded-md p-4 border border-[#2E2E2E] w-1/4">
                            <div className="card_title flex flex-row items-center">
                                <div className="icon_wrapper bg-[#272727] rounded-md p-2 mr-2">
                                    <RocketLaunchIcon className="size-5 text-[#969696]" />
                                </div>

                                <span className="text-[#CECECE] text-lg">Conversion rate</span>
                            </div>

                            <div className="quantify_value flex flex-col items-start mt-4">
                                <span className="text-[#B4B4B4] text-md">We saved your</span>
                                <span className="text-[#FAFAFA] text-lg">10 hours</span>
                            </div>

                            <div className="chart_wrapper mt-6">
                                <ChartContainer
                                    config={chartConfig}
                                    className="aspect-auto h-[150px] w-full"
                                >
                                    <BarChart
                                        accessibilityLayer
                                        data={chartData}
                                        margin={{
                                            left: 0,
                                            right: 0,
                                        }}
                                        barSize={10}
                                        style={{ 
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <CartesianGrid vertical={false} horizontal={false} />
                                        <XAxis
                                            dataKey="date"
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                            minTickGap={32}
                                            tickFormatter={(value) => {
                                                const date = new Date(value)
                                                return date.toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                })
                                            }}
                                        />
                                        <Bar 
                                            dataKey="desktop" 
                                            shape={<CustomBar />}
                                        />
                                    </BarChart>
                                </ChartContainer>
                            </div>
                        </div>

                        <div className="productivity_wrapper bg-[#1F1F1F] rounded-md p-4 border border-[#2E2E2E] w-1/4">
                            <div className="card_title flex flex-row items-center">
                                <div className="icon_wrapper bg-[#272727] rounded-md p-2 mr-2">
                                    <RocketLaunchIcon className="size-5 text-[#969696]" />
                                </div>

                                <span className="text-[#CECECE] text-lg">Most evaluated roles</span>
                            </div>

                            <div className="quantify_value flex flex-col items-start mt-4">
                                <span className="text-[#B4B4B4] text-md">We saved your</span>
                                <span className="text-[#FAFAFA] text-lg">10 hours</span>
                            </div>

                            <div className="chart_wrapper mt-6">
                                <ChartContainer
                                    config={chartConfig}
                                    className="aspect-auto h-[150px] w-full"
                                >
                                    <BarChart
                                        accessibilityLayer
                                        data={chartData}
                                        margin={{
                                            left: 0,
                                            right: 0,
                                        }}
                                        barSize={10}
                                        style={{ 
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <CartesianGrid vertical={false} horizontal={false} />
                                        <XAxis
                                            dataKey="date"
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                            minTickGap={32}
                                            tickFormatter={(value) => {
                                                const date = new Date(value)
                                                return date.toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                })
                                            }}
                                        />
                                        <Bar 
                                            dataKey="desktop" 
                                            shape={<CustomBar />}
                                        />
                                    </BarChart>
                                </ChartContainer>
                            </div>
                        </div>

                        <div className="productivity_wrapper bg-[#1F1F1F] rounded-md p-4 border border-[#2E2E2E] w-1/4">
                            <div className="card_title flex flex-row items-center">
                                <div className="icon_wrapper bg-[#272727] rounded-md p-2 mr-2">
                                    <RocketLaunchIcon className="size-5 text-[#969696]" />
                                </div>

                                <span className="text-[#CECECE] text-lg">Credits</span>
                            </div>

                            <div className="quantify_value flex flex-col items-start mt-4">
                                <span className="text-[#B4B4B4] text-md">Available credits</span>
                                <span className="text-[#FAFAFA] text-lg">
                                    {isLoading ? "Loading..." : credits} credits
                                </span>
                            </div>
                        </div>


                    </div> */}

                    {/* Empty State Section - Show when no analysis is in progress and no results exist */}
                    {!analysisResults && !isAnalysisInProgress && (
                        <div className="empty-state">
                            <div className="bg-[#1F1F1F] rounded-lg p-8 border border-[#2E2E2E]">
                                <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
                                    <div className="w-20 h-20 rounded-full bg-[#143C2E] flex items-center justify-center mb-6">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2CB46D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="12" cy="7" r="4"></circle>
                                        </svg>
                                    </div>
                                    
                                    <h2 className="text-[#FAFAFA] text-2xl font-semibold mb-4">Streamline Your Candidate Selection Process</h2>
                                    <p className="text-[#CECECE] mb-8">Transform your recruitment workflow with AI-powered candidate analysis that saves time and improves hiring decisions.</p>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-8">
                                        <div className="bg-[#232323] p-6 rounded-lg border border-[#2E2E2E]">
                                            <div className="flex items-center mb-4">
                                                <div className="w-10 h-10 rounded-full bg-[#143C2E] flex items-center justify-center mr-3">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2CB46D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                                                    </svg>
                                                </div>
                                                <h3 className="text-[#FAFAFA] text-lg font-medium">Enhanced Efficiency</h3>
                                            </div>
                                            <p className="text-[#B4B4B4] text-sm ml-13">Reduce screening time by up to 75% with automated candidate evaluation that processes multiple resumes simultaneously.</p>
                                        </div>
                                        
                                        <div className="bg-[#232323] p-6 rounded-lg border border-[#2E2E2E]">
                                            <div className="flex items-center mb-4">
                                                <div className="w-10 h-10 rounded-full bg-[#143C2E] flex items-center justify-center mr-3">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2CB46D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"></path>
                                                        <path d="M8.5 8.5 A 1 1 0 0 1 6 11"></path>
                                                        <path d="M16 7a2 2 0 0 0-4 0v.5a.5.5 0 0 0 1 0V7"></path>
                                                        <path d="M12 18v-2"></path>
                                                    </svg>
                                                </div>
                                                <h3 className="text-[#FAFAFA] text-lg font-medium">Objective Evaluation</h3>
                                            </div>
                                            <p className="text-[#B4B4B4] text-sm ml-13">Eliminate bias with standardized candidate assessments based on job requirements, skills matching, and experience verification.</p>
                                        </div>
                                        
                                        <div className="bg-[#232323] p-6 rounded-lg border border-[#2E2E2E]">
                                            <div className="flex items-center mb-4">
                                                <div className="w-10 h-10 rounded-full bg-[#143C2E] flex items-center justify-center mr-3">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2CB46D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                                                        <line x1="8" y1="21" x2="16" y2="21"></line>
                                                        <line x1="12" y1="17" x2="12" y2="21"></line>
                                                    </svg>
                                                </div>
                                                <h3 className="text-[#FAFAFA] text-lg font-medium">Recruit CRM Integration</h3>
                                            </div>
                                            <p className="text-[#B4B4B4] text-sm ml-13">Seamlessly integrates with your existing Recruit CRM workflow, automatically analyzing candidates from your selected job listings.</p>
                                        </div>
                                        
                                        <div className="bg-[#232323] p-6 rounded-lg border border-[#2E2E2E]">
                                            <div className="flex items-center mb-4">
                                                <div className="w-10 h-10 rounded-full bg-[#143C2E] flex items-center justify-center mr-3">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2CB46D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14Z"></path>
                                                        <path d="M7 22V7.5"></path>
                                                        <path d="M2 14h5"></path>
                                                        <path d="M2 18h5"></path>
                                                    </svg>
                                                </div>
                                                <h3 className="text-[#FAFAFA] text-lg font-medium">AI-Powered Insights</h3>
                                            </div>
                                            <p className="text-[#B4B4B4] text-sm ml-13">Advanced AI evaluates candidate suitability using context-aware analysis of resumes against your specific job requirements.</p>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-[#1A1A1A] p-6 rounded-lg border border-[#2E2E2E] w-full mb-8">
                                        <h3 className="text-[#FAFAFA] text-lg font-medium mb-4">How It Works</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="flex flex-col items-center text-center p-4">
                                                <div className="w-10 h-10 rounded-full bg-[#143C2E] flex items-center justify-center mb-3">
                                                    <span className="text-[#2CB46D] font-semibold">1</span>
                                                </div>
                                                <h4 className="text-[#FAFAFA] font-medium mb-2">Select Job Role</h4>
                                                <p className="text-[#B4B4B4] text-sm">Choose a job listing from your Recruit CRM account to analyze candidates.</p>
                                            </div>
                                            
                                            <div className="flex flex-col items-center text-center p-4">
                                                <div className="w-10 h-10 rounded-full bg-[#143C2E] flex items-center justify-center mb-3">
                                                    <span className="text-[#2CB46D] font-semibold">2</span>
                                                </div>
                                                <h4 className="text-[#FAFAFA] font-medium mb-2">Refine Requirements</h4>
                                                <p className="text-[#B4B4B4] text-sm">Review and enhance the auto-fetched job description to focus on key requirements.</p>
                                            </div>
                                            
                                            <div className="flex flex-col items-center text-center p-4">
                                                <div className="w-10 h-10 rounded-full bg-[#143C2E] flex items-center justify-center mb-3">
                                                    <span className="text-[#2CB46D] font-semibold">3</span>
                                                </div>
                                                <h4 className="text-[#FAFAFA] font-medium mb-2">Get Results</h4>
                                                <p className="text-[#B4B4B4] text-sm">Receive detailed analysis with candidate rankings, suitability scores, and skill matches.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Analysis Results Section */}
                    {analysisResults && (
                        <div className="analysis-results mt-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-[#FAFAFA] text-2xl font-semibold">Analysis Results</h2>
                                <div className="flex items-center gap-2 bg-[#272727] px-3 py-1.5 rounded-full text-[#B4B4B4] text-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <polyline points="12 6 12 12 16 14"></polyline>
                                    </svg>
                                    Completed on {analysisResults.completedAt.toLocaleString()}
                                </div>
                            </div>
                            
                            <div className="bg-[#1F1F1F] rounded-lg p-6 border border-[#2E2E2E]">
                                {/* Analysis Header Section */}
                                <div className="flex items-center justify-between gap-4 mb-8">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-10 h-10 rounded-full bg-[#143C2E] flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2CB46D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                                                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="text-[#FAFAFA] text-xl font-semibold">{analysisResults.jobName}</h3>
                                                {analysisResults.hiringStage && (
                                                    <span className="text-[#8A8A8A] text-sm">{analysisResults.hiringStage} Stage</span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {analysisResults.dateRange && analysisResults.dateRange.from && (
                                            <div className="flex items-center gap-2 text-[#CECECE] text-sm">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                                </svg>
                                                {formatDateRange(analysisResults.dateRange)}
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="flex gap-4">
                                        <div className="flex flex-col items-center justify-center bg-[#272727] px-5 py-3 rounded-lg">
                                            <div className="text-[#8A8A8A] text-xs mb-1">Total Analyzed</div>
                                            <div className="text-[#FAFAFA] text-2xl font-semibold">{analysisResults.totalCandidates}</div>
                                        </div>
                                        
                                        <div className="flex flex-col items-center justify-center bg-[#272727] px-5 py-3 rounded-lg">
                                            <div className="text-[#8A8A8A] text-xs mb-1">Suitable</div>
                                            <div className="flex items-baseline">
                                                <span className="text-[#FAFAFA] text-2xl font-semibold mr-2">{analysisResults.suitableCandidates}</span>
                                                <span className="text-[#3ECE8E] text-sm">
                                                    {Math.round((analysisResults.suitableCandidates / analysisResults.totalCandidates) * 100)}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Bar Section */}
                                <div className="mb-8">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-[#CECECE] text-sm">Candidate Match Rate</span>
                                        <span className="text-[#CECECE] text-sm font-medium">
                                            {Math.round((analysisResults.suitableCandidates / analysisResults.totalCandidates) * 100)}%
                                        </span>
                                    </div>
                                    <div className="w-full h-2 bg-[#272727] rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-[#00623A] to-[#2CB46D]" 
                                            style={{ width: `${Math.round((analysisResults.suitableCandidates / analysisResults.totalCandidates) * 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                                
                                {/* Candidate Results Table */}
                                <div className="mt-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-[#FAFAFA] text-lg font-medium">Candidate Results</h3>
                                        <div className="flex gap-6">
                                            <div className="flex items-center gap-2">
                                                <span className="inline-block w-3 h-3 rounded-full bg-[#2CB46D]"></span>
                                                <span className="text-[#CECECE] text-sm">Suitable</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="inline-block w-3 h-3 rounded-full bg-[#EAAB0F]"></span>
                                                <span className="text-[#CECECE] text-sm">Not Suitable</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-[#1A1A1A] rounded-lg overflow-hidden border border-[#2E2E2E]">
                                        <Table className="w-full">
                                            <TableHeader className="bg-[#232323]">
                                                <TableRow className="border-b border-[#2E2E2E]">
                                                    <TableHead className="text-[#CECECE] font-medium py-4">Candidate</TableHead>
                                                    <TableHead className="text-[#CECECE] font-medium">Match Score</TableHead>
                                                    <TableHead className="text-[#CECECE] font-medium">Status</TableHead>
                                                    <TableHead className="text-[#CECECE] font-medium text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {analysisResults.candidates.map((candidate: any, index: number) => (
                                                    <TableRow 
                                                        key={candidate.id} 
                                                        className={`border-b border-[#2E2E2E] hover:bg-[#232323] ${index % 2 === 0 ? 'bg-[#1F1F1F]' : 'bg-[#1A1A1A]'}`}
                                                    >
                                                        <TableCell className="py-4">
                                                            <div className="flex items-start gap-3">
                                                                {candidate.avatar ? (
                                                                    <img 
                                                                        src={candidate.avatar} 
                                                                        alt={candidate.name} 
                                                                        className="w-10 h-10 rounded-full object-cover border-2 border-[#2E2E2E]"
                                                                    />
                                                                ) : (
                                                                    <div className="w-10 h-10 rounded-full bg-[#272727] flex items-center justify-center text-[#FAFAFA] border-2 border-[#2E2E2E]">
                                                                        {candidate.name.charAt(0).toUpperCase()}
                                                                    </div>
                                                                )}
                                                                <div className="flex flex-col">
                                                                    <span className="font-medium text-[#FAFAFA]">{candidate.name}</span>
                                                                    <span className="text-[#B4B4B4] text-xs">{candidate.email}</span>
                                                                    {candidate.current_organization && (
                                                                        <div className="flex items-center gap-1 mt-1">
                                                                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                                <path d="M10 3H6a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V9L14 3z"></path>
                                                                                <path d="M14 3v6h6"></path>
                                                                            </svg>
                                                                            <span className="text-[#8A8A8A] text-xs">
                                                                                {candidate.current_organization}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            {candidate.resumeAnalysis ? (
                                                                <div>
                                                                   
                                                                    <div>
                                                                        <span className="text-[#FAFAFA] text-sm">
                                                                            {candidate.resumeAnalysis.score}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <span className="text-[#8A8A8A] text-xs">No analysis</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {candidate.resumeAnalysis ? (
                                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                                    candidate.resumeAnalysis.suitable 
                                                                        ? 'bg-[#143C2E] text-[#2CB46D]' 
                                                                        : 'bg-[#3C2E14] text-[#EAAB0F]'
                                                                }`}>
                                                                    {candidate.resumeAnalysis.suitable ? 'Suitable' : 'Not Suitable'}
                                                                </span>
                                                            ) : (
                                                                <span className="text-[#8A8A8A] text-xs">Not analyzed</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex gap-3 justify-end">
                                                                {candidate.resumeLink && (
                                                                    <a 
                                                                        href={candidate.resumeLink} 
                                                                        target="_blank" 
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center gap-1 text-[#CECECE] hover:text-[#2CB46D] text-sm bg-[#272727] px-3 py-1.5 rounded-md transition-colors"
                                                                    >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                                                            <polyline points="14 2 14 8 20 8"></polyline>
                                                                            <line x1="16" y1="13" x2="8" y2="13"></line>
                                                                            <line x1="16" y1="17" x2="8" y2="17"></line>
                                                                            <polyline points="10 9 9 9 8 9"></polyline>
                                                                        </svg>
                                                                        Resume
                                                                    </a>
                                                                )}
                                                                
                                                                {candidate.resumeAnalysis && (
                                                                    <button 
                                                                        className="flex items-center gap-1 text-[#CECECE] hover:text-[#2CB46D] text-sm bg-[#272727] px-3 py-1.5 rounded-md transition-colors relative group"
                                                                        onClick={(event) => showSummary(candidate.resumeAnalysis.summary, candidate.name, event)}
                                                                    >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                                                            <polyline points="14 2 14 8 20 8"></polyline>
                                                                            <line x1="16" y1="13" x2="8" y2="13"></line>
                                                                            <line x1="16" y1="17" x2="8" y2="17"></line>
                                                                            <polyline points="10 9 9 9 8 9"></polyline>
                                                                        </svg>
                                                                        Detailed Summary
                                                                        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-[#232323] text-[#CECECE] px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                                            View detailed candidate assessment
                                                                        </span>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Analysis In Progress Indicator */}
                    {isAnalysisInProgress && (
                        <div className="analysis-progress mt-8">
                            <div className="bg-[#1F1F1F] rounded-lg p-8 border border-[#2E2E2E] flex flex-col items-center justify-center py-16">
                                <div className="relative mb-6">
                                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#2E2E2E] border-t-[#3ECE8E]"></div>
                                    {candidatesAnalyzed > 0 && totalCandidatesForAnalysis > 0 && (
                                        <div className="absolute inset-0 flex items-center justify-center text-[#FAFAFA] font-medium">
                                            {Math.round((candidatesAnalyzed / totalCandidatesForAnalysis) * 100)}%
                                        </div>
                                    )}
                                </div>
                                
                                <h3 className="text-[#FAFAFA] text-xl font-semibold mb-2">Analyzing Candidates</h3>
                                
                                {candidatesAnalyzed > 0 && totalCandidatesForAnalysis > 0 ? (
                                    <>
                                        <p className="text-[#B4B4B4] text-sm mb-4">
                                            Analyzed {candidatesAnalyzed} of {totalCandidatesForAnalysis} candidates
                                        </p>
                                        
                                        <div className="w-full max-w-md h-2 bg-[#272727] rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-gradient-to-r from-[#00623A] to-[#2CB46D]" 
                                                style={{ 
                                                    width: `${Math.round((candidatesAnalyzed / totalCandidatesForAnalysis) * 100)}%` 
                                                }}
                                            ></div>
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-[#B4B4B4] text-sm">
                                        This may take a few moments...
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Summary tooltip */}
            {activeSummary && (
                <div
                    ref={summaryRef}
                    className="fixed z-50 bg-[#232323] border border-[#2E2E2E] rounded-lg shadow-lg max-w-md text-[#CECECE] text-sm leading-relaxed"
                    style={{
                        left: `${tooltipPosition.x}px`,
                        top: `${tooltipPosition.y}px`,
                        transform: 'translateY(-50%)',
                        maxHeight: '500px',
                        width: '420px',
                        overflowY: 'auto'
                    }}
                >
                    <div className="bg-[#1A1A1A] p-4 border-b border-[#2E2E2E] rounded-t-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#143C2E] flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2CB46D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                            </div>
                            <div>
                                <h4 className="text-[#FAFAFA] font-medium">{activeSummary.candidateName}</h4>
                                <div className="text-[#8A8A8A] text-xs">Candidate Assessment</div>
                            </div>
                        </div>
                        <button 
                            onClick={hideSummary}
                            className="text-[#8A8A8A] hover:text-[#FAFAFA] transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                    
                    <div className="p-5">
                        {/* Format the summary with sections */}
                        {activeSummary.summary.split('\n\n').map((paragraph, index) => {
                            // Check if this is a section heading
                            if (paragraph.toUpperCase() === paragraph && paragraph.length < 50) {
                                return (
                                    <h5 key={index} className="text-[#FAFAFA] font-medium mt-4 mb-2 text-sm">
                                        {paragraph}
                                    </h5>
                                );
                            }
                            
                            // Check if contains key metrics or scores
                            if (paragraph.includes('%') || paragraph.includes('score') || paragraph.includes('Rating')) {
                                return (
                                    <div key={index} className="bg-[#1A1A1A] p-3 rounded-md my-2 border-l-2 border-[#2CB46D]">
                                        {paragraph}
                                    </div>
                                );
                            }
                            
                            // Regular paragraph
                            return (
                                <p key={index} className="mb-3 text-sm">
                                    {paragraph}
                                </p>
                            );
                        })}
                    </div>
                </div>
            )}

        </>
    );
}

