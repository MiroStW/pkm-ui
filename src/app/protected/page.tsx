"use client";

import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { redirect } from "next/navigation";

export default function ProtectedPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      // This will never actually be called because of our middleware,
      // but it's a good fallback just in case
      redirect("/auth/signin");
    },
  });

  // Show loading state while checking auth
  if (status === "loading") {
    return <div>Loading...</div>;
  }

  // Handler for sign out with proper redirection
  const handleSignOut = async () => {
    await signOut({
      callbackUrl: "/",
      redirect: true,
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Protected Page</h1>
      {session?.user ? (
        <div data-testid="protected-content">
          <p className="mb-2">Welcome, {session.user.name}!</p>
          <div className="user-email mb-4">
            Your email is: {session.user.email}
          </div>
          <button
            className="rounded bg-red-500 px-4 py-2 text-white"
            onClick={handleSignOut}
            data-testid="signout-button"
          >
            Sign out
          </button>
        </div>
      ) : (
        <p>You are not authorized to view this content.</p>
      )}
    </div>
  );
}
