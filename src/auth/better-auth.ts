import { betterAuth } from 'better-auth'
import { nextCookies } from 'better-auth/next-js'

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  plugins: [
    nextCookies(),
  ],
  socialProviders: {},
})

export type Session = typeof auth.$Infer.Session
