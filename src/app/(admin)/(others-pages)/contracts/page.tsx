import ComponentCard from '@/components/common/ComponentCard'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import { Metadata } from 'next'
import React from 'react'
import ContractTable from '@/components/tables/ContractTable'

export const metadata: Metadata = {
  title: 'Contracts',
  description: 'Asset Management System',
}

export default function ContractsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Contract List" />
      <div className="space-y-6">
        <ComponentCard title="">
          <ContractTable />
        </ComponentCard>
      </div>
    </div>
  )
}
