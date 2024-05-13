import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";
import GitHubProvider from "next-auth/providers/github";

// Extend the session and token models
interface ExtendedToken extends JWT {
    accessToken?: string;
}

interface ExtendedSession extends Session {
    accessToken?: string;
}

if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
    throw new Error("GitHub client ID or secret is undefined. Check your environment variables.");
}

export default NextAuth({
    providers: [
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
            authorization: {
                params: {
                    scope: 'repo, user',
                },
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, account }) {
            if (account) {
                const extendedToken = token as ExtendedToken;
                extendedToken.accessToken = account.access_token;
            }
            return token;
        },
        async session({ session, token }) {
            const extendedSession = session as ExtendedSession;
            const extendedToken = token as ExtendedToken;
            extendedSession.accessToken = extendedToken.accessToken;
            return extendedSession;
        },
    },
});