"use client"
import React from 'react'
import { usePathname } from 'next/navigation'

export default function Footer() {
  const pathname = usePathname()
  // hide footer on login page (/)
  if (pathname === "/") return null

  const year = new Date().getFullYear()

  return (
    <footer >
      <div className="max-w-6xl mx-auto w-full p-8 bg-white border-b shadow-sm">
        <div className="text-center text-sm   text-gray-400">
          <span className="font-normal ">©</span>
          <span className="mx-0.5"></span>
          <span>{year}</span>
          <span className="mx-0.5"> </span>
          <span>tentwenty, All rights reserved</span>
        </div>
      </div>
    </footer>
  )
}
