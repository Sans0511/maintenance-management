// src/app/api/employee-types/route.ts
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

    const employeeTypes = await prisma.employeeType.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        employeeTypeName: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    const total = await prisma.employeeType.count()

    return NextResponse.json({ employeeTypes, total }, { status: 200 })
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
    const { employeeTypeName, status } = body as { employeeTypeName?: string; status?: 'ACTIVE' | 'INACTIVE' }

    if (!employeeTypeName || !status) {
      return NextResponse.json({ error: 'employeeTypeName and status are required.' }, { status: 400 })
    }

    const existing = await prisma.employeeType.findFirst({ where: { employeeTypeName } })
    if (existing) {
      return NextResponse.json({ error: 'An employee type with that name already exists.' }, { status: 409 })
    }

    const data = { employeeTypeName, status }
    await prisma.employeeType.create({
      data,
    })

    return NextResponse.json('Employee Type created successfully', { status: 201 })
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
    const { id, employeeTypeName, status } = body as { id?: string; employeeTypeName?: string; status?: 'ACTIVE' | 'INACTIVE' }

    if (!id || !employeeTypeName || !status) {
      return NextResponse.json({ error: 'id, employeeTypeName and status are required.' }, { status: 400 })
    }

    const existing = await prisma.employeeType.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Employee Type not found.' }, { status: 404 })
    }

    if (employeeTypeName !== existing.employeeTypeName) {
      const nameTaken = await prisma.employeeType.findFirst({ where: { employeeTypeName } })
      if (nameTaken) {
        return NextResponse.json({ error: 'An employee type with that name already exists.' }, { status: 409 })
      }
    }

    const data = { employeeTypeName, status }
    await prisma.employeeType.update({
      where: { id },
      data,
    })

    return NextResponse.json('Employee Type updated successfully', { status: 200 })
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 })
    }
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
