import { NextResponse, type NextRequest } from "next/server";
import { registerUser } from "~/server/auth/register";
import { z } from "zod";
import { rateLimit } from "~/server/api/limiter";

// Schema for user registration
const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters"),
  name: z.string().optional(),
});

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = rateLimit(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    // Parse the request body and treat it as unknown for type safety
    const body: unknown = await request.json();

    // Validate input
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.errors },
        { status: 400 },
      );
    }

    const { email, password, name } = validationResult.data;

    // Register the user
    const userId = await registerUser({ email, password, name });

    if (!userId) {
      return NextResponse.json(
        { error: "Email already in use or registration failed" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { success: true, message: "User registered successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
