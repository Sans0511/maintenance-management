import ComponentCard from '@/components/common/ComponentCard'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import { Metadata } from 'next'
import React from 'react'
import DesignationTable from '@/components/tables/DesignationTable'

export const metadata: Metadata = {
  title: 'Designations',
  description: 'Asset Management System',
}

export default function DesignationsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Designation List" />
      <div className="space-y-6">
        <ComponentCard title="">
          <DesignationTable />
        </ComponentCard>
      </div>
    </div>
  )
}
