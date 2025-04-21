import ComponentCard from '@/components/common/ComponentCard'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import { Metadata } from 'next'
import React from 'react'
import UserTable from '@/components/tables/UserTable'

export const metadata: Metadata = {
  title: 'Users',
  description: 'Asset Mangement System',
}

export default function BasicTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="User List" />
      <div className="space-y-6">
        <ComponentCard title="">
          <UserTable />
        </ComponentCard>
      </div>
    </div>
  )
}
