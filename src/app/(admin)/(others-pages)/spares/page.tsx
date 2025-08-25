import ComponentCard from '@/components/common/ComponentCard'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import { Metadata } from 'next'
import React from 'react'
import SpareTable from '@/components/tables/SpareTable'

export const metadata: Metadata = {
  title: 'Spares',
  description: 'Maintenance Management System',
}

export default function Page() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Spares" />
      <div className="space-y-6">
        <ComponentCard title="Spares">
          <SpareTable />
        </ComponentCard>
      </div>
    </div>
  )
}
