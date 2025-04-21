import { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

export const authenticateUser = async (req: NextRequest) => {
  const token = req.cookies.get('token')?.value || ''

  try {
    const { payload } = await jwtVerify(token, secret)
    return { success: true, role: payload.role, email: payload.email }
  } catch {
    return { success: false, error: 'Unauthorized. Invalid or expired token.' }
  }
}
