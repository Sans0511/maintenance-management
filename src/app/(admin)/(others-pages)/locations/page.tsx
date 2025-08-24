import ComponentCard from '@/components/common/ComponentCard'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import { Metadata } from 'next'
import React from 'react'
import LocationTable from '@/components/tables/LocationTable'

export const metadata: Metadata = {
  title: 'Locations',
  description: 'Asset Management System',
}

export default function LocationsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Location List" />
      <div className="space-y-6">
        <ComponentCard title="">
          <LocationTable />
        </ComponentCard>
      </div>
    </div>
  )
}
