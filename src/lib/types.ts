export type UserData = {
  id?: number
  firstName: string
  lastName: string
  email: string
  password?: string
  role: 'USER' | 'ADMIN'
  mobileNumber: string
  createdAt?: string
  updatedAt?: string
  status?: 'ACTIVE' | 'INACTIVE'
}

export type DecodedToken = {
  role: string
  userId: string
}

export type AssetCategoryAttributes = {
  id?: number
  categoryName: string
  categoryDescription?: string
  status?: 'ACTIVE' | 'INACTIVE'
}

export type AssetAttributes = {
  id?: number
  assetName: string
  assetDescription?: string
  categoryId: string
  assetCategory?: {
    id: string
    categoryName: string
  }
  serialNumber?: string
  status: 'ACTIVE' | 'INACTIVE' | 'DISPOSED'
}

export type InventoryAttributes = {
  id?: number
  assetId: string
  assetName: string
  inventoryType: 'PURCHASE' | 'ISSUE' | 'ADJUSTMENT'
  quantity: number | null
  remarks?: string
  asset?: AssetAttributes
  createdAt?: string
}

export type AssetAssignment = {
  id?: string
  userId: string
  assetId: string
  issueDate?: Date
  returnDate?: Date | null
  returnReason?: string
  isReturn?: boolean
  assignedTo?: UserData
  assignedAsset?: AssetAttributes
}

export type ReturnReason = 'DAMAGED' | 'LOST' | 'EXPIRED'

export type PaginationProps = {
  showingFrom: number
  showingTo: number
  totalCount: number
  itemsPerPage: number
  setItemsPerPage: (value: number) => void
  currentPage: number
  setCurrentPage: (value: number) => void
  totalPages: number
}
