'use client'
import React, { useState, useEffect } from 'react'
import Label from '@/components/form/Label'
import { ChevronDownIcon } from '@/icons'
import Select from '@/components/form/Select'
import { AssetAssignment } from '@/lib/types'
import { Modal } from '@/components/ui/modal'
import Button from '@/components/ui/button/Button'
import axios from 'axios'

type Props = {
  inputData: AssetAssignment | undefined
  isOpen: boolean
  onClose: () => void
  onSubmit: () => void
}

const initialFormData: AssetAssignment = {
  userId: '',
  assetId: '',
  issueDate: new Date(),
}
export default function AssetAssignmentForm({
  inputData,
  isOpen,
  onClose,
  onSubmit,
}: Props) {
  const [formData, setFormData] = useState<AssetAssignment>(initialFormData)
  const [isLoading, setIsLoading] = useState(false)
  const [searchAssetName, setSearchAssetName] = useState('')
  const [searchUserEmail, setSearchUserEmail] = useState('')
  const [assetList, setAssetList] = useState<[]>([])
  const [userList, setUserList] = useState<[]>([])
  const [errorMessage, setErrorMessage] = useState('')

  // Set initial form values
  useEffect(() => {
    if (inputData) {
      setFormData(inputData)
    } else {
      setFormData(initialFormData)
    }
    setErrorMessage('')
  }, [inputData, isOpen])

  // Fetch assets
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const res = await axios.get(
          `/api/asset/search?assetName=${searchAssetName}`
        )
        const options = res.data.map(
          (asset: { id: number; assetName: string }) => ({
            value: asset.id.toString(),
            label: asset.assetName,
          })
        )
        setAssetList(options)
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

    fetchAssets()
  }, [searchAssetName])

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(
          `/api/users/search?email=${searchUserEmail}`
        )
        const options = res.data.map((user: { id: number; email: string }) => ({
          value: user.id.toString(),
          label: user.email,
        }))
        setUserList(options)
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

    fetchUsers()
  }, [searchUserEmail])

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      assetId: value,
    }))
  }

  const handleUserSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      userId: value,
    }))
  }

  const handleOnSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const isEdit = Boolean(formData.id)
    const endpoint = `/api/asset-assignment`
    const method = isEdit ? axios.patch : axios.post
    try {
      await method(endpoint, formData)
      console.log(`${isEdit ? 'updated' : 'created'} successfully`)
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="m-4 max-w-[700px]">
      <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 lg:p-11 dark:bg-gray-900">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            {inputData?.id ? 'Update Inventory' : 'Assign Asset'}
          </h1>
        </div>

        <form onSubmit={handleOnSubmit}>
          <div className="space-y-5">
            {/* Asset Selector */}
            <div>
              <Label>Select Asset</Label>
              <input
                type="text"
                placeholder="Search Asset"
                className="mb-2 w-full rounded-md border p-2"
                value={searchAssetName}
                onChange={(e) => setSearchAssetName(e.target.value)}
              />
              <div className="relative">
                <Select
                  options={assetList}
                  placeholder="Select Asset"
                  value={formData.assetId}
                  onChange={handleSelectChange}
                  className="dark:bg-dark-900"
                  required
                />
                <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
            </div>

            {/* User Selector */}
            <div>
              <Label>Select User</Label>
              <input
                type="text"
                placeholder="Search User"
                className="mb-2 w-full rounded-md border p-2"
                value={searchUserEmail}
                onChange={(e) => setSearchUserEmail(e.target.value)}
              />
              <div className="relative">
                <Select
                  options={userList}
                  placeholder="Select User"
                  value={formData.userId}
                  onChange={handleUserSelectChange}
                  className="dark:bg-dark-900"
                  required
                />
                <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
            </div>
            {errorMessage && (
              <div className="text-error-500 mb-4 text-sm">{errorMessage}</div>
            )}

            {/* Submit */}

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
