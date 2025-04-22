import React from 'react'
import { PaginationProps } from '@/lib/types'

const Pagination: React.FC<PaginationProps> = ({
  showingFrom,
  showingTo,
  totalCount,
  itemsPerPage,
  setItemsPerPage,
  currentPage,
  setCurrentPage,
  totalPages,
}) => {
  return (
    <div className="flex items-center justify-between px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
      <div>
        Showing {showingFrom}–{showingTo} of {totalCount} items
      </div>
      <div className="flex items-center gap-4">
        <select
          value={itemsPerPage}
          onChange={(e) => {
            setItemsPerPage(Number(e.target.value))
            setCurrentPage(1)
          }}
          className="rounded border border-gray-200 bg-transparent px-2 py-1 text-sm"
        >
          <option value={5}>5 / page</option>
          <option value={10}>10 / page</option>
          <option value={20}>20 / page</option>
          <option value={50}>50 / page</option>
        </select>
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
          className="rounded border border-gray-200 px-2 py-1 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => setCurrentPage(currentPage + 1)}
          className="rounded border border-gray-200 px-2 py-1 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default Pagination
