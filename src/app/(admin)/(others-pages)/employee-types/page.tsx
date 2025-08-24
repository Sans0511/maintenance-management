import ComponentCard from '@/components/common/ComponentCard'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import { Metadata } from 'next'
import React from 'react'
import EmployeeTypeTable from '@/components/tables/EmployeeTypeTable'

export const metadata: Metadata = {
  title: 'Employee Types',
  description: 'Asset Management System',
}

export default function EmployeeTypesPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Employee Type List" />
      <div className="space-y-6">
        <ComponentCard title="">
          <EmployeeTypeTable />
        </ComponentCard>
      </div>
    </div>
  )
}
