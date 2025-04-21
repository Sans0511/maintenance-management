'use client'
import React, { useState, useEffect } from 'react'
import Input from '@/components/form/input/InputField'
import Label from '@/components/form/Label'
import { AssetAssignment } from '@/lib/types'
import { Modal } from '@/components/ui/modal'
import Button from '../ui/button/Button'
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
  returnReason: '',
  isReturn: true,
}

export default function AssetReturnForm({
  inputData,
  isOpen,
  onClose,
  onSubmit,
}: Props) {
  const [formData, setFormData] = useState<AssetAssignment>(initialFormData)
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleOnSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await axios.patch(`/api/asset-assignment`, {
        id: formData.id,
        returnReason: formData.returnReason,
      })
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
      } else {
        setErrorMessage('An unexpected error occurred.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault()
  //   setIsLoading(true)

  //   try {
  //     onSubmit(formData)
  //   } catch (error) {
  //     console.error('Error submitting form:', error)
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="m-4 max-w-[700px]">
      <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 lg:p-11 dark:bg-gray-900">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Asset - Return
          </h1>
        </div>

        <form onSubmit={handleOnSubmit}>
          <div className="space-y-5">
            <div>
              <Label>
                Return Reason<span className="text-error-500">*</span>
              </Label>
              <Input
                type="text"
                name="returnReason"
                placeholder="Return Reason"
                value={formData.returnReason || ''}
                onChange={handleChange}
              />
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
