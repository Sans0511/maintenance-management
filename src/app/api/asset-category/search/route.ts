// src/app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/middleware/auth'
import prisma from '@/lib/prisma'

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
    const categoryName = searchParams.get('categoryName') || ''
    const limit = 5

    const assetCategories = await prisma.assetCategory.findMany({
      where: {
        categoryName: {
          contains: categoryName,
          mode: 'insensitive', // optional, case-insensitive search
        },
      },
      select: {
        id: true,
        categoryName: true,
      },
      take: limit,
    })

    console.log({ assetCategories })

    return NextResponse.json(assetCategories, { status: 200 })
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
