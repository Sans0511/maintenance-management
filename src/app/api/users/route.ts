// src/app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authenticateUser } from '@/lib/middleware/auth'
import bcrypt from 'bcryptjs'
import type { Prisma } from '@prisma/client'

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

    // Use raw aggregation to safely exclude documents with null employeeId and join employee fields
    const pipeline: Prisma.InputJsonValue[] = [
      { $match: { employeeId: { $ne: null } } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'Employee',
          localField: 'employeeId',
          foreignField: '_id',
          as: 'employee',
        },
      },
      { $unwind: { path: '$employee', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          id: { $toString: '$_id' },
          email: 1,
          role: 1,
          status: 1,
          employeeId: { $toString: '$employeeId' },
          firstName: '$employee.employeeFirstName',
          lastName: '$employee.employeeLastName',
          mobileNumber: '$employee.phoneNo',
        },
      },
    ]

    type UserAggRow = {
      id: string
      email: string
      role: 'USER' | 'ADMIN'
      status: 'ACTIVE' | 'INACTIVE'
      employeeId: string
      firstName?: string | null
      lastName?: string | null
      mobileNumber?: string | null
    }

    const usersAgg = (await prisma.user.aggregateRaw({ pipeline })) as unknown as UserAggRow[]

    const countAgg = (await prisma.user.aggregateRaw({
      pipeline: [
        { $match: { employeeId: { $ne: null } } },
        { $count: 'total' },
      ],
    })) as unknown as { total: number }[]

    const total = countAgg?.[0]?.total ?? 0

    const shaped = usersAgg.map((u: UserAggRow) => ({
      id: u.id,
      employeeId: u.employeeId,
      firstName: u.firstName ?? '',
      lastName: u.lastName ?? '',
      email: u.email,
      role: u.role,
      mobileNumber: u.mobileNumber ?? '',
      status: u.status,
    }))
    return NextResponse.json({ users: shaped, total }, { status: 200 })
  } catch (err: unknown) {
    console.error('GET /api/users failed:', err)
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

    // Parse request body
    const body = await req.json()
    const { email, password, role, status, employeeId } = body as {
      email?: string; password?: string; role?: 'USER' | 'ADMIN'; status?: 'ACTIVE' | 'INACTIVE'; employeeId?: string
    }

    // Validate required fields
    if (!email || !password || !role || !status || !employeeId) {
      return NextResponse.json({ error: 'email, password, role, status, employeeId are required.' }, { status: 400 })
    }

    // Check if user already exists by email
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with that email already exists.' },
        { status: 409 }
      )
    }

    // Ensure employee exists
    const employee = await prisma.employee.findUnique({ where: { id: employeeId } })
    if (!employee) {
      return NextResponse.json({ error: 'Employee not found.' }, { status: 404 })
    }

    // Ensure employee not already linked to a user
    const existingByEmployee = await prisma.user.findUnique({ where: { employeeId } })
    if (existingByEmployee) {
      return NextResponse.json({ error: 'A user for this employee already exists.' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // Create the new user in the database
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        status,
        employee: { connect: { id: employeeId } },
      },
    })

    return NextResponse.json('User Created Sucessfully', { status: 201 })
  } catch (err: unknown) {
    console.error('POST /api/users failed:', err)
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
    const { id, email, role, status, employeeId } = body as {
      id?: string; email?: string; role?: 'USER' | 'ADMIN'; status?: 'ACTIVE' | 'INACTIVE'; employeeId?: string
    }

    if (!id || !email || !role || !status) {
      return NextResponse.json({ error: 'id, email, role, status are required.' }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { id } })
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 })
    }

    // Prevent email duplication (if email is being changed)
    if (email !== existingUser.email) {
      const emailTaken = await prisma.user.findUnique({ where: { email } })
      if (emailTaken) {
        return NextResponse.json(
          { error: 'User with that email already exists.' },
          { status: 409 }
        )
      }
    }

    // Optionally change linked employee
    if (employeeId && employeeId !== existingUser.employeeId) {
      const employee = await prisma.employee.findUnique({ where: { id: employeeId } })
      if (!employee) {
        return NextResponse.json({ error: 'Employee not found.' }, { status: 404 })
      }
      const userForEmployee = await prisma.user.findUnique({ where: { employeeId } })
      if (userForEmployee && userForEmployee.id !== id) {
        return NextResponse.json({ error: 'Another user is already linked to this employee.' }, { status: 409 })
      }
    }

    await prisma.user.update({
      where: { id },
      data: {
        email,
        role,
        status,
        ...(employeeId ? { employee: { connect: { id: employeeId } } } : {}),
      },
    })

    return NextResponse.json('User data updated successfully', { status: 200 })
  } catch (err: unknown) {
    console.error('PATCH /api/users failed:', err)
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 })
    }
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    )
  }
}
