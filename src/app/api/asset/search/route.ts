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
    const assetName = searchParams.get('assetName') || ''
    const limit = 5

    const assets = await prisma.asset.findMany({
      where: {
        assetName: {
          contains: assetName,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        assetName: true,
      },
      take: limit,
    })

    return NextResponse.json(assets, { status: 200 })
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
