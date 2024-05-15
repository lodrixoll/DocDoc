import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";
import { Session, Profile as NextAuthProfile } from "next-auth";
import GitHubProvider from "next-auth/providers/github";

// Extend the session and token models
interface ExtendedToken extends JWT {
    accessToken?: string;
    login?: string; // Add login property
}

interface ExtendedSession extends Session {
    accessToken?: string;
    login?: string; // Add login property
}

// Extend the Profile type to include the login property
interface ExtendedProfile extends NextAuthProfile {
    login?: string;
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
        async jwt({ token, account, profile }) {
            if (account) {
                const extendedToken = token as ExtendedToken;
                const extendedProfile = profile as ExtendedProfile;
                extendedToken.accessToken = account.access_token;
                extendedToken.login = extendedProfile?.login; // Add login to token
            }
            return token;
        },
        async session({ session, token }) {
            const extendedSession = session as ExtendedSession;
            const extendedToken = token as ExtendedToken;
            extendedSession.accessToken = extendedToken.accessToken;
            extendedSession.login = extendedToken.login; // Add login to session
            return extendedSession;
        },
    },
});