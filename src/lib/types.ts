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

// Optional: Define `ReturnReason` type if it's an enum or custom type
export type ReturnReason = 'DAMAGED' | 'LOST' | 'EXPIRED' // Example, adjust based on your schema

// If the `User` and `Asset` are other Prisma models, you can define them similarly
