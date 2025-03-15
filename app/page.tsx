"use client"

import Navbar from "@/components/navbar";
import { Bar, BarChart } from "recharts"

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { RocketLaunchIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

// const chartData = [
//     { month: "January", desktop: 186, mobile: 80 },
//     { month: "February", desktop: 305, mobile: 200 },
//     { month: "March", desktop: 237, mobile: 120 },
//     { month: "April", desktop: 73, mobile: 190 },
//     { month: "May", desktop: 209, mobile: 130 },
//     { month: "June", desktop: 214, mobile: 140 },
// ]

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

// const chartConfig = {
//     desktop: {
//         label: "Desktop",
//         color: "hsl(var(--chart-1))",
//     },
//     mobile: {
//         label: "Mobile",
//         color: "hsl(var(--chart-2))",
//     },
// } satisfies ChartConfig

export default function ExtractPdfText() {
    // Add state to track the hovered bar index
    const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
    const [displayValue, setDisplayValue] = useState<number>(0);
    const [displayDate, setDisplayDate] = useState<string>("");

    // Find the highest value in the chart data
    useEffect(() => {
        const highestValueItem = chartData.reduce((prev, current) => 
            (prev.desktop > current.desktop) ? prev : current
        );
        setDisplayValue(highestValueItem.desktop);
        setDisplayDate(highestValueItem.date);
    }, []);

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
            <div className="master_wrapper bg-[#171717] h-screen w-full">
                <Navbar />

                <div className="dashbaord p-8">
                    <div className="org_wrapper flex flex-row items-end">
                        <h1 className="text-[#FAFAFA] text-3xl mr-2">Humanx</h1>
                        <span className="text-white text-xs text-[#B4B4B4] pb-1">Overall stats of the hiring pipeline</span>
                    </div>

                    <div className="metrics_warapper flex flex-row gap-4 mt-6">
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
                                    className="aspect-auto h-[250px] w-full"
                                >
                                    <BarChart
                                        accessibilityLayer
                                        data={chartData}
                                        margin={{
                                            left: 0,
                                            right: 0,
                                        }}
                                        barSize={24}
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
                        </div>

                        <div className="productivity_wrapper bg-[#1F1F1F] rounded-md p-4 border border-[#2E2E2E] w-1/4">
                            <div className="card_title flex flex-row items-center">
                                <div className="icon_wrapper bg-[#272727] rounded-md p-2 mr-2">
                                    <RocketLaunchIcon className="size-5 text-[#969696]" />
                                </div>

                                <span className="text-[#CECECE] text-lg">Credits</span>
                            </div>

                            <div className="quantify_value flex flex-col items-start mt-4">
                                <span className="text-[#B4B4B4] text-md">We saved your</span>
                                <span className="text-[#FAFAFA] text-lg">10 hours</span>
                            </div>
                        </div>


                    </div>

                </div>
            </div>


        </>
    );
}

