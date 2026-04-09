import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./db";
import bcrypt from "bcryptjs";
import { normalizePhoneDigits } from "./phone";

function parseLoginIdentifier(raw: string): { kind: "email"; email: string } | { kind: "phone"; phone: string } | null {
  const t = raw.trim();
  if (!t) return null;
  if (t.includes("@")) {
    return { kind: "email", email: t.toLowerCase() };
  }
  const phone = normalizePhoneDigits(t);
  if (!phone) return null;
  return { kind: "phone", phone };
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        identifier: { label: "Phone or email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const idRaw = credentials?.identifier?.trim();
        const password = credentials?.password;
        if (!idRaw || !password) return null;

        const parsed = parseLoginIdentifier(idRaw);
        if (!parsed) return null;

        const user =
          parsed.kind === "email"
            ? await prisma.user.findUnique({ where: { email: parsed.email } })
            : await prisma.user.findUnique({ where: { phone: parsed.phone } });

        if (!user || !user.passwordHash || user.isBlocked) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email ?? undefined,
          name: user.name ?? undefined,
          image: user.image ?? undefined,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user?.id || typeof user.id !== "string") return true;
      const u = await prisma.user.findUnique({
        where: { id: user.id },
        select: { emailVerified: true, email: true, phoneVerified: true },
      });
      if (!u) return false;
      if (u.phoneVerified || u.emailVerified) return true;
      if (u.email) {
        const q = `&email=${encodeURIComponent(u.email)}`;
        return `/login?error=VerifyEmail${q}`;
      }
      return `/login?error=Unverified`;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      if (token.id && typeof token.id === "string") {
        const u = await prisma.user.findUnique({
          where: { id: token.id },
          select: { role: true },
        });
        if (u) token.role = u.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "USER" | "ADMIN";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};
