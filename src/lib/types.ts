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

export type DesignationAttributes = {
  id?: string
  designationName: string
  status?: 'ACTIVE' | 'INACTIVE'
  createdAt?: string
  updatedAt?: string
}

export type DepartmentAttributes = {
  id?: string
  departmentName: string
  status?: 'ACTIVE' | 'INACTIVE'
  createdAt?: string
  updatedAt?: string
}

export type LocationAttributes = {
  id?: string
  locationName: string
  status?: 'ACTIVE' | 'INACTIVE'
  createdAt?: string
  updatedAt?: string
}

export type EmployeeTypeAttributes = {
  id?: string
  employeeTypeName: string
  status?: 'ACTIVE' | 'INACTIVE'
  createdAt?: string
  updatedAt?: string
}

export type ContractAttributes = {
  id?: string
  contractName: string
  sphoneNumber: string
  status?: 'ACTIVE' | 'INACTIVE'
  createdAt?: string
  updatedAt?: string
}

export type EmployeeAttributes = {
  id?: string
  employeeId?: string
  employeeFirstName: string
  employeeLastName: string
  departmentId?: string
  designationId: string
  employeeTypeId: string
  contractId?: string
  phoneNo: string
  status?: 'ACTIVE' | 'INACTIVE'
  createdAt?: string
  updatedAt?: string
  // Optional denormalized fields for tables
  departmentName?: string
  designationName?: string
  employeeTypeName?: string
  contractName?: string
}
