'use client'
import React, { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../ui/table'
import { useModal } from '@/hooks/useModal'
import { Pencil } from 'lucide-react'
import axios from 'axios'
import InventoryForm from '../inventory/InventoryForm'
import { InventoryAttributes } from '@/lib/types'
import Pagination from '../common/Pagination'

export default function InventoryTable() {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [inventoryData, setInventoryData] = useState<InventoryAttributes[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const { isOpen, openModal, closeModal } = useModal()
  const [formData, setFormData] = useState<InventoryAttributes>()
  const [refreshData, setRefreshData] = useState(false)

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true)
        const skip = (currentPage - 1) * itemsPerPage

        const response = await axios.get('/api/inventory', {
          params: { skip, limit: itemsPerPage },
        })
        setInventoryData(response.data.inventory || [])
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

  const handleUpdate = (item: InventoryAttributes) => {
    setFormData(item)
    openModal()
  }

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
                  Inventory
                </h2>
                <button
                  className="rounded bg-blue-600 px-4 py-2 text-sm text-white transition hover:bg-blue-700"
                  onClick={openModal}
                >
                  + Add Inventory
                </button>
              </div>

              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="table-heading-center">
                      Sl.No
                    </TableCell>
                    <TableCell isHeader className="table-heading">
                      Date
                    </TableCell>
                    <TableCell isHeader className="table-heading">
                      Asset Name
                    </TableCell>
                    <TableCell isHeader className="table-heading">
                      Inventory Type
                    </TableCell>
                    <TableCell isHeader className="table-heading">
                      Quantity
                    </TableCell>
                    <TableCell isHeader className="table-heading">
                      Remarks
                    </TableCell>
                    <TableCell isHeader className="table-heading-center">
                      Action
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {inventoryData.length > 0 ? (
                    inventoryData.map((item: InventoryAttributes, index) => (
                      <TableRow key={item.id}>
                        <TableCell className="table-data-center">
                          {showingFrom + index}
                        </TableCell>
                        <TableCell className="table-data">
                          {new Date(item?.createdAt ?? '').toLocaleDateString()}
                        </TableCell>
                        <TableCell className="table-data">
                          {item.asset?.assetName || '—'}
                        </TableCell>
                        <TableCell className="table-data">
                          {item.inventoryType}
                        </TableCell>
                        <TableCell className="table-data">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="table-data">
                          {item.remarks || '—'}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-center">
                          <div className="flex justify-center">
                            <button
                              className="table-edit-icon"
                              aria-label="Edit Inventory"
                              onClick={() => handleUpdate(item)}
                            >
                              <Pencil size={18} />
                            </button>
                          </div>
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
        <InventoryForm
          inputData={formData}
          isOpen={isOpen}
          onClose={closeModal}
          onSubmit={handleOnSubmit}
        />
      )}
    </div>
  )
}
