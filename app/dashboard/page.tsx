"use client"
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import TimesheetTable from '../../components/TimesheetTable'
import TimesheetModal from '../../components/TimesheetModal'
import DateRangePicker from '../../components/DateRangePicker'
import Pagination from '../../components/Pagination'
import { useSession } from 'next-auth/react'

export default function DashboardPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [timesheets, setTimesheets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  useEffect(() => {
    if (!session) return router.replace('/')
    fetchTimesheets()
  }, [session])

  async function fetchTimesheets() {
    setLoading(true)
    try {
      const res = await fetch('/api/weekly-timesheets')
      const data = await res.json()
      setTimesheets(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function handleEdit(item: any) {
    // Redirect to view page for edit
    router.push(`/timesheets/view/${item.id}`)
  }

  function handleCreate(item: any) {
    // Redirect to view page to create tasks for this week
    router.push(`/timesheets/view/${item.id}`)
  }

  function handleView(id: string) {
    router.push(`/timesheets/view/${id}`)
  }

  // derived options for date range dropdown removed

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

  const filtered = timesheets.filter((t) => {
    // Filter by date range: check if week overlaps with selected range
    if (startDate || endDate) {
      const weekStart = new Date(t.startDate)
      const weekEnd = new Date(t.endDate)
      const filterStart = startDate ? new Date(startDate) : new Date('1900-01-01')
      const filterEnd = endDate ? new Date(endDate) : new Date('2099-12-31')
      // Check if week overlaps with filter range
      if (weekEnd < filterStart || weekStart > filterEnd) return false
    }
    if (statusFilter) {
      const mapped = mapStatus(t.status)
      if (mapped !== statusFilter) return false
    }
    return true
  })

  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const startIdx = (currentPage - 1) * itemsPerPage
  const paginatedItems = filtered.slice(startIdx, startIdx + itemsPerPage)

  // Reset to page 1 when filters change or items per page changes
  useEffect(() => {
    setCurrentPage(1)
  }, [startDate, endDate, statusFilter, itemsPerPage])

  function mapStatus(s: string) {
    if (!s) return 'Incompleted'
    if (s === 'Completed') return 'Completed'
    if (s === 'Missing') return 'Missing'
    return 'Incompleted'
  }

  return (
    <div className="max-w-6xl mx-auto w-full p-8 bg-white shadow-sm rounded-sm">
      <h2 className="text-2xl font-semibold mb-4">Your Timesheets</h2>

      <div className="flex gap-4 mb-6 items-center">
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />

        <select
          aria-label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded px-3 py-2 text-gray-500"
        >
          <option value="">Status</option>
          <option value="Completed">Completed</option>
          <option value="Incompleted">Incompleted</option>
          <option value="Missing">Missing</option>
        </select>
      </div>

      <div className="bg-white rounded shadow overflow-auto">
        <TimesheetTable
          items={paginatedItems}
          loading={loading}
          onEdit={handleEdit}
          onCreate={handleCreate}
          onView={handleView}
        />
      </div>

      <div className="mt-6">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPreviousPage={() => setCurrentPage((p) => Math.max(1, p - 1))}
          onNextPage={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          itemsPerPage={itemsPerPage}
          totalItems={filtered.length}
          onItemsPerPageChange={(value) => setItemsPerPage(value)}
        />
      </div>

      {modalOpen && (
        <TimesheetModal
          initial={editing}
          onClose={() => setModalOpen(false)}
          onSave={async (payload: any) => {
            const method = payload.id ? 'PUT' : 'POST'
            await fetch('/api/timesheets', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
            setModalOpen(false)
            fetchTimesheets()
          }}
        />
      )}
    </div>
  )
}
