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
    const skip = parseInt(searchParams.get('skip') || '0')
    const limit = parseInt(searchParams.get('limit') || '10')

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
    const { categoryName, categoryDescription, status } = body

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
    const { id, categoryName, categoryDescription, status } = body

    if (!id || !categoryName || !categoryDescription || !status) {
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
