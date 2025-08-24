// src/app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authenticateUser } from '@/lib/middleware/auth'

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
    const rawSkip = Number(searchParams.get('skip'))
    const rawLimit = Number(searchParams.get('limit'))
    const skip = Number.isFinite(rawSkip) && rawSkip > 0 ? Math.floor(rawSkip) : 0
    const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(Math.floor(rawLimit), 100) : 10

    const [assetCategories, total] = await Promise.all([
      prisma.assetCategory.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          categoryName: true,
          categoryDescription: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.assetCategory.count(),
    ])

    return NextResponse.json({ assetCategories, total }, { status: 200 })
  } catch (err: unknown) {
    // Log full error for server diagnostics
    console.error('GET /api/asset-category failed:', err)
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
    const { categoryName, categoryDescription, status, parentCategoryId } = body

    if (!categoryName || !status) {
      return NextResponse.json(
        { error: 'All fields are required.' },
        { status: 400 }
      )
    }

    const existingCategory = await prisma.assetCategory.findFirst({
      where: { categoryName },
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category name already exists.' },
        { status: 409 }
      )
    }

    await prisma.assetCategory.create({
      data: {
        categoryName,
        categoryDescription,
        status,
        parentCategoryId: parentCategoryId || null,
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
    const { id, categoryName, categoryDescription, status, parentCategoryId } = body

    if (!id || !categoryName || !status) {
      return NextResponse.json(
        { error: 'All fields are required.' },
        { status: 400 }
      )
    }

    const category = await prisma.assetCategory.findUnique({ where: { id } })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found.' },
        { status: 404 }
      )
    }

    await prisma.assetCategory.update({
      where: { id },
      data: {
        categoryName,
        categoryDescription,
        status,
        parentCategoryId: parentCategoryId || null,
      },
    })

    return NextResponse.json(
      { message: 'Category updated successfully' },
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
