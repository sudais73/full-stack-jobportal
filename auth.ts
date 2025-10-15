import NextAuth, { type Session, type User as NextAuthUser } from "next-auth";

import { connectDB } from "@/lib/dbConnect";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import User, { IUser } from "./models/user";

// ✅ Extend NextAuth session type globally
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
      role?: "seeker" | "employer" | null;
    };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google,
    GitHub
  ],

  callbacks: {
    // ✅ Create or update user when signing in
    async signIn({ user }: { user: NextAuthUser }) {
      await connectDB();

      // Upsert user (does not override existing fields like role)
      await User.findOneAndUpdate(
        { email: user.email },
        { name: user.name, image: user.image },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      return true;
    },

    // ✅ Add role + id into session
    async session({ session }: { session: Session }) {
      await connectDB();
      const dbUser: IUser | null = await User.findOne({ email: session.user?.email });

      if (dbUser) {
        session.user.id = dbUser._id.toString();
        session.user.role = dbUser.role || null;
      }

      return session;
    },

  
  },

  secret: process.env.AUTH_SECRET,
});
