'use client'
import React, { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../ui/table'
import { useModal } from '@/hooks/useModal'
import Badge from '../ui/badge/Badge'
import { Pencil } from 'lucide-react'
import axios from 'axios'
import AssetCategoryForm from '../asset/CategoryForm'
import { AssetCategoryAttributes } from '@/lib/types'
import Pagination from '../common/Pagination'

export default function AssetCategoryTable() {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [categoryData, setCategoryData] = useState<AssetCategoryAttributes[]>(
    []
  )
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const { isOpen, openModal, closeModal } = useModal()
  const [formData, setFormData] = useState<AssetCategoryAttributes>()
  const [refreshData, setRefreshData] = useState(false)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const skip = (currentPage - 1) * itemsPerPage
        const response = await axios.get(
          `/api/asset-category?skip=${skip}&limit=${itemsPerPage}`
        )
        setCategoryData(response.data.assetCategories || [])
        setTotalCount(response.data.total || 0)
      } catch (error) {
        console.error('Failed to fetch users:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [currentPage, itemsPerPage, refreshData])

  const totalPages = Math.ceil(totalCount / itemsPerPage)
  const showingFrom = (currentPage - 1) * itemsPerPage + 1
  const showingTo = Math.min(currentPage * itemsPerPage, totalCount)

  const handleUpdate = (item: AssetCategoryAttributes) => {
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
              {/* Add User Button */}
              <div className="flex items-center justify-between px-5 py-4">
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Categories
                </h2>
                <button
                  className="rounded bg-blue-600 px-4 py-2 text-sm text-white transition hover:bg-blue-700"
                  onClick={openModal}
                >
                  + Add Category
                </button>
              </div>

              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="table-heading-center">
                      Sl.No
                    </TableCell>
                    <TableCell isHeader className="table-heading">
                      Name
                    </TableCell>
                    <TableCell isHeader className="table-heading">
                      Discription
                    </TableCell>
                    <TableCell isHeader className="table-heading">
                      Status
                    </TableCell>
                    <TableCell isHeader className="table-heading-center">
                      Action
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {categoryData.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell className="table-data-center">
                        {showingFrom + index}
                      </TableCell>
                      <TableCell className="table-data">
                        {item.categoryName}
                      </TableCell>
                      <TableCell className="table-data">
                        {item.categoryDescription}
                      </TableCell>

                      <TableCell className="table-data">
                        <Badge
                          size="sm"
                          color={item.status === 'ACTIVE' ? 'success' : 'error'}
                        >
                          {item.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center">
                        <div className="flex justify-center">
                          <button
                            className="table-edit-icon"
                            aria-label="Edit User"
                            onClick={() => handleUpdate(item)}
                          >
                            <Pencil size={18} />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination Controls */}
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

      {/* User Form Modal */}
      {isOpen && (
        <AssetCategoryForm
          isOpen={isOpen}
          inputData={formData}
          onClose={() => {
            closeModal()
          }}
          onSubmit={handleOnSubmit}
        />
      )}
    </div>
  )
}
