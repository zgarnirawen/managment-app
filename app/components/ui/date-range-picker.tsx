"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

import { cn } from "@/app/lib/utils"
import { Button } from "@/app/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover"

interface DateRange {
  from?: Date
  to?: Date
}

interface DateRangePickerProps {
  className?: string
  date?: DateRange
  onDateChange?: (date: DateRange | undefined) => void
  placeholder?: string
}

export function DateRangePicker({
  className,
  date,
  onDateChange,
  placeholder = "Pick a date range"
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm font-medium">From</label>
                <input
                  type="date"
                  className="w-full p-2 border rounded"
                  value={date?.from ? format(date.from, "yyyy-MM-dd") : ""}
                  onChange={(e) => {
                    const newDate = e.target.value ? new Date(e.target.value) : undefined
                    onDateChange?.({
                      from: newDate,
                      to: date?.to
                    })
                  }}
                />
              </div>
              <div>
                <label className="text-sm font-medium">To</label>
                <input
                  type="date"
                  className="w-full p-2 border rounded"
                  value={date?.to ? format(date.to, "yyyy-MM-dd") : ""}
                  onChange={(e) => {
                    const newDate = e.target.value ? new Date(e.target.value) : undefined
                    onDateChange?.({
                      from: date?.from,
                      to: newDate
                    })
                  }}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                onClick={() => {
                  const today = new Date()
                  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
                  onDateChange?.({ from: weekAgo, to: today })
                }}
              >
                Last 7 days
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  const today = new Date()
                  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
                  onDateChange?.({ from: monthAgo, to: today })
                }}
              >
                Last 30 days
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

// Export alias for compatibility
export { DateRangePicker as DatePickerWithRange }
