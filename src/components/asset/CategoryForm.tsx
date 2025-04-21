'use client'
import React, { useState, useEffect } from 'react'
import Input from '@/components/form/input/InputField'
import Label from '@/components/form/Label'
import { ChevronDownIcon } from '@/icons'
import Select from '@/components/form/Select'
import { AssetCategoryAttributes } from '@/lib/types'
import { Modal } from '@/components/ui/modal'
import Button from '../ui/button/Button'
import axios from 'axios'

const initialFormData: AssetCategoryAttributes = {
  categoryName: '',
  categoryDescription: '',
  status: 'ACTIVE',
}

type Props = {
  inputData: AssetCategoryAttributes | undefined
  isOpen: boolean
  onClose: () => void
  onSubmit: () => void
}

export default function AssetCategoryForm({
  inputData,
  isOpen,
  onClose,
  onSubmit,
}: Props) {
  const [formData, setFormData] =
    useState<AssetCategoryAttributes>(initialFormData)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (inputData) {
      setFormData(inputData)
    } else {
      setFormData(initialFormData)
    }
    setErrorMessage('')
  }, [inputData, isOpen])

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle the status change from the dropdown
  const handleStatusSelectChange = (value: string) => {
    if (value === 'ACTIVE' || value === 'INACTIVE') {
      setFormData((prev) => ({ ...prev, status: value }))
    }
  }

  // Handle form submission
  const handleOnSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const isEdit = Boolean(formData.id)
    const endpoint = `/api/asset-category`
    const method = isEdit ? axios.patch : axios.post
    try {
      await method(endpoint, formData)
      console.log(`Category ${isEdit ? 'updated' : 'created'} successfully`)
      setFormData(initialFormData)
      onSubmit()
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const responseError = error.response?.data?.error
        if (responseError) {
          setErrorMessage(responseError)
        } else {
          setErrorMessage('An unexpected server error occurred.')
        }
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
    <Modal isOpen={isOpen} onClose={onClose} className="m-4 max-w-[700px]">
      <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 lg:p-11 dark:bg-gray-900">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            {inputData?.id ? 'Update Category' : 'Create Category'}
          </h1>
        </div>

        <form onSubmit={handleOnSubmit}>
          <div className="space-y-5">
            <div>
              <Label>
                Category Name<span className="text-error-500">*</span>
              </Label>
              <Input
                type="text"
                name="categoryName"
                placeholder="Category Name"
                value={formData.categoryName}
                required
                onChange={handleChange}
              />
            </div>
            <div>
              <Label>
                Category Description<span className="text-error-500">*</span>
              </Label>
              <Input
                type="text"
                name="categoryDescription"
                placeholder="Category Description"
                value={formData.categoryDescription}
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
                  className="dark:bg-dark-900"
                />
                <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
            </div>

            {errorMessage && (
              <div className="text-error-500 mb-4 text-sm">{errorMessage}</div>
            )}

            <div>
              <Button
                className="w-full"
                size="sm"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  )
}
