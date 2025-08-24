// src/app/api/departments/route.ts
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

    const departments = await prisma.department.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        departmentName: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    const total = await prisma.department.count()

    return NextResponse.json({ departments, total }, { status: 200 })
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
    const { departmentName, status } = body as { departmentName?: string; status?: 'ACTIVE' | 'INACTIVE' }

    if (!departmentName || !status) {
      return NextResponse.json({ error: 'departmentName and status are required.' }, { status: 400 })
    }

    const existing = await prisma.department.findFirst({ where: { departmentName } })
    if (existing) {
      return NextResponse.json({ error: 'A department with that name already exists.' }, { status: 409 })
    }

    await prisma.department.create({
      data: { departmentName, status },
    })

    return NextResponse.json('Department created successfully', { status: 201 })
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
    const { id, departmentName, status } = body as { id?: string; departmentName?: string; status?: 'ACTIVE' | 'INACTIVE' }

    if (!id || !departmentName || !status) {
      return NextResponse.json({ error: 'id, departmentName and status are required.' }, { status: 400 })
    }

    const existing = await prisma.department.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Department not found.' }, { status: 404 })
    }

    if (departmentName !== existing.departmentName) {
      const nameTaken = await prisma.department.findFirst({ where: { departmentName } })
      if (nameTaken) {
        return NextResponse.json({ error: 'A department with that name already exists.' }, { status: 409 })
      }
    }

    await prisma.department.update({
      where: { id },
      data: { departmentName, status },
    })

    return NextResponse.json('Department updated successfully', { status: 200 })
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 })
    }
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
