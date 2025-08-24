import ComponentCard from '@/components/common/ComponentCard'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import { Metadata } from 'next'
import React from 'react'
import DepartmentTable from '@/components/tables/DepartmentTable'

export const metadata: Metadata = {
  title: 'Departments',
  description: 'Asset Management System',
}

export default function DepartmentsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Department List" />
      <div className="space-y-6">
        <ComponentCard title="">
          <DepartmentTable />
        </ComponentCard>
      </div>
    </div>
  )
}
