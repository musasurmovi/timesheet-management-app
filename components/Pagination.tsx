"use client"
import React from 'react'

type PaginationProps = Readonly<{
  currentPage: number
  totalPages: number
  onPreviousPage: () => void
  onNextPage: () => void
  itemsPerPage: number
  totalItems: number
  onItemsPerPageChange?: (value: number) => void
}>

export default function Pagination({
  currentPage,
  totalPages,
  onPreviousPage,
  onNextPage,
  itemsPerPage,
  totalItems,
  onItemsPerPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-gray-200 rounded-b p-3 md:p-0">
      <div className="flex items-center gap-3">
        <select
          aria-label="Items per page"
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange?.(Number(e.target.value))}
          className="border rounded px-3 py-2 text-sm text-gray-700 bg-gray-50"
        >
          <option value={5}>5 per page</option>
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
        </select>
      </div>

      <div className="flex flex-col gap-2 md:flex-row md:gap-2">
        <button
          onClick={onPreviousPage}
          disabled={currentPage === 1}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        <div className="flex items-center justify-center gap-2 px-3 py-2">
          <span className="text-sm text-gray-700">
            Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
          </span>
        </div>

        <button
          onClick={onNextPage}
          disabled={currentPage === totalPages}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  )
}
