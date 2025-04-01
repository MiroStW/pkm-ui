"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/server/auth"; // Use the server-side signIn
import { redirect } from "next/navigation";

// Type guard for Error objects with a cause
function hasErrorCause(
  error: unknown,
): error is { cause: { message: string } } {
  return (
    typeof error === "object" &&
    error !== null &&
    "cause" in error &&
    typeof error.cause === "object" &&
    error.cause !== null &&
    "message" in error.cause &&
    typeof error.cause.message === "string"
  );
}

// Define the expected result type from signIn
interface SignInResult {
  error: string | null;
  status: number;
  ok: boolean;
  url: string | null;
}

export async function authenticate(
  _prevState: string | undefined, // Marked as unused
  formData: FormData,
) {
  const callbackUrl = (formData.get("callbackUrl") as string) ?? "/";

  try {
    const result = (await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirect: false, // We'll handle redirects manually
    })) as SignInResult | undefined;

    // Check if sign-in was successful
    if (!result || result.error) {
      return result?.error === "CredentialsSignin"
        ? "Invalid email or password. Please try again."
        : `Authentication error: ${result?.error ?? "Unknown error"}`;
    }

    // Successful authentication - redirect to the specified URL or home
    redirect(callbackUrl);
  } catch (error) {
    // Handle known NextAuth errors
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid email or password. Please try again.";
        case "AccessDenied":
          return "Access denied. You don't have permission to access this resource.";
        case "CallbackRouteError":
          // Check if this is a redirect using our type guard
          if (
            hasErrorCause(error) &&
            error.cause.message.includes("NEXT_REDIRECT")
          ) {
            // This is actually not an error but a redirect
            throw error;
          }
          return "There was a problem with the authentication callback.";
        default:
          return `Authentication error: ${error.type}`;
      }
    }

    // If this is a redirect, allow it to proceed
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }

    // Fallback error message
    console.error("Authentication error:", error);
    return "An unexpected error occurred. Please try again later.";
  }
}
