import ComponentCard from '@/components/common/ComponentCard'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import { Metadata } from 'next'
import React from 'react'
import InventoryTable from '@/components/tables/Inventory'

export const metadata: Metadata = {
  title: 'Inventory',
  description: 'Asset Mangement System',
}

export default function BasicTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Inventory" />
      <div className="space-y-6">
        <ComponentCard title="Inventory">
          <InventoryTable />
        </ComponentCard>
      </div>
    </div>
  )
}
