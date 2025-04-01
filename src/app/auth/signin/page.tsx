"use client";

import { useFormStatus } from "react-dom";
import { authenticate } from "~/app/auth/actions";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import Link from "next/link";

// Separate component for the submit button to use useFormStatus
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      aria-disabled={pending}
      className="w-full rounded bg-blue-600 p-2 text-white transition hover:bg-blue-700 disabled:bg-blue-400"
      disabled={pending}
    >
      {pending ? "Signing In..." : "Sign In"}
    </button>
  );
}

export default function SignInPage() {
  const [errorMessage, dispatch] = useActionState(authenticate, undefined);
  const router = useRouter();
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const isNewlyRegistered = searchParams.get("registered") === "true";
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  // Handle session state changes
  useEffect(() => {
    if (session && status === "authenticated") {
      router.push(callbackUrl);
    }
  }, [session, status, router, callbackUrl]);

  // Don't render form if already authenticated
  if (session) {
    return (
      <div className="container mx-auto max-w-md p-4">
        <div className="text-center">Redirecting...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-md p-4">
      <h1 className="mb-6 text-center text-2xl font-bold">Sign In</h1>

      {isNewlyRegistered && (
        <div className="mb-4 rounded bg-green-100 p-3 text-green-700">
          Your account has been created successfully! Please sign in.
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 rounded bg-red-100 p-3 text-red-700">
          {errorMessage}
        </div>
      )}

      {/* The form now uses the server action via the dispatch function */}
      <form action={dispatch} className="space-y-4">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="your@email.com"
            required
            className="w-full rounded border border-gray-300 p-2"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            name="password"
            placeholder="Your password"
            required
            className="w-full rounded border border-gray-300 p-2"
          />
        </div>
        <SubmitButton />
      </form>

      <div className="mt-4 text-center">
        Don&apos;t have an account?{" "}
        <Link href="/auth/register" className="text-blue-600 hover:underline">
          Register
        </Link>
      </div>
    </div>
  );
}
