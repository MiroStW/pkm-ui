import { supabaseAdmin } from "../db/supabase";
import { hashPassword } from "./password";

interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

/**
 * Interface for the newly created user
 */
interface NewUser {
  id: string;
}

/**
 * Registers a new user with the given credentials
 *
 * @param data User registration data
 * @returns The ID of the newly created user, or null if registration failed
 */
export async function registerUser(data: RegisterData): Promise<string | null> {
  const { email, password, name } = data;

  try {
    // First check if a user with this email already exists
    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      // User already exists with this email
      return null;
    }

    // Hash the password using our Web Crypto API implementation
    const passwordHash = await hashPassword(password);

    // Insert the new user into the database
    const { data: newUser, error: insertError } = await supabaseAdmin
      .from("users")
      .insert({
        email,
        password_hash: passwordHash,
        name: name ?? email.split("@")[0], // Default name is username from email
      })
      .select("id")
      .single<NewUser>();

    if (insertError) {
      console.error("Error inserting new user:", insertError);
      return null;
    }

    // Safely handle the return value with proper typing
    return newUser?.id ?? null;
  } catch (error) {
    console.error("Error during user registration:", error);
    return null;
  }
}
