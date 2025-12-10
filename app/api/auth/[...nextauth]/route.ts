import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import fs from 'node:fs/promises'
import path from 'node:path'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials) return null
        const { email, password } = credentials
        if (!email || !password) return null
        try {
          const dataPath = path.join(process.cwd(), 'data', 'users.json')
          const raw = await fs.readFile(dataPath, 'utf8')
          const users = JSON.parse(raw)
          const found = users.find((u: any) => u.email === email && u.password === password)
          if (found) {
            return { id: found.id, name: found.name || found.email, email: found.email }
          }
        } catch (err) {
          console.debug('authorize error', err)
        }
        return null
      }
    })
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/' },
  secret: process.env.NEXTAUTH_SECRET || 'dev-secret'
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

// Do not export a default in App Router route file; keep only named exports.
