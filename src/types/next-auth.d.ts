import 'next-auth'
import { DefaultSession, User } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
      academicSession: string
      etudiantId?: string
      enseignantId?: string
      parentId?: string
    } & DefaultSession['user']
  }

  interface User {
    id: string
    email: string
    name: string
    role: string
    academicSession: string
    etudiantId?: string
    enseignantId?: string
    parentId?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    academicSession: string
    etudiantId?: string
    enseignantId?: string
    parentId?: string
    rememberMe?: boolean
  }
}
