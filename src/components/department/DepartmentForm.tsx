'use client'
import React, { useEffect, useState } from 'react'
import Input from '@/components/form/input/InputField'
import Label from '@/components/form/Label'
import Select from '@/components/form/Select'
import { ChevronDownIcon } from '@/icons'
import { Modal } from '@/components/ui/modal'
import Button from '@/components/ui/button/Button'
import axios from 'axios'
import { DepartmentAttributes } from '@/lib/types'

type Props = {
  inputData: DepartmentAttributes
  isOpen: boolean
  onClose: () => void
  onSubmit: () => void
}

export default function DepartmentForm({ inputData, isOpen, onClose, onSubmit }: Props) {
  const [formData, setFormData] = useState<DepartmentAttributes>(inputData)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    setFormData(inputData)
  }, [inputData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleStatusSelectChange = (value: string) => {
    if (value === 'ACTIVE' || value === 'INACTIVE') {
      setFormData(prev => ({ ...prev, status: value }))
    }
  }

  const handleOnSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const isEdit = Boolean(formData.id)
    const endpoint = `/api/departments`
    const method = isEdit ? axios.patch : axios.post

    try {
      await method(endpoint, formData)
      onSubmit()
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const responseError = error.response?.data?.error
        setErrorMessage(responseError || 'An unexpected server error occurred.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const statusOptions = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="m-4 max-w-[600px]">
      <div className="no-scrollbar relative w-full max-w-[600px] overflow-y-auto rounded-3xl bg-white p-4 lg:p-11 dark:bg-gray-900">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            {inputData?.id ? 'Update Department' : 'Create Department'}
          </h1>
        </div>

        <form onSubmit={handleOnSubmit}>
          <div className="space-y-5">
            <div>
              <Label>
                Department Name<span className="text-error-500">*</span>
              </Label>
              <Input
                type="text"
                name="departmentName"
                placeholder="Enter department name"
                value={formData.departmentName}
                required
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Status</Label>
              <div className="relative">
                <Select
                  options={statusOptions}
                  placeholder="Select Option"
                  value={formData.status || 'ACTIVE'}
                  onChange={handleStatusSelectChange}
                  required
                  className="dark:bg-dark-900"
                />
                <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
            </div>

            {errorMessage && <div className="text-error-500 mb-4 text-sm">{errorMessage}</div>}

            <div>
              <Button className="w-full" size="sm" type="submit" disabled={isLoading}>
                {isLoading ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  )
}
