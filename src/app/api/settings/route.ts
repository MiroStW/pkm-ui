import { type NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import {
  getOrCreateUserSettings,
  updateUserSettings,
} from "@/server/db/settings";

// Define type for settings update
type SettingsUpdate = {
  sync_chat_history?: boolean;
  sync_settings?: boolean;
  continue_conversations?: boolean;
};

// Define type for request body
interface RequestBody {
  sync_chat_history?: boolean;
  sync_settings?: boolean;
  continue_conversations?: boolean;
  [key: string]: unknown;
}

// GET handler to fetch user settings
export async function GET(request: NextRequest) {
  // Verify authentication
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });

  if (!token?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get or create user settings
    const settings = await getOrCreateUserSettings(token.sub);

    // Return only the client-side relevant settings (not the full DB record)
    return NextResponse.json({
      sync_chat_history: settings.sync_chat_history,
      sync_settings: settings.sync_settings,
      continue_conversations: settings.continue_conversations,
    });
  } catch (error) {
    console.error("Error fetching user settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 },
    );
  }
}

// PUT handler to update user settings
export async function PUT(request: NextRequest) {
  // Verify authentication
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });

  if (!token?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Parse the request body with explicit typing
    const body = (await request.json()) as RequestBody;

    // Validate the payload
    const allowedFields = [
      "sync_chat_history",
      "sync_settings",
      "continue_conversations",
    ];
    const updates: SettingsUpdate = {};

    for (const field of allowedFields) {
      if (field in body && typeof body[field] === "boolean") {
        // We need keyof SettingsUpdate to make TypeScript happy
        updates[field as keyof SettingsUpdate] = body[field];
      }
    }

    // Update the user settings
    const updatedSettings = await updateUserSettings(token.sub, updates);

    // Return only the client-side relevant settings
    return NextResponse.json({
      sync_chat_history: updatedSettings.sync_chat_history,
      sync_settings: updatedSettings.sync_settings,
      continue_conversations: updatedSettings.continue_conversations,
    });
  } catch (error) {
    console.error("Error updating user settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 },
    );
  }
}
