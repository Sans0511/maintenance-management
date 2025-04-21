import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/middleware/auth'
import prisma from '@/lib/prisma'
import { Prisma, InventoryType } from '@prisma/client'

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateUser(req)

    if (!authResult.success || authResult.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Invalid or expired token.' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const skip = parseInt(searchParams.get('skip') || '0')
    const limit = parseInt(searchParams.get('limit') || '10')

    const [inventory, total] = await Promise.all([
      prisma.inventory.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          asset: {
            select: {
              id: true,
              assetName: true,
              serialNumber: true,
              assetDescription: true,
            },
          },
        },
      }),
      prisma.inventory.count(),
    ])

    return NextResponse.json({ inventory, total }, { status: 200 })
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 })
    }
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  console.log('fired')
  try {
    const authResult = await authenticateUser(req)

    if (!authResult.success || authResult.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin role required.' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { assetId, inventoryType, quantity, remarks } = body

    if (!assetId || !inventoryType || !quantity) {
      return NextResponse.json(
        { error: 'Missing required fields: assetId, inventoryType, quantity' },
        { status: 400 }
      )
    }

    // Create the new inventory entry
    const newInventory = await prisma.inventory.create({
      data: {
        asset: {
          connect: { id: assetId },
        },
        inventoryType: inventoryType as InventoryType, // Ensure it matches the enum
        quantity,
        remarks,
      },
    })

    return NextResponse.json(newInventory, { status: 201 })
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 })
    }
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authResult = await authenticateUser(req)

    if (!authResult.success || authResult.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin role required.' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { id, assetId, inventoryType, quantity, remarks } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      )
    }

    const updateData: Prisma.InventoryUpdateInput = {}

    if (assetId) {
      updateData.asset = {
        connect: { id: assetId },
      }
    }
    if (inventoryType) {
      updateData.inventoryType = inventoryType as InventoryType
    }
    if (quantity !== undefined) {
      updateData.quantity = quantity
    }
    if (remarks !== undefined) {
      updateData.remarks = remarks
    }

    const updatedInventory = await prisma.inventory.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(updatedInventory, { status: 200 })
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 })
    }
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    )
  }
}
