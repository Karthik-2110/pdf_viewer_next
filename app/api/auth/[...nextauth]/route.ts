import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
 
const handler = NextAuth({
  providers: [
    Google({
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
})

// Export the Next.js API route handlers
export { handler as GET, handler as POST }