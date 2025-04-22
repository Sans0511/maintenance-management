'use client'
import React, { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../ui/table'
import { useModal } from '@/hooks/useModal'
import axios from 'axios'
import AssetAssignmentForm from '../asset/Asset-Assigment'
import { AssetAssignment } from '@/lib/types'
import Pagination from '../common/Pagination'

export default function AssetAssignmentTable() {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [tableData, setTableData] = useState<AssetAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const { isOpen, openModal, closeModal } = useModal()
  const [formData] = useState<AssetAssignment>()
  const [refreshData, setRefreshData] = useState(false)

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true)
        const skip = (currentPage - 1) * itemsPerPage
        const response = await axios.get(
          `/api/asset-assignment?skip=${skip}&limit=${itemsPerPage}`
        )
        setTableData(response.data.assetAssignments || [])
        setTotalCount(response.data.total || 0)
      } catch (error) {
        console.error('Failed to fetch inventory:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchInventory()
  }, [currentPage, itemsPerPage, refreshData])

  const totalPages = Math.ceil(totalCount / itemsPerPage)
  const showingFrom = (currentPage - 1) * itemsPerPage + 1
  const showingTo = Math.min(currentPage * itemsPerPage, totalCount)

  const handleOnSubmit = async () => {
    closeModal()
    setRefreshData((prev) => !prev)
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          {loading ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              Loading...
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between px-5 py-4">
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Asset
                </h2>
                <button
                  className="rounded bg-blue-600 px-4 py-2 text-sm text-white transition hover:bg-blue-700"
                  onClick={openModal}
                >
                  + Assign to user
                </button>
              </div>

              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="table-heading-center">
                      Sl.No
                    </TableCell>
                    <TableCell isHeader className="table-heading">
                      User Email
                    </TableCell>
                    <TableCell isHeader className="table-heading">
                      Asset Name
                    </TableCell>
                    <TableCell isHeader className="table-heading">
                      Issue Date
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {tableData.length > 0 ? (
                    tableData.map((item: AssetAssignment, index) => (
                      <TableRow key={item.id}>
                        <TableCell className="table-data-center">
                          {showingFrom + index}
                        </TableCell>
                        <TableCell className="table-data">
                          {item.assignedTo?.email || '—'}
                        </TableCell>

                        <TableCell className="table-data">
                          {item.assignedAsset?.assetName}
                        </TableCell>
                        <TableCell className="table-data">
                          {new Date(item?.issueDate ?? '').toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell className="py-4 text-center">
                        No inventory found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <Pagination
                showingFrom={showingFrom}
                showingTo={showingTo}
                totalCount={totalCount}
                itemsPerPage={itemsPerPage}
                setItemsPerPage={setItemsPerPage}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                totalPages={totalPages}
              />
            </>
          )}
        </div>
      </div>

      {isOpen && (
        <AssetAssignmentForm
          inputData={formData}
          isOpen={isOpen}
          onClose={closeModal}
          onSubmit={handleOnSubmit}
        />
      )}
    </div>
  )
}
