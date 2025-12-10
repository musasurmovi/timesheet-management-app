import React from 'react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-gray-50">
      <main className="pt-8 pb-3">{children}</main>
    </div>
  )
}
