import NextAuth from "next-auth";
import { authConfig } from "./auth/config";

// Configure NextAuth with the auth config
// bcrypt can only be used in Node.js environment, not Edge Runtime
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
