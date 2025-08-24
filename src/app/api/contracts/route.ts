// src/app/api/contracts/route.ts
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

    const contracts = await prisma.contract.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        contractName: true,
        sphoneNumber: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    const total = await prisma.contract.count()

    return NextResponse.json({ contracts, total }, { status: 200 })
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
    const { contractName, sphoneNumber, status } = body as {
      contractName?: string
      sphoneNumber?: string
      status?: 'ACTIVE' | 'INACTIVE'
    }

    if (!contractName || !sphoneNumber || !status) {
      return NextResponse.json({ error: 'contractName, sphoneNumber and status are required.' }, { status: 400 })
    }

    const existing = await prisma.contract.findFirst({ where: { contractName } })
    if (existing) {
      return NextResponse.json({ error: 'A contract with that name already exists.' }, { status: 409 })
    }

    await prisma.contract.create({
      data: { contractName, sphoneNumber, status },
    })

    return NextResponse.json('Contract created successfully', { status: 201 })
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
    const { id, contractName, sphoneNumber, status } = body as {
      id?: string
      contractName?: string
      sphoneNumber?: string
      status?: 'ACTIVE' | 'INACTIVE'
    }

    if (!id || !contractName || !sphoneNumber || !status) {
      return NextResponse.json({ error: 'id, contractName, sphoneNumber and status are required.' }, { status: 400 })
    }

    const existing = await prisma.contract.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Contract not found.' }, { status: 404 })
    }

    if (contractName !== existing.contractName) {
      const nameTaken = await prisma.contract.findFirst({ where: { contractName } })
      if (nameTaken) {
        return NextResponse.json({ error: 'A contract with that name already exists.' }, { status: 409 })
      }
    }

    await prisma.contract.update({
      where: { id },
      data: { contractName, sphoneNumber, status },
    })

    return NextResponse.json('Contract updated successfully', { status: 200 })
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 })
    }
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
