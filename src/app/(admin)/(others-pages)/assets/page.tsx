import ComponentCard from '@/components/common/ComponentCard'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import { Metadata } from 'next'
import React from 'react'
import AssetTable from '@/components/tables/AssetTable'

export const metadata: Metadata = {
  title: 'Assets',
  description: 'Asset Mangement System',
}

export default function BasicTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Asset" />
      <div className="space-y-6">
        <ComponentCard title="Asset">
          <AssetTable />
        </ComponentCard>
      </div>
    </div>
  )
}
