import ComponentCard from '@/components/common/ComponentCard'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import { Metadata } from 'next'
import React from 'react'
import UserAssetTable from '@/components/tables/User-Asset'

export const metadata: Metadata = {
  title: 'User Assets',
  description: 'Asset Mangement System',
}

export default function BasicTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="User" />
      <div className="space-y-6">
        <ComponentCard title="Asset">
          <UserAssetTable />
        </ComponentCard>
      </div>
    </div>
  )
}
