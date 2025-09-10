import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { MongoDBAdapter } from '@auth/mongodb-adapter'
import { MongoClient } from 'mongodb'

const client = new MongoClient(process.env.MONGODB_URI)
const clientPromise = client.connect()

export const authOptions = {
    adapter: MongoDBAdapter(clientPromise),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })
    ],
    session: {
        strategy: 'database',
    },
    callbacks: {
        async session({ session, user }) {
            session.user.id = user.id
            return session
        },
    },
    pages: {
        signIn: '/auth/signin',
    }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
