import ComponentCard from '@/components/common/ComponentCard'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import { Metadata } from 'next'
import React from 'react'
import AssetCategoryTable from '@/components/tables/AssetCategoryTable'

export const metadata: Metadata = {
  title: 'Asset Category',
  description: 'Asset Mangement System',
}

export default function Page() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Asset" />
      <div className="space-y-6">
        <ComponentCard title="Asset Category">
          <AssetCategoryTable />
        </ComponentCard>
      </div>
    </div>
  )
}
