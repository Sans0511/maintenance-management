'use client'
import React, { useState, useEffect } from 'react'
import Input from '@/components/form/input/InputField'
import Label from '@/components/form/Label'
import { ChevronDownIcon } from '@/icons'
import Select from '@/components/form/Select'
import { InventoryAttributes } from '@/lib/types'
import { Modal } from '@/components/ui/modal'
import Button from '../ui/button/Button'
import axios from 'axios'

type Props = {
  inputData: InventoryAttributes | undefined
  isOpen: boolean
  onClose: () => void
  onSubmit: () => void
}

const initialFormData: InventoryAttributes = {
  assetId: '',
  assetName: '',
  inventoryType: 'PURCHASE',
  quantity: null,
}

export default function InventoryForm({
  inputData,
  isOpen,
  onClose,
  onSubmit,
}: Props) {
  const [formData, setFormData] = useState<InventoryAttributes>(initialFormData)
  const [isLoading, setIsLoading] = useState(false)
  const [serachAssetName, setAssetName] = useState('')
  const [assetList, setAssetList] = useState<[]>([])
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (inputData) {
      setFormData(inputData)
    } else {
      setFormData(initialFormData)
    }
    setErrorMessage('')
  }, [inputData, isOpen])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          `/api/asset/search?assetName=${serachAssetName}`
        )
        const transformedCategoryList = response.data.map(
          (asset: { id: number; assetName: string }) => ({
            value: asset.id.toString(),
            label: asset.assetName,
          })
        )
        setAssetList(transformedCategoryList)
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }

    fetchCategories()
  }, [serachAssetName])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value, 10) || 0 : value,
    }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      assetId: value,
    }))
  }

  const handleInventoryTypeSelectChange = (value: string) => {
    if (value === 'PURCHASE') {
      setFormData((prev) => ({ ...prev, inventoryType: value }))
    }
  }

  const handleOnSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const isEdit = Boolean(formData.id)
    const endpoint = `/api/inventory`
    const method = isEdit ? axios.patch : axios.post
    try {
      await method(endpoint, formData)
      console.log(`Inventory ${isEdit ? 'updated' : 'created'} successfully`)
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

  const inventoryOptions = [{ value: 'PURCHASE', label: 'Purchase' }]

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="m-4 max-w-[700px]">
      <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 lg:p-11 dark:bg-gray-900">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            {inputData?.id ? 'Update Inventory' : 'Create Inventory'}
          </h1>
        </div>

        <form onSubmit={handleOnSubmit}>
          <div className="space-y-5">
            <div>
              <Label>Select Inventory Name</Label>

              {/* Search Input */}
              <input
                type="text"
                placeholder="Search Asset"
                className="mb-2 w-full rounded-md border p-2"
                value={serachAssetName}
                onChange={(e) => setAssetName(e.target.value)}
              />

              {/* Select Box with Chevron Icon */}
              <div className="relative">
                <Select
                  options={assetList}
                  placeholder="Select Option"
                  value={formData.assetId}
                  onChange={handleSelectChange}
                  className="dark:bg-dark-900"
                />
                <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
            </div>

            <div>
              <Label>Inventory Type</Label>
              <div className="relative">
                <Select
                  options={inventoryOptions}
                  placeholder="Select Option"
                  value={formData.inventoryType}
                  onChange={handleInventoryTypeSelectChange}
                  className="dark:bg-dark-900"
                />
                <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
            </div>

            <div>
              <Label>
                Quantity <span className="text-error-500">*</span>
              </Label>
              <Input
                type="number"
                name="quantity"
                placeholder="Quantity"
                value={formData.quantity ?? ''}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>
                Remarks <span className="text-error-500">*</span>
              </Label>
              <Input
                type="text"
                name="remarks"
                placeholder="Remarks"
                value={formData.remarks}
                onChange={handleChange}
              />
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
