import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/middleware/auth'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateUser(req)

    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized. Invalid or expired token.' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const skip = parseInt(searchParams.get('skip') || '0')
    const limit = parseInt(searchParams.get('limit') || '10')

    let whereClause = {}

    if (authResult.role === 'USER') {
      whereClause = {
        assignedTo: {
          email: authResult.email,
        },
      }
    }

    const [assetAssignments, total] = await Promise.all([
      prisma.assetAssignment.findMany({
        skip,
        take: limit,
        where: whereClause,
        orderBy: [{ isReturn: 'asc' }, { createdAt: 'desc' }],
        include: {
          assignedTo: {
            select: { id: true, email: true },
          },
          assignedAsset: {
            select: { id: true, assetName: true, serialNumber: true },
          },
        },
      }),

      prisma.assetAssignment.count({ where: whereClause }),
    ])

    return NextResponse.json({ assetAssignments, total }, { status: 200 })
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
        { error: 'Unauthorized. Admin role required.' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { userId, assetId, issueDate } = body

    // Ensure required fields are present
    if (!userId || !assetId || !issueDate) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, assetId, issueDate' },
        { status: 400 }
      )
    }

    const newAssetAssignment = await prisma.assetAssignment.create({
      data: {
        userId,
        assetId,
        issueDate: new Date(issueDate),
        isReturn: false,
      },
    })

    return NextResponse.json(newAssetAssignment, { status: 201 })
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

    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin role required.' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { id, returnReason } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      )
    }

    const updatedAssignment = await prisma.assetAssignment.update({
      where: { id },
      data: {
        isReturn: true,
        returnReason: returnReason ?? undefined,
        returnDate: new Date(),
      },
    })

    return NextResponse.json(updatedAssignment, { status: 200 })
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
