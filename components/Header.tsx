"use client"
import React, { useEffect, useState, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

export default function Header() {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // close dropdown when clicking outside
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [])

  // Hide header on login page
  if (pathname === '/') {
    return null
  }

  // During initial hydration avoid rendering session-dependent UI
  // to prevent server/client markup mismatch.
  const userName = mounted ? session?.user?.name : undefined

  async function handleSignOut() {
    try {
      await signOut({ redirect: false })
    } finally {
      router.push('/')
    }
  }

  return (
    <header className="bg-white border-b">
      <div className=" w-full flex items-center justify-between p-4">
        <div className="flex gap-6 items-center">
              <div className="text-lg font-semibold text-gray-800">ticktock</div>
              <div className="text-sm text-gray-500">Timesheets</div>
        </div>

        <div className="flex items-center space-x-4">
          {userName ? (
            <div className="relative" ref={ref}>
              <button
                type="button"
                onClick={() => setOpen((s) => !s)}
                className="inline-flex items-center px-3 py-1 rounded text-sm bg-white"
                aria-expanded={open}
                aria-haspopup="menu"
              >
                <span className="text-sm text-gray-700 max-w-[12rem] truncate">{userName}</span>
                <svg className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                </svg>
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-44 bg-white border rounded shadow z-50">
                  <button
                    onClick={() => {
                      setOpen(false)
                      handleSignOut()
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/" className="text-sm text-blue-600">Sign in</Link>
          )}
        </div>
      </div>
    </header>
  )
}
