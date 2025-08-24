'use client'
import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../ui/table'
import Badge from '../ui/badge/Badge'
import axios from 'axios'
import Pagination from '../common/Pagination'
import { EmployeeTypeAttributes } from '@/lib/types'
import { useModal } from '@/hooks/useModal'
import { Pencil } from 'lucide-react'
import EmployeeTypeForm from '@/components/employee-type/EmployeeTypeForm'

const initialFormData: EmployeeTypeAttributes = {
  employeeTypeName: '',
  status: 'ACTIVE',
}

export default function EmployeeTypeTable() {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [data, setData] = useState<EmployeeTypeAttributes[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const { isOpen, openModal, closeModal } = useModal()
  const [formData, setFormData] = useState<EmployeeTypeAttributes>(initialFormData)
  const [refreshData, setRefreshData] = useState(false)

  useEffect(() => {
    const fetchEmployeeTypes = async () => {
      try {
        setLoading(true)
        const skip = (currentPage - 1) * itemsPerPage
        const res = await axios.get(`/api/employee-types?skip=${skip}&limit=${itemsPerPage}`)
        setData(res.data.employeeTypes || [])
        setTotalCount(res.data.total || 0)
      } catch (e) {
        console.error('Failed to fetch employee types:', e)
      } finally {
        setLoading(false)
      }
    }

    fetchEmployeeTypes()
  }, [currentPage, itemsPerPage, refreshData])

  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1
  const showingFrom = totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1
  const showingTo = Math.min(currentPage * itemsPerPage, totalCount)

  const handleUpdate = (item: EmployeeTypeAttributes) => {
    setFormData(item)
    openModal()
  }

  const handleCreate = () => {
    setFormData(initialFormData)
    openModal()
  }

  const handleOnSubmit = async () => {
    setRefreshData(prev => !prev)
    closeModal()
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[700px]">
          {loading ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">Loading...</div>
          ) : (
            <>
              <div className="flex items-center justify-between px-5 py-4">
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Employee Types</h2>
                <button
                  className="rounded bg-blue-600 px-4 py-2 text-sm text-white transition hover:bg-blue-700"
                  onClick={handleCreate}
                >
                  + Add Employee Type
                </button>
              </div>

              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="table-heading-center">Sl.No</TableCell>
                    <TableCell isHeader className="table-heading">Employee Type Name</TableCell>
                    <TableCell isHeader className="table-heading">Status</TableCell>
                    <TableCell isHeader className="table-heading-center">Action</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {data.map((item, index) => (
                    <TableRow key={item.id ?? index}>
                      <TableCell className="table-data-center">{showingFrom + index}</TableCell>
                      <TableCell className="table-data">{item.employeeTypeName}</TableCell>
                      <TableCell className="table-data">
                        <Badge size="sm" color={item.status === 'ACTIVE' ? 'success' : 'error'}>
                          {item.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center">
                        <div className="flex justify-center">
                          <button
                            className="table-edit-icon"
                            aria-label="Edit Employee Type"
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
        <EmployeeTypeForm
          isOpen={isOpen}
          inputData={formData}
          onClose={() => {
            setFormData(initialFormData)
            closeModal()
          }}
          onSubmit={handleOnSubmit}
        />
      )}
    </div>
  )
}
