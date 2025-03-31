"use server";

import { signIn } from "~/server/auth"; // Use the server-side signIn

export async function authenticate(
  _prevState: string | undefined, // Marked as unused
  formData: FormData,
) {
  try {
    await signIn("credentials", formData);
    // If signIn succeeds without throwing, NextAuth.js handles the redirect internally
    return undefined;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("NEXT_REDIRECT")) {
        throw error;
      }
    }
    throw error;
  }
}
