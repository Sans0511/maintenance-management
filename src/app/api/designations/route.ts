// src/app/api/designations/route.ts
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

    const designations = await prisma.designation.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        designationName: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    const total = await prisma.designation.count()

    return NextResponse.json({ designations, total }, { status: 200 })
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
    const { designationName, status } = body as { designationName?: string; status?: 'ACTIVE' | 'INACTIVE' }

    if (!designationName || !status) {
      return NextResponse.json({ error: 'designationName and status are required.' }, { status: 400 })
    }

    // Optional: avoid duplicate names
    const existing = await prisma.designation.findFirst({ where: { designationName } })
    if (existing) {
      return NextResponse.json({ error: 'A designation with that name already exists.' }, { status: 409 })
    }
     await prisma.designation.create({
      data: { designationName, status },
    })
    return NextResponse.json('Designation created successfully', { status: 201 })
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
    const { id, designationName, status } = body as { id?: string; designationName?: string; status?: 'ACTIVE' | 'INACTIVE' }

    if (!id || !designationName || !status) {
      return NextResponse.json({ error: 'id, designationName and status are required.' }, { status: 400 })
    }

    const existing = await prisma.designation.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Designation not found.' }, { status: 404 })
    }

    // Optional duplication guard when changing the name
    if (designationName !== existing.designationName) {
      const nameTaken = await prisma.designation.findFirst({ where: { designationName } })
      if (nameTaken) {
        return NextResponse.json({ error: 'A designation with that name already exists.' }, { status: 409 })
      }
    }

    await prisma.designation.update({
      where: { id },
      data: { designationName, status },
    })

    return NextResponse.json('Designation updated successfully', { status: 200 })
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 })
    }
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
