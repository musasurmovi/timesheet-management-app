"use client"
import React, { useState } from 'react'
import { Timesheet } from '../types'

type Props = Readonly<{
  initial: Timesheet | null
  onClose: () => void
  onSave: (payload: Partial<Timesheet>) => void
}>

export default function TimesheetModal({ initial, onClose, onSave }: Props) {
  const [week, setWeek] = useState<number>(initial?.week ?? 1)
  const [date, setDate] = useState<string>(initial?.date ?? '')
  const [status, setStatus] = useState<Timesheet['status']>(initial?.status ?? 'Draft')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!date) return setError('Date is required')
    onSave({ id: initial?.id, week, date, status })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-medium">{initial ? 'Edit' : 'Add'} Timesheet</h3>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="week" className="block text-sm font-medium text-gray-700">Week #</label>
              <input id="week" type="number" value={week} onChange={(e) => setWeek(Number(e.target.value))} min={1} className="mt-1 w-full rounded border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
              <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 w-full rounded border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
              <select id="status" value={status} onChange={(e) => setStatus(e.target.value as Timesheet['status'])} className="mt-1 w-full rounded border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option>Draft</option>
                <option>Submitted</option>
                <option>Approved</option>
                <option>Rejected</option>
              </select>
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}
            <div className="flex justify-end space-x-3">
              <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md text-sm">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm">Save</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
