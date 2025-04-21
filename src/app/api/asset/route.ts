// src/app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authenticateUser } from '@/lib/middleware/auth'

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateUser(req)

    if (!authResult.success || authResult.role !== 'ADMIN') {
      console.log('Unauthorized access attempt detected.')
      return NextResponse.json(
        { error: 'Unauthorized. Invalid or expired token.' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const skip = parseInt(searchParams.get('skip') || '0')
    const limit = parseInt(searchParams.get('limit') || '10')

    const [assets, total] = await Promise.all([
      prisma.asset.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          assetName: true,
          assetDescription: true,
          serialNumber: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          assetCategory: {
            select: {
              id: true,
              categoryName: true,
            },
          },
        },
      }),
      prisma.asset.count(),
    ])

    return NextResponse.json({ assets, total }, { status: 200 })
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
  try {
    const authResult = await authenticateUser(req)

    if (!authResult.success || authResult.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Invalid or expired token.' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { assetName, assetDescription, categoryId, serialNumber, status } =
      body

    if (
      !assetName ||
      !assetDescription ||
      !categoryId ||
      !serialNumber ||
      !status
    ) {
      return NextResponse.json(
        { error: 'All fields are required.' },
        { status: 400 }
      )
    }

    const existingAsset = await prisma.asset.findFirst({
      where: { assetName },
    })

    if (existingAsset) {
      return NextResponse.json(
        { error: 'Asset name already exists.' },
        { status: 409 }
      )
    }

    await prisma.asset.create({
      data: {
        assetName,
        assetDescription,
        categoryId,
        serialNumber,
        status,
      },
    })

    return NextResponse.json({ success: true }, { status: 201 })
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
        { error: 'Unauthorized. Invalid or expired token.' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const {
      id,
      assetName,
      assetDescription,
      categoryId,
      serialNumber,
      status,
    } = body

    if (
      !id ||
      !assetName ||
      !assetDescription ||
      !categoryId ||
      !serialNumber ||
      !status
    ) {
      return NextResponse.json(
        { error: 'All fields are required.' },
        { status: 400 }
      )
    }

    const existingAsset = await prisma.asset.findUnique({ where: { id } })

    if (!existingAsset) {
      return NextResponse.json({ error: 'Asset not found.' }, { status: 404 })
    }

    await prisma.asset.update({
      where: { id },
      data: {
        assetName,
        assetDescription,
        categoryId,
        serialNumber,
        status,
      },
    })

    return NextResponse.json(
      { message: 'Asset updated successfully' },
      { status: 200 }
    )
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
