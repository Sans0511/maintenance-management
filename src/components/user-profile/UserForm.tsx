'use client'
import React, { useState, useEffect } from 'react'
import Input from '@/components/form/input/InputField'
import Label from '@/components/form/Label'
import { EyeCloseIcon, EyeIcon, ChevronDownIcon } from '@/icons'
import Select from '@/components/form/Select'
import { UserData, EmployeeAttributes } from '@/lib/types'
import { Modal } from '@/components/ui/modal'
import Button from '../ui/button/Button'
import axios from 'axios'

type Props = {
  inputData: UserData
  isOpen: boolean
  onClose: () => void
  onSubmit: () => void
}

export default function UserForm({
  inputData,
  isOpen,
  onClose,
  onSubmit,
}: Props) {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState<UserData>(inputData)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [employeeOptions, setEmployeeOptions] = useState<{ value: string; label: string }[]>([])

  useEffect(() => {
    setFormData(inputData)
  }, [inputData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleEmployeeSelect = (value: string) => {
    setFormData((prev) => ({ ...prev, employeeId: value }))
  }

  const handleSelectChange = (value: string) => {
    if (value === 'USER' || value === 'ADMIN') {
      setFormData((prev) => ({ ...prev, role: value }))
    }
  }

  const handleStatusSelectChange = (value: string) => {
    if (value === 'ACTIVE' || value === 'INACTIVE') {
      setFormData((prev) => ({ ...prev, status: value }))
    }
  }

  const handleOnSubmit = async (e: React.FormEvent) => {
    setIsLoading(true)
    e.preventDefault()
    const isEdit = Boolean(formData.id)
    const endpoint = `/api/users`
    const method = isEdit ? axios.patch : axios.post

    try {
      if (isEdit) {
        await method(endpoint, {
          id: formData.id,
          email: formData.email,
          role: formData.role,
          status: formData.status,
          employeeId: formData.employeeId,
        })
      } else {
        await method(endpoint, {
          email: formData.email,
          password: formData.password,
          role: formData.role,
          status: formData.status,
          employeeId: formData.employeeId,
        })
      }
      console.log(`User ${isEdit ? 'updated' : 'created'} successfully`)
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

  const options = [
    { value: 'USER', label: 'User' },
    { value: 'ADMIN', label: 'Admin' },
  ]

  const statusOptions = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
  ]

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const res = await axios.get(`/api/employees?skip=0&limit=1000`)
        const opts = (res.data.employees || []).map((e: EmployeeAttributes) => ({
          value: e.id as string,
          label: `${e.employeeFirstName} ${e.employeeLastName} - ${e.phoneNo}`,
        }))
        setEmployeeOptions(opts)
      } catch (err) {
        console.error('Failed to load employees', err)
      }
    }
    loadEmployees()
  }, [])

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="m-4 max-w-[700px]">
      <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 lg:p-11 dark:bg-gray-900">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            {inputData?.id ? 'Update User' : 'Create User'}
          </h1>
        </div>

        <form onSubmit={handleOnSubmit}>
          <div className="space-y-5">
            <div>
              <Label>
                Select Employee<span className="text-error-500">*</span>
              </Label>
              <div className="relative">
                <Select
                  options={employeeOptions}
                  placeholder="Select Employee"
                  value={formData.employeeId || ''}
                  onChange={handleEmployeeSelect}
                  className="dark:bg-dark-900"
                  required
                />
                <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
            </div>

            <div>
              <Label>
                Email<span className="text-error-500">*</span>
              </Label>
              <Input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                required
                onChange={handleChange}
              />
            </div>

            {/* Mobile number removed: derived from Employee */}

            <div>
              <Label>Select User Role</Label>
              <div className="relative">
                <Select
                  options={options}
                  placeholder="Select Option"
                  value={formData.role}
                  onChange={handleSelectChange}
                  className="dark:bg-dark-900"
                  required
                />
                <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
            </div>

            <div>
              <Label>Status</Label>
              <div className="relative">
                <Select
                  options={statusOptions}
                  placeholder="Select Option"
                  value={formData.status || 'inactive'}
                  onChange={handleStatusSelectChange}
                  required
                  className="dark:bg-dark-900"
                />
                <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
            </div>

            {!inputData?.id && (
              <div>
                <Label>
                  Password<span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    placeholder="Enter new password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                    )}
                  </span>
                </div>
              </div>
            )}

            <div>
              {' '}
              {errorMessage && (
                <div className="text-error-500 mb-4 text-sm">
                  {errorMessage}
                </div>
              )}
            </div>
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
