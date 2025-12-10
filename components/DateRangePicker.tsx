"use client"
import React, { useState, useRef, useEffect } from 'react'

type Props = Readonly<{
  startDate: string
  endDate: string
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
}>

export default function DateRangePicker({ startDate, endDate, onStartDateChange, onEndDateChange }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selecting, setSelecting] = useState<'start' | 'end'>('start')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  function getDaysInMonth(date: Date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  function getFirstDayOfMonth(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  function handleDateClick(day: number) {
    const selected = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const dateStr = selected.toISOString().split('T')[0]

    if (selecting === 'start') {
      onStartDateChange(dateStr)
      setSelecting('end')
    } else {
      if (startDate && dateStr < startDate) {
        // If end date is before start date, swap them
        onEndDateChange(startDate)
        onStartDateChange(dateStr)
        setSelecting('start')
      } else {
        onEndDateChange(dateStr)
        // Keep calendar open for user to potentially adjust or clear
        // setIsOpen(false)
      }
    }
  }

  function handlePrevMonth() {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  function handleNextMonth() {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const daysInMonth = getDaysInMonth(currentMonth)
  const firstDay = getFirstDayOfMonth(currentMonth)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i)

  const monthYear = currentMonth.toLocaleString('en', { month: 'long', year: 'numeric' })

  const displayStart = startDate ? new Date(startDate).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' }) : ''
  const displayEnd = endDate ? new Date(endDate).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' }) : ''
  const displayText = startDate && endDate ? `${displayStart} - ${displayEnd}` : 'Date range'

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="border rounded px-3 py-2 text-sm bg-white flex items-center gap-2"
      >
        <span className={startDate && endDate ? "text-gray-700" : "text-gray-500"}>{displayText}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white border rounded shadow-lg p-4 z-50 w-72">
          <div className="flex items-center justify-between mb-4">
            <button onClick={handlePrevMonth} className="text-gray-600 text-lg">‹</button>
            <h3 className="text-sm font-semibold text-gray-800">{monthYear}</h3>
            <button onClick={handleNextMonth} className="text-gray-600 text-lg">›</button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-3">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-xs font-semibold text-gray-500">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {emptyDays.map((i) => (
              <div key={`empty-${i}`}></div>
            ))}
            {days.map((day) => {
              const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
              const dateStr = date.toISOString().split('T')[0]
              const isStart = dateStr === startDate
              const isEnd = dateStr === endDate
              const isInRange = startDate && endDate && dateStr >= startDate && dateStr <= endDate
              const isSelecting = selecting === 'start' ? 'start-date' : 'end-date'

              return (
                <button
                  key={day}
                  onClick={() => handleDateClick(day)}
                  className={`
                    text-xs p-2 rounded text-center
                    ${isStart ? 'bg-blue-600 text-white font-semibold' : ''}
                    ${isEnd ? 'bg-blue-600 text-white font-semibold' : ''}
                    ${isInRange && !isStart && !isEnd ? 'bg-blue-100' : ''}
                    ${!isStart && !isEnd && !isInRange ? 'text-gray-800 hover:bg-gray-100' : ''}
                  `}
                >
                  {day}
                </button>
              )
            })}
          </div>

          <div className="mt-4 text-xs text-gray-600 text-center">
            {selecting === 'start' ? 'Select start date' : 'Select end date'}
          </div>

          {(startDate || endDate) && (
            <button
              onClick={() => {
                onStartDateChange('')
                onEndDateChange('')
                setSelecting('start')
              }}
              className="w-full mt-3 px-3 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors font-medium"
            >
              Clear Range
            </button>
          )}

          <button
            onClick={() => setIsOpen(false)}
            className="w-full mt-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            Done
          </button>
        </div>
      )}
    </div>
  )
}
