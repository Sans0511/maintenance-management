import type { Metadata } from 'next'
import React from 'react'
import UserAssetTable from '@/components/tables/User-Asset'
import ComponentCard from '@/components/common/ComponentCard'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Asset Mangement System',
}

export default function Dashboard() {
  return (
    <div>
      <PageBreadcrumb pageTitle="" />
      <div className="space-y-6">
        <ComponentCard title="Asset">
          <UserAssetTable />
        </ComponentCard>
      </div>
    </div>
  )
}
