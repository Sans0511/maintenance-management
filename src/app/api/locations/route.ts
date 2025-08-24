// src/app/api/locations/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authenticateUser } from '@/lib/middleware/auth'

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateUser(req)
    if (!authResult.success || authResult.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Invalid or expired token.' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const skip = parseInt(searchParams.get('skip') || '0')
    const limit = parseInt(searchParams.get('limit') || '10')

    const locations = await prisma.location.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        locationName: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    const total = await prisma.location.count()

    return NextResponse.json({ locations, total }, { status: 200 })
  } catch (err: unknown) {
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
      return NextResponse.json({ error: 'Unauthorized. Invalid or expired token.' }, { status: 401 })
    }

    const body = await req.json()
    const { locationName, status } = body as { locationName?: string; status?: 'ACTIVE' | 'INACTIVE' }

    if (!locationName || !status) {
      return NextResponse.json({ error: 'locationName and status are required.' }, { status: 400 })
    }

    const existing = await prisma.location.findFirst({ where: { locationName } })
    if (existing) {
      return NextResponse.json({ error: 'A location with that name already exists.' }, { status: 409 })
    }

    await prisma.location.create({
      data: { locationName, status },
    })

    return NextResponse.json('Location created successfully', { status: 201 })
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
      return NextResponse.json({ error: 'Unauthorized. Invalid or expired token.' }, { status: 401 })
    }

    const body = await req.json()
    const { id, locationName, status } = body as { id?: string; locationName?: string; status?: 'ACTIVE' | 'INACTIVE' }

    if (!id || !locationName || !status) {
      return NextResponse.json({ error: 'id, locationName and status are required.' }, { status: 400 })
    }

    const existing = await prisma.location.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Location not found.' }, { status: 404 })
    }

    if (locationName !== existing.locationName) {
      const nameTaken = await prisma.location.findFirst({ where: { locationName } })
      if (nameTaken) {
        return NextResponse.json({ error: 'A location with that name already exists.' }, { status: 409 })
      }
    }

    await prisma.location.update({
      where: { id },
      data: { locationName, status },
    })

    return NextResponse.json('Location updated successfully', { status: 200 })
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 })
    }
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
