"use client"

import * as React from "react"
import { addDays, format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function DatePickerWithRange({
  className,
  onDateRangeChange,
}: React.HTMLAttributes<HTMLDivElement> & { 
  onDateRangeChange?: (dateRange: DateRange | undefined) => void 
}) {
  // Get today's date
  const today = new Date()
  // Set initial date to current date (without time)
  const currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  
  // Initialize with undefined to keep fields empty by default
  const [date, setDate] = React.useState<DateRange | undefined>(undefined)

  const handleDateSelect = (selectedDate: DateRange | undefined) => {
    setDate(selectedDate)
    if (onDateRangeChange) {
      onDateRangeChange(selectedDate)
    }
  }

  // Function to disable future dates
  const disabledDays = { after: today }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full h-10 justify-start text-left font-normal bg-[#1F1F1F] border-[#2E2E2E] text-[#CECECE] rounded-md hover:border-[#2CB46D] focus:border-[#2CB46D] focus:ring-[#2CB46D] hover:bg-[#1F1F1F] hover:text-[#CECECE]",
              !date && "text-[#8A8A8A]"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-[#CECECE]" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "MMM dd, yyyy")} -{" "}
                  {format(date.to, "MMM dd, yyyy")}
                </>
              ) : (
                format(date.from, "MMM dd, yyyy")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-[#171717] border border-[#2E2E2E] rounded-md shadow-lg" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={currentDate}
            selected={date}
            onSelect={handleDateSelect}
            numberOfMonths={2}
            disabled={disabledDays}
            className="bg-[#171717]"
            fromDate={undefined}
            toDate={today}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
} 