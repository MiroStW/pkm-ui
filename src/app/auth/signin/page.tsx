"use client";

import { useFormStatus } from "react-dom";
import { authenticate } from "~/app/auth/actions"; // Corrected import path
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";

// Separate component for the submit button to use useFormStatus
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      aria-disabled={pending}
      style={{ padding: "10px 15px", cursor: pending ? "wait" : "pointer" }}
    >
      {pending ? "Signing In..." : "Sign In"}
    </button>
  );
}

export default function SignInPage() {
  // useFormState takes the action and initial state
  const [errorMessage, dispatch] = useActionState(authenticate, undefined);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    // Redirect if already logged in (session check still useful)
    if (session) {
      // Redirect logic depends on your desired flow. Often handled by middleware now.
      // Let's redirect to home as a fallback/client-side check.
      router.push("/");
    }
  }, [session, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  // Don't render form if already authenticated
  if (session) {
    return null;
  }

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "50px auto",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
      }}
    >
      <h1>Sign In</h1>
      {/* The form now uses the server action via the dispatch function */}
      <form action={dispatch}>
        <div style={{ marginBottom: "15px" }}>
          <label
            htmlFor="username"
            style={{ display: "block", marginBottom: "5px" }}
          >
            Username
          </label>
          <input
            id="username"
            type="text"
            name="username" // IMPORTANT: name attribute must match credentials object keys
            placeholder="jsmith (Hint: test)"
            required
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label
            htmlFor="password"
            style={{ display: "block", marginBottom: "5px" }}
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            name="password" // IMPORTANT: name attribute must match credentials object keys
            placeholder="(Hint: password)"
            required
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          />
        </div>
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
        <SubmitButton />
      </form>
    </div>
  );
}
