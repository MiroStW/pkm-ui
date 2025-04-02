import type { DefaultSession, NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";
import { SupabaseAdapter } from "@auth/supabase-adapter";
import { supabase } from "../db/supabase";
import { verifyPassword } from "./password";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    } & DefaultSession["user"];
  }
}

// Add custom properties to JWT token
declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
  }
}

// Define the user type from the database
interface SupabaseUser {
  id: string;
  email: string;
  password_hash: string;
  name?: string | null;
}

// Check if we're in test mode
const isTestMode = process.env.USE_MOCK_SUPABASE === "true";

// Test user for development/testing (only used in test mode)
const TEST_USER = {
  id: "test-user-id",
  email: "test@example.com",
  password: "password",
  name: "Test User",
};

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig: NextAuthConfig = {
  // Use the Supabase adapter
  adapter: SupabaseAdapter({
    url: process.env.SUPABASE_URL ?? "",
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  }),

  // Configure cookie options for better security
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  // Use the JWT strategy for sessions
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Better error and redirect handling
  callbacks: {
    jwt({ token, user }) {
      // If the user is authenticated, add the user ID to the token
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      // Add user id from token to the session
      if (token.id) {
        session.user.id = token.id;
      } else if (token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    redirect({ url, baseUrl }) {
      // Allow redirects to the same site
      if (url.startsWith("/") || url.startsWith(baseUrl)) {
        return url;
      }
      // Redirect to homepage for external URLs for security
      return baseUrl;
    },
  },

  // Configure the providers
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Validate credentials with Zod schema
        const parsedCredentials = z
          .object({
            email: z.string().email(),
            password: z.string().min(6),
          })
          .safeParse(credentials);

        if (!parsedCredentials.success) {
          console.log("Invalid credentials format");
          return null;
        }

        const { email, password } = parsedCredentials.data;

        // For testing - allow test user to sign in if in test mode
        if (
          isTestMode &&
          email === TEST_USER.email &&
          password === TEST_USER.password
        ) {
          console.log("Test mode: Test user authenticated");
          return {
            id: TEST_USER.id,
            name: TEST_USER.name,
            email: TEST_USER.email,
          };
        }

        try {
          // Query Supabase for the user
          const { data, error } = await supabase
            .from("users")
            .select("id, email, password_hash, name")
            .eq("email", email)
            .single();

          if (error || !data) {
            console.log("User not found");
            return null;
          }

          const user = data as SupabaseUser;

          // Verify the password using our Web Crypto API implementation
          const isPasswordValid = await verifyPassword(
            password,
            user.password_hash,
          );

          if (!isPasswordValid) {
            console.log("Invalid password");
            return null;
          }

          // Return the user details
          return {
            id: user.id,
            name: user.name ?? email.split("@")[0], // Use name if available, otherwise username from email
            email: user.email,
          };
        } catch (error) {
          console.error("Error during authentication:", error);
          return null;
        }
      },
    }),
  ],

  // Custom pages
  pages: {
    signIn: "/auth/signin",
    signOut: "/",
    error: "/auth/error",
  },

  // Debugging in development
  debug: process.env.NODE_ENV !== "production",
};
