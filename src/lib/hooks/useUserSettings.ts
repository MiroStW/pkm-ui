"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

type UserSettings = {
  sync_chat_history: boolean;
  sync_settings: boolean;
  continue_conversations: boolean;
};

type UpdateUserSettings = Partial<UserSettings>;

export function useUserSettings() {
  const { data: session } = useSession();
  const [settings, setSettings] = useState<UserSettings>({
    sync_chat_history: true,
    sync_settings: true,
    continue_conversations: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch settings on mount and when session changes
  useEffect(() => {
    async function fetchSettings() {
      if (!session?.user?.id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/settings");

        if (!response.ok) {
          throw new Error("Failed to fetch settings");
        }

        const data = (await response.json()) as UserSettings;
        setSettings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching settings:", err);
      } finally {
        setIsLoading(false);
      }
    }

    void fetchSettings();
  }, [session?.user?.id]);

  // Update settings
  const updateSettings = async (updatedSettings: UpdateUserSettings) => {
    if (!session?.user?.id) {
      return;
    }

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedSettings),
      });

      if (!response.ok) {
        throw new Error("Failed to update settings");
      }

      const updatedData = (await response.json()) as UserSettings;
      setSettings(updatedData);
      return updatedData;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error updating settings:", err);
      throw err;
    }
  };

  return {
    settings,
    isLoading,
    error,
    updateSettings,
  };
}
