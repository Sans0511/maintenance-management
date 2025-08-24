// src/app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authenticateUser } from '@/lib/middleware/auth'
import bcrypt from 'bcryptjs'

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

    const users = await prisma.user.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        mobileNumber: true,
        status: true,
      },
    })

    const total = await prisma.user.count()

    return NextResponse.json({ users, total }, { status: 200 })
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

    // Parse request body
    const body = await req.json()
    const {
      firstName,
      lastName,
      email,
      password,
      role,
      mobileNumber,
      status,
      designationId,
      employeeTypeId,
    } = body

    // Validate required fields
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !mobileNumber ||
      !role ||
      !status ||
      !designationId ||
      !employeeTypeId
    ) {
      return NextResponse.json(
        { error: 'All fields are required.' },
        { status: 400 }
      )
    }

    // Check if user already exists by email
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with that email already exists.' },
        { status: 409 }
      )
    }

    // Check if mobile number already exists
    const existingUserByMobileNumber = await prisma.user.findUnique({
      where: { mobileNumber },
    })
    if (existingUserByMobileNumber) {
      return NextResponse.json(
        { error: 'User with that mobile number already exists.' },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // Create the new user in the database
    await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role,
        mobileNumber,
        status,
        designation: { connect: { id: designationId } },
        employeeType: { connect: { id: employeeTypeId } },
      },
    })

    return NextResponse.json('User Created Sucessfully', { status: 201 })
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
    const { id, firstName, lastName, email, role, mobileNumber, status, employeeTypeId } = body

    if (
      !id ||
      !firstName ||
      !lastName ||
      !email ||
      !mobileNumber ||
      !role ||
      !status
    ) {
      return NextResponse.json(
        { error: 'All fields are required.' },
        { status: 400 }
      )
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

    // Prevent mobile duplication (if mobile number is being changed)
    if (mobileNumber !== existingUser.mobileNumber) {
      const mobileTaken = await prisma.user.findUnique({
        where: { mobileNumber },
      })
      if (mobileTaken) {
        return NextResponse.json(
          { error: 'User with that mobile number already exists.' },
          { status: 409 }
        )
      }
    }

    await prisma.user.update({
      where: { id },
      data: {
        firstName,
        lastName,
        email,
        role,
        mobileNumber,
        status,
        ...(employeeTypeId ? { employeeType: { connect: { id: employeeTypeId } } } : {}),
      },
    })

    return NextResponse.json('User data updated successfully', { status: 200 })
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
