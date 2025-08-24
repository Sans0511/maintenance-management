'use client'
import React, { useEffect, useState } from 'react'
import Input from '@/components/form/input/InputField'
import Label from '@/components/form/Label'
import Select from '@/components/form/Select'
import { ChevronDownIcon } from '@/icons'
import { Modal } from '@/components/ui/modal'
import Button from '@/components/ui/button/Button'
import axios, { AxiosError } from 'axios'
import { EmployeeAttributes } from '@/lib/types'

type Option = { value: string; label: string }

type Props = {
  inputData: EmployeeAttributes
  isOpen: boolean
  onClose: () => void
  onSubmit: () => void
}

export default function EmployeeForm({ inputData, isOpen, onClose, onSubmit }: Props) {
  const [formData, setFormData] = useState<EmployeeAttributes>(inputData)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const [deptOptions, setDeptOptions] = useState<Option[]>([])
  const [desigOptions, setDesigOptions] = useState<Option[]>([])
  const [typeOptions, setTypeOptions] = useState<Option[]>([])
  const [contractOptions, setContractOptions] = useState<Option[]>([])

  useEffect(() => {
    setFormData(inputData)
  }, [inputData])

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [dpt, dsg, typ, ctr] = await Promise.all([
          axios.get('/api/departments?skip=0&limit=1000'),
          axios.get('/api/designations?skip=0&limit=1000'),
          axios.get('/api/employee-types?skip=0&limit=1000'),
          axios.get('/api/contracts?skip=0&limit=1000'),
        ])
        setDeptOptions((dpt.data.departments || []).map((x: { id: string; departmentName: string }) => ({ value: x.id, label: x.departmentName })))
        setDesigOptions((dsg.data.designations || []).map((x: { id: string; designationName: string }) => ({ value: x.id, label: x.designationName })))
        setTypeOptions((typ.data.employeeTypes || []).map((x: { id: string; employeeTypeName: string }) => ({ value: x.id, label: x.employeeTypeName })))
        setContractOptions((ctr.data.contracts || []).map((x: { id: string; contractName: string }) => ({ value: x.id, label: x.contractName })))
      } catch (e) {
        console.error('Failed to fetch dropdown options', e)
      }
    }
    fetchOptions()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const setSel = (name: keyof EmployeeAttributes) => (value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleOnSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const isEdit = Boolean(formData.id)
    const endpoint = `/api/employees`
    const method = isEdit ? axios.patch : axios.post

    try {
      await method(endpoint, formData)
      onSubmit()
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const err = error as AxiosError<{ error?: string }>
        const responseError = err.response?.data?.error
        setErrorMessage(responseError || 'An unexpected server error occurred.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const statusOptions: Option[] = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="m-4 max-w-[800px]">
      <div className="no-scrollbar relative w-full max-w-[800px] overflow-y-auto rounded-3xl bg-white p-4 lg:p-11 dark:bg-gray-900">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            {inputData?.id ? 'Update Employee' : 'Create Employee'}
          </h1>
        </div>

        <form onSubmit={handleOnSubmit}>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <Label>
                Employee ID<span className="text-error-500">*</span>
              </Label>
              <Input
                type="text"
                name="employeeId"
                placeholder="Enter employee ID"
                value={formData.employeeId}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>
                First Name<span className="text-error-500">*</span>
              </Label>
              <Input
                type="text"
                name="employeeFirstName"
                placeholder="Enter first name"
                value={formData.employeeFirstName}
                required
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>
                Last Name<span className="text-error-500">*</span>
              </Label>
              <Input
                type="text"
                name="employeeLastName"
                placeholder="Enter last name"
                value={formData.employeeLastName}
                required
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Department</Label>
              <div className="relative">
                <Select options={deptOptions} placeholder="Select Department" value={formData.departmentId || ''} onChange={setSel('departmentId')} />
                <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
            </div>

            <div>
              <Label>Designation</Label>
              <div className="relative">
                <Select options={desigOptions} placeholder="Select Designation" value={formData.designationId} onChange={setSel('designationId')} required />
                <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
            </div>

            <div>
              <Label>Employee Type</Label>
              <div className="relative">
                <Select options={typeOptions} placeholder="Select Employee Type" value={formData.employeeTypeId} onChange={setSel('employeeTypeId')} required />
                <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
            </div>

            <div>
              <Label>Contract</Label>
              <div className="relative">
                <Select options={contractOptions} placeholder="Select Contract" value={formData.contractId || ''} onChange={setSel('contractId')} />
                <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
            </div>

            <div>
              <Label>
                Phone Number<span className="text-error-500">*</span>
              </Label>
              <Input
                type="text"
                name="phoneNo"
                placeholder="Enter phone number"
                value={formData.phoneNo}
                required
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Status</Label>
              <div className="relative">
                <Select options={statusOptions} placeholder="Select Option" value={formData.status || 'ACTIVE'} onChange={setSel('status')} required className="dark:bg-dark-900" />
                <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
            </div>

            {errorMessage && <div className="text-error-500 mb-4 text-sm md:col-span-2">{errorMessage}</div>}

            <div className="md:col-span-2">
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
