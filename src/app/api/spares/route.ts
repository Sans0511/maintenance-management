// src/app/api/spares/route.ts
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

    const [spares, total] = await Promise.all([
      prisma.spare.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          spareName: true,
          spareSpec: true,
          uom: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.spare.count(),
    ])

    return NextResponse.json({ spares, total }, { status: 200 })
  } catch (err: unknown) {
    console.error('GET /api/spares failed:', err)
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 })
    }
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
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
    const { spareName, spareSpec, uom, status } = body as {
      spareName?: string
      spareSpec?: string
      uom?: string
      status?: 'ACTIVE' | 'INACTIVE'
    }

    if (!spareName || !uom || !status) {
      return NextResponse.json(
        { error: 'spareName, uom and status are required.' },
        { status: 400 }
      )
    }

    const exists = await prisma.spare.findFirst({ where: { spareName } })
    if (exists) {
      return NextResponse.json(
        { error: 'A spare with that name already exists.' },
        { status: 409 }
      )
    }

    await prisma.spare.create({
      data: { spareName, spareSpec: spareSpec || null, uom, status },
    })

    return NextResponse.json('Spare created successfully', { status: 201 })
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 })
    }
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
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
    const { id, spareName, spareSpec, uom, status } = body as {
      id?: string
      spareName?: string
      spareSpec?: string | null
      uom?: string
      status?: 'ACTIVE' | 'INACTIVE'
    }

    if (!id || !spareName || !uom || !status) {
      return NextResponse.json(
        { error: 'id, spareName, uom and status are required.' },
        { status: 400 }
      )
    }

    const existing = await prisma.spare.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Spare not found.' }, { status: 404 })
    }

    if (spareName !== existing.spareName) {
      const nameTaken = await prisma.spare.findFirst({ where: { spareName } })
      if (nameTaken) {
        return NextResponse.json(
          { error: 'A spare with that name already exists.' },
          { status: 409 }
        )
      }
    }

    await prisma.spare.update({
      where: { id },
      data: { spareName, spareSpec: spareSpec || null, uom, status },
    })

    return NextResponse.json('Spare updated successfully', { status: 200 })
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 })
    }
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
