"use client"
import React from 'react'
import Link from 'next/link'

type Props = Readonly<{
  items: any[]
  loading?: boolean
  onEdit?: (t: any) => void
  onCreate?: (t: any) => void
  onView?: (id: string) => void
}>

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

function mapStatus(raw: string) {
  if (!raw) return 'Incompleted'
  if (raw === 'Completed') return 'Completed'
  if (raw === 'Missing') return 'Missing'
  return 'Incompleted'
}

export default function TimesheetTable({ items, loading, onEdit, onCreate, onView }: Props) {
  if (loading) return <div className="p-6 text-center">Loading...</div>
  if (!items || items.length === 0) return <div className="p-6 text-center text-gray-600">No timesheets found.</div>

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-gray-200  ">
            <th className="bg-gray-50 px-2 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider min-w-14">Week #</th>
            <th className="  bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Date</th>
            <th className="bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
            <th className="bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody>
          {items.map((t, idx) => {
            const mapped = mapStatus(t.status)
            const badgeBase = 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium'
            let badge = <span className={badgeBase + ' bg-gray-100 text-gray-800'}>{mapped}</span>
            if (mapped === 'Completed') badge = <span className={badgeBase + ' bg-green-100 text-green-800'}>{mapped}</span>
            if (mapped === 'Incompleted') badge = <span className={badgeBase + ' bg-yellow-100 text-yellow-800'}>{mapped}</span>
            if (mapped === 'Missing') badge = <span className={badgeBase + ' bg-red-100 text-red-800'}>{mapped}</span>

            return (
              <tr key={t.id || idx} className="border-b border-gray-200">
                <td className="bg-gray-50 px-2 py-2 whitespace-nowrap min-w-14 text-sm">{t.week}</td>
                <td className="bg-white px-6 py-2 whitespace-nowrap text-gray-500 text-sm">{formatRange(t.startDate, t.endDate)}</td>
                <td className="bg-white px-6 py-2 whitespace-nowrap">{badge}</td>
                <td className="bg-white px-6 py-2 whitespace-nowrap text-sm">
                  {mapped === 'Completed' && (
                    <Link href={`/timesheets/view/${t.id}`} className="text-blue-600">View</Link>
                  )}
                  {mapped === 'Incompleted' && (
                    <button onClick={() => onEdit?.({ id: t.id })} className="text-blue-600">Update</button>
                  )}
                  {mapped === 'Missing' && (
                    <button onClick={() => onCreate?.({ id: t.id })} className="text-blue-600">Create</button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
