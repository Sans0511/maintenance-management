import { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

export const authenticateUser = async (req: NextRequest) => {
  const token = req.cookies.get('token')?.value || ''

  try {
    const secretEnv = process.env.JWT_SECRET
    if (!secretEnv) {
      console.error('JWT_SECRET is not set')
      return { success: false, error: 'Unauthorized. Invalid or expired token.' }
    }
    const secret = new TextEncoder().encode(secretEnv)

    const { payload } = await jwtVerify(token, secret)
    return { success: true, role: payload.role as string, email: payload.email as string }
  } catch (e) {
    console.error('Auth verify failed:', e)
    return { success: false, error: 'Unauthorized. Invalid or expired token.' }
  }
}
