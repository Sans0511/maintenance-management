import ComponentCard from '@/components/common/ComponentCard'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import { Metadata } from 'next'
import React from 'react'
import EmployeeTable from '@/components/tables/EmployeeTable'

export const metadata: Metadata = {
  title: 'Employees',
  description: 'Asset Management System',
}

export default function EmployeesPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Employee List" />
      <div className="space-y-6">
        <ComponentCard title="">
          <EmployeeTable />
        </ComponentCard>
      </div>
    </div>
  )
}
