import ComponentCard from '@/components/common/ComponentCard'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import { Metadata } from 'next'
import React from 'react'
import AssetAssignmentTable from '@/components/tables/Asset-Assignment'

export const metadata: Metadata = {
  title: 'Asset Assignment',
  description: 'Asset Mangement System',
}

export default function BasicTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Asset" />
      <div className="space-y-6">
        <ComponentCard title="Assignment">
          <AssetAssignmentTable />
        </ComponentCard>
      </div>
    </div>
  )
}
