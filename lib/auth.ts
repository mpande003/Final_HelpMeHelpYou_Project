import bcrypt from "bcryptjs";
import { getServerSession, type Session } from "next-auth";
import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getUserByUsername } from "./users";

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const username = credentials?.username?.trim().toLowerCase();
        const password = credentials?.password;

        if (!username || !password) {
          return null;
        }

        // ✅ FIX: add await
        const user = await getUserByUsername(username);

        if (!user) return null;
        if (user.status !== "active") return null;

        const passwordMatches = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatches) return null;

        return {
          id: String(user.id),
          name: user.username,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = typeof token.role === "string" ? token.role : "";
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export async function requireActiveAdminSession() {
  const session = await getServerSession(authOptions);
  const username = session?.user?.name?.trim().toLowerCase();

  if (!username) {
    throw new Error("Unauthorized");
  }

  // ✅ FIX: add await
  const user = await getUserByUsername(username);

  if (!user || user.status !== "active" || user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const activeSession = session as Session & {
    user: NonNullable<Session["user"]> & { name: string };
  };

  return {
    session: activeSession,
    user,
  };
}