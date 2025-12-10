"use client"
import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

type Entry = {
  id: string
  timesheetId: string
  date: string
  project: string
  hours: number
  workType?: string
  description?: string
  notes?: string
}

export default function ViewTimesheetPage({ params }: { params: any }) {
  const resolvedParams = React.use(params as any)
  const timesheetId = resolvedParams?.id
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [weekInfo, setWeekInfo] = useState<any | null>(null)
  const [editing, setEditing] = useState<Entry | null>(null)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [creatingFor, setCreatingFor] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) fetchData()
  }, [timesheetId, mounted])

  async function fetchData() {
    setLoading(true)
    try {
      const [resEntries, resWeeks] = await Promise.all([
        fetch(`/api/timesheet-entries?timesheetId=${encodeURIComponent(timesheetId)}`),
        fetch('/api/weekly-timesheets')
      ])
      const entriesJson = await resEntries.json()
      const weeksJson = await resWeeks.json()
      setEntries(entriesJson || [])
      const w = weeksJson.find((x: any) => x.id === timesheetId)
      setWeekInfo(w || null)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function formatRange(start: string, end: string) {
    try {
      const d1 = new Date(start)
      const d2 = new Date(end)
      const month = d2.toLocaleString('en', { month: 'long' })
      return `${d1.getDate()} - ${d2.getDate()} ${month}, ${d2.getFullYear()}`
    } catch (e) {
      return `${start} - ${end}`
    }
  }

  function formatDay(dateStr: string) {
    try {
      const d = new Date(dateStr)
      const month = d.toLocaleString('en', { month: 'short' })
      return `${month} ${d.getDate()}`
    } catch (e) {
      return dateStr
    }
  }

  function getWeekDates() {
    if (!weekInfo) return []
    try {
      const start = new Date(weekInfo.startDate)
      const dates = []
      for (let i = 0; i < 5; i++) {
        const date = new Date(start)
        date.setDate(date.getDate() + i)
        dates.push(date.toISOString().split('T')[0])
      }
      return dates
    } catch (e) {
      return []
    }
  }

  const grouped: Record<string, Entry[]> = entries.reduce((acc: any, cur) => {
    acc[cur.date] = acc[cur.date] || []
    acc[cur.date].push(cur)
    return acc
  }, {})

  async function handleDelete(id: string) {
    if (!confirm('Delete this task?')) return
    
    // Get the task to be deleted to get its hours
    const taskToDelete = entries.find(e => e.id === id)
    if (!taskToDelete) return

    await fetch(`/api/timesheet-entries?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
    
    // Recalculate week total
    let weekTotal = 0
    Object.keys(grouped).forEach(date => {
      const dayEntries = grouped[date]
      dayEntries.forEach(e => {
        if (e.id !== id) weekTotal += e.hours
      })
    })

    // Update week total
    if (weekInfo) {
      await fetch('/api/weekly-timesheets', { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ id: timesheetId, totalHours: weekTotal })
      })
    }

    fetchData()
  }

  function openEdit(e: Entry) {
    setEditing(e)
    setMenuOpen(null)
  }

  function closeEdit() {
    setEditing(null)
    setCreatingFor(null)
  }

  async function saveEdit(payload: Partial<Entry> & { id: string }) {
    await fetch('/api/timesheet-entries', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    closeEdit()
    fetchData()
  }

  function handleAddTask(date: string) {
    setEditing({ id: '', timesheetId, date, project: '', hours: 0, workType: '', description: '' } as Entry)
    setCreatingFor(date)
    setMenuOpen(null)
  }

  async function handleSaveEntry(payload: Partial<Entry>) {
    // Calculate total hours for the date
    const dateEntries = grouped[payload.date || ''] || []
    let dateTotal = dateEntries.reduce((sum, e) => {
      if (e.id !== payload.id) sum += e.hours // Exclude current task being edited
      return sum
    }, 0)
    dateTotal += payload.hours || 0

    // Check if total exceeds 8 hours
    if (dateTotal > 8) {
      return // Silently prevent save if exceeds 8 hours
    }

    // Calculate new week total
    let weekTotal = 0
    Object.keys(grouped).forEach(date => {
      const dayEntries = grouped[date]
      dayEntries.forEach(e => {
        if (e.id !== payload.id) weekTotal += e.hours
      })
    })
    weekTotal += payload.hours || 0

    if (payload.id && payload.id !== '') {
      // Update existing
      await fetch('/api/timesheet-entries', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    } else {
      // Create new - generate an ID to avoid duplicates
      const newPayload = { ...payload, id: `entry-${Date.now()}`, timesheetId }
      await fetch('/api/timesheet-entries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newPayload) })
    }

    // Update week total
    if (weekInfo) {
      await fetch('/api/weekly-timesheets', { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ id: timesheetId, totalHours: weekTotal })
      })
    }

    closeEdit()
    fetchData()
  }

  if (loading || !mounted) return <div className="p-6">Loading...</div>

  return (
    <div className="max-w-6xl mx-auto w-full p-8 mt-8 mb-3 bg-white shadow-sm rounded-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold">This week timesheet</h2>
          <div className="text-sm text-gray-600">{weekInfo ? formatRange(weekInfo.startDate, weekInfo.endDate) : ''}</div>
        </div>
        
        {weekInfo && (
          <div className="flex flex-col items-end gap-2">
            <span className="text-sm font-semibold text-gray-700">{weekInfo.totalHours}/40 hrs</span>
            <div className="w-64 h-1 bg-gray-200 rounded overflow-hidden">
              <div 
                className="h-full bg-orange-500 transition-all"
                style={{ width: `${Math.min((weekInfo.totalHours / 40) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded shadow">
        <div className="divide-y">
          {getWeekDates().map((date) => {
            const tasks = grouped[date] || []
            const dailyTotal = tasks.reduce((sum, task) => sum + task.hours, 0)
            const canAddMore = dailyTotal < 8
            return (
              <div key={date} className="grid grid-cols-12 gap-4 p-4 items-start">
                <div className="col-span-2 text-sm font-medium">{formatDay(date)}</div>
                <div className="col-span-10">
                  {tasks.length === 0 ? (
                    canAddMore ? (
                      <button
                        onClick={() => handleAddTask(date)}
                        className="w-full py-2 text-sm text-blue-600 bg-white border border-gray-300 rounded hover:bg-blue-100"
                      >
                        + Add Task
                      </button>
                    ) : (
                      <div className="w-full py-2 text-sm text-gray-500 bg-gray-50 border border-gray-300 rounded text-center">
                        Daily limit reached (8 hours)
                      </div>
                    )
                  ) : (
                    <div className="space-y-3">
                      {tasks.map((task, idx) => {
                        const uniqueKey = `${task.date}-${task.id}-${idx}`
                        return (
                        <div key={task.id || `new-${idx}`} className="flex items-center justify-between bg-white px-3 py-2 border rounded relative">
                          <div>
                            <div className="flex flex-col gap-1">
                              <span className="text-sm font-medium">{task.description || 'No description'}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">{task.hours} hrs</span>
                            <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">{task.project}</span>
                            <div className="relative">
                              <button 
                                onClick={() => setMenuOpen(menuOpen === uniqueKey ? null : uniqueKey)} 
                                aria-label="Actions" 
                                className="px-1 py-0.5 text-xs flex items-center justify-center hover:bg-gray-100 rounded"
                              >
                                <span className='text-gray-900 text-lg'>...</span>
                              </button>
                              {menuOpen === uniqueKey && (
                                <div className="absolute right-0 top-full mt-1 w-32 bg-white border rounded shadow-lg z-20">
                                  <button 
                                    onClick={() => openEdit(task)} 
                                    className="block w-full text-left px-3 py-2 hover:bg-blue-50 transition-colors"
                                  >
                                    Edit
                                  </button>
                                  <button 
                                    onClick={() => { 
                                      handleDelete(task.id)
                                      setMenuOpen(null)
                                    }} 
                                    className="block w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 transition-colors"
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        )
                      })}
                      {canAddMore ? (
                        <button
                          onClick={() => handleAddTask(date)}
                          className="w-full py-2 text-sm text-blue-600 bg-white border border-gray-300 rounded hover:bg-blue-100"
                        >
                          + Add Task
                        </button>
                      ) : (
                        <div className="w-full py-2 text-sm text-gray-500 bg-gray-50 border border-gray-300 rounded text-center">
                          Daily limit reached (8 hours)
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {editing && (
        <EditModal entry={editing} onClose={closeEdit} onSave={handleSaveEntry} />
      )}
    </div>
  )
}

function EditModal({ entry, onClose, onSave }: Readonly<{ entry: Entry; onClose: () => void; onSave: (p: Partial<Entry>) => Promise<void> }>) {
  const [form, setForm] = useState({ ...entry })
  const [error, setError] = useState('')
  const projects = ['Alpha 12', 'Beta', 'Gamma', 'Delta', 'Epsilon']
  const workTypes = ['Development', 'Testing', 'Design', 'Documentation', 'Review', 'Deployment', 'Meeting', 'Support']

  const handleSave = async () => {
    if (!form.project) {
      setError('Please select a project')
      return
    }
    if (!form.description) {
      setError('Please enter a task description')
      return
    }
    if (form.hours === 0) {
      setError('Please select hours')
      return
    }
    setError('')
    await onSave(form)
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" onClick={onClose}>
      <div className="absolute inset-0 bg-black opacity-40"></div>
      <div className="bg-white rounded shadow p-6 z-10 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-medium mb-4">{entry.id ? 'Edit' : 'Add'} Task</h3>
        
        {error && <div className="mb-3 p-2 bg-red-100 text-red-700 rounded text-sm">{error}</div>}
        
        <label htmlFor="project" className="block text-sm font-medium mb-1">Project</label>
        <select
          id="project"
          className="w-full border rounded px-2 py-2 mb-3"
          value={form.project}
          onChange={(e) => setForm({ ...form, project: e.target.value })}
        >
          <option value="">Select a project</option>
          {projects.map((proj) => (
            <option key={proj} value={proj}>{proj}</option>
          ))}
        </select>

        <label htmlFor="workType" className="block text-sm font-medium mb-1">Type of Work</label>
        <select
          id="workType"
          className="w-full border rounded px-2 py-2 mb-3"
          value={form.workType || ''}
          onChange={(e) => setForm({ ...form, workType: e.target.value })}
        >
          <option value="">Select type of work</option>
          {workTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        <label htmlFor="description" className="block text-sm font-medium mb-1">Task Description</label>
        <textarea
          id="description"
          className="w-full border rounded px-2 py-2 mb-3 resize-none"
          rows={3}
          placeholder="Enter task description"
          value={form.description || ''}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <label className="block text-sm font-medium mb-2">Hours</label>
        <div className="flex items-center gap-0 mb-4">
          <button
            type="button"
            onClick={() => {
              const options = [1, 2, 4, 8]
              const currentIndex = options.indexOf(form.hours)
              if (currentIndex > 0) {
                setForm({ ...form, hours: options[currentIndex - 1] })
              }
            }}
            className="px-3 py-2 border border-gray-300 rounded-l hover:bg-gray-50 text-lg"
          >
            −
          </button>
          
          <div className="px-4 py-2 border-t border-b border-gray-300 bg-gray-50 text-center min-w-12">
            <span className="text-lg font-semibold">{form.hours}</span>
          </div>

          <button
            type="button"
            onClick={() => {
              const options = [1, 2, 4, 8]
              const currentIndex = options.indexOf(form.hours)
              if (currentIndex < options.length - 1) {
                setForm({ ...form, hours: options[currentIndex + 1] })
              }
            }}
            className="px-3 py-2 border border-gray-300 rounded-r hover:bg-gray-50 text-lg"
          >
            +
          </button>
        </div>

        <div className="flex justify-end gap-3">
          <button className="px-4 py-2 border rounded hover:bg-gray-50" onClick={onClose}>Cancel</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  )
}
