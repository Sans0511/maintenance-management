'use client'
import React, { useState, useEffect } from 'react'
import Input from '@/components/form/input/InputField'
import Label from '@/components/form/Label'
import { ChevronDownIcon } from '@/icons'
import Select from '@/components/form/Select'
import { AssetAttributes } from '@/lib/types'
import { Modal } from '@/components/ui/modal'
import Button from '../ui/button/Button'
import axios from 'axios'

type Props = {
  inputData: AssetAttributes | undefined
  isOpen: boolean
  onClose: () => void
  onSubmit: () => void
}

const initialFormData: AssetAttributes = {
  assetName: '',
  assetDescription: '',
  categoryId: '',
  serialNumber: '',
  status: 'ACTIVE',
}

export default function AssetForm({
  inputData,
  isOpen,
  onClose,
  onSubmit,
}: Props) {
  const [formData, setFormData] = useState<AssetAttributes>(initialFormData)
  const [isLoading, setIsLoading] = useState(false)
  const [serachCategoryName, setSerachCategoryName] = useState('')
  const [categoryList, setCategoryList] = useState<
    { value: string; label: string }[]
  >([])
  const [errorMessage, setErrorMessage] = useState('')

  // Update formData when inputData changes
  useEffect(() => {
    if (inputData) {
      setFormData(inputData)
    } else {
      setFormData(initialFormData)
    }
    setErrorMessage('')
  }, [inputData, isOpen])

  // Fetch categories based on search query
  useEffect(() => {
    const fetchAssetCategory = async () => {
      try {
        const response = await axios.get(
          `/api/asset-category/search?categoryName=${serachCategoryName}`
        )
        const transformedCategoryList = response.data.map(
          (category: { id: number; categoryName: string }) => ({
            value: category.id.toString(),
            label: category.categoryName,
          })
        )
        setCategoryList(transformedCategoryList)
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const responseError = error.response?.data?.error
          if (responseError) {
            setErrorMessage(responseError)
          } else {
            setErrorMessage('An unexpected server error occurred.')
          }
        }
      }
    }

    fetchAssetCategory()
  }, [serachCategoryName])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle category selection
  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      categoryId: value, // Set categoryId based on selection
    }))
  }

  // Handle status change
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
    const endpoint = `/api/asset`
    const method = isEdit ? axios.patch : axios.post
    try {
      await method(endpoint, formData)
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
            {inputData?.id ? 'Update Asset' : 'Create Asset'}
          </h1>
        </div>

        <form onSubmit={handleOnSubmit}>
          <div className="space-y-5">
            <div>
              <Label>
                Name<span className="text-error-500">*</span>
              </Label>
              <Input
                type="text"
                name="assetName"
                placeholder="Asset Name"
                value={formData.assetName}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>
                Asset Description<span className="text-error-500">*</span>
              </Label>
              <Input
                type="text"
                name="assetDescription"
                placeholder="Asset Description"
                value={formData.assetDescription}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Select Category</Label>

              {/* Search Input */}
              <input
                type="text"
                placeholder="Search Categories"
                className="mb-2 w-full rounded-md border p-2"
                value={serachCategoryName}
                onChange={(e) => setSerachCategoryName(e.target.value)}
              />

              {/* Select Box with Chevron Icon */}
              <div className="relative">
                <Select
                  options={categoryList}
                  placeholder="Select Option"
                  value={formData.categoryId || ''} // Bind categoryId to Select value
                  onChange={handleSelectChange}
                  className="dark:bg-dark-900"
                />
                <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
            </div>

            <div>
              <Label>
                Serial No<span className="text-error-500">*</span>
              </Label>
              <Input
                type="text"
                name="serialNumber"
                placeholder="Serial Number"
                value={formData.serialNumber}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Status</Label>
              <div className="relative">
                <Select
                  options={statusOptions}
                  placeholder="Select Option"
                  value={formData.status || 'INACTIVE'}
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

            {/* Submit button with conditional text and style */}
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
