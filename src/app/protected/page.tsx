"use client";

import { signOut, useSession } from "next-auth/react";

export default function ProtectedPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    // This should theoretically not be reached if middleware is set up correctly,
    // but it's good practice to handle it.
    return <p>Access Denied. You need to be signed in.</p>;
  }

  return (
    <div>
      <h1>Protected Page</h1>
      <p>Welcome, {session?.user?.name ?? "User"}!</p>
      <p>Your email is: {session?.user?.email}</p>
      <p>
        This page is protected and can only be accessed by authenticated users.
      </p>
      <button onClick={() => signOut({ callbackUrl: "/" })}>Sign Out</button>
    </div>
  );
}
