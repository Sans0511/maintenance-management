// src/app/api/employees/route.ts
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

    const employees = await prisma.employee.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        employeeId: true,
        employeeFirstName: true,
        employeeLastName: true,
        departmentId: true,
        designationId: true,
        employeeTypeId: true,
        contractId: true,
        phoneNo: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        department: { select: { departmentName: true } },
        designation: { select: { designationName: true } },
        employeeType: { select: { employeeTypeName: true } },
        contract: { select: { contractName: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const total = await prisma.employee.count()

    const mapped = employees.map(e => ({
      ...e,
      departmentName: e.department?.departmentName,
      designationName: e.designation?.designationName,
      employeeTypeName: e.employeeType?.employeeTypeName,
      contractName: e.contract?.contractName,
    }))

    return NextResponse.json({ employees: mapped, total }, { status: 200 })
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
    const { employeeId, employeeFirstName, employeeLastName, departmentId, designationId, employeeTypeId, contractId, phoneNo, status } = body as {
      employeeId?: string; employeeFirstName?: string; employeeLastName?: string; departmentId?: string; designationId?: string; employeeTypeId?: string; contractId?: string; phoneNo?: string; status?: 'ACTIVE' | 'INACTIVE'
    }

    if (!employeeFirstName || !employeeLastName || !designationId || !employeeTypeId || !phoneNo || !status) {
      return NextResponse.json({ error: 'employeeFirstName, employeeLastName, designationId, employeeTypeId, phoneNo, status are required.' }, { status: 400 })
    }

    const orConds = [{ phoneNo } as { phoneNo: string }]
    if (employeeId) orConds.push({ employeeId } as { employeeId: string })
    const dup = await prisma.employee.findFirst({ where: { OR: orConds } })
    if (dup) {
      return NextResponse.json({ error: 'Employee with same ID or phone already exists.' }, { status: 409 })
    }

    await prisma.employee.create({
      data: { employeeId: employeeId || null as any, employeeFirstName, employeeLastName, departmentId: departmentId || null as any, designationId, employeeTypeId, contractId: contractId || null as any, phoneNo, status },
    })

    return NextResponse.json('Employee created successfully', { status: 201 })
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
    const { id, employeeId, employeeFirstName, employeeLastName, departmentId, designationId, employeeTypeId, contractId, phoneNo, status } = body as {
      id?: string; employeeId?: string; employeeFirstName?: string; employeeLastName?: string; departmentId?: string; designationId?: string; employeeTypeId?: string; contractId?: string; phoneNo?: string; status?: 'ACTIVE' | 'INACTIVE'
    }

    if (!id || !employeeFirstName || !employeeLastName || !designationId || !employeeTypeId || !phoneNo || !status) {
      return NextResponse.json({ error: 'id, employeeFirstName, employeeLastName, designationId, employeeTypeId, phoneNo, status are required.' }, { status: 400 })
    }

    const existing = await prisma.employee.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Employee not found.' }, { status: 404 })
    }

    if ((employeeId && employeeId !== existing.employeeId) || phoneNo !== existing.phoneNo) {
      const orConds = [{ phoneNo } as { phoneNo: string }]
      if (employeeId) orConds.push({ employeeId } as { employeeId: string })
      const dupe = await prisma.employee.findFirst({ where: { OR: orConds, NOT: { id } } })
      if (dupe) {
        return NextResponse.json({ error: 'Employee with same ID or phone already exists.' }, { status: 409 })
      }
    }

    await prisma.employee.update({
      where: { id },
      data: { employeeId: employeeId ?? null as any, employeeFirstName, employeeLastName, departmentId: departmentId ?? null as any, designationId, employeeTypeId, contractId: contractId ?? null as any, phoneNo, status },
    })

    return NextResponse.json('Employee updated successfully', { status: 200 })
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 })
    }
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
