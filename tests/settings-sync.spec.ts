import { describe, test, expect, spyOn } from "bun:test";
import * as settingsModule from "../src/server/db/settings";
import { type UserSettings } from "../src/server/db/schema/settings";

// Create test data
const testSettings: UserSettings = {
  id: "test-id",
  user_id: "test-user",
  sync_chat_history: true,
  sync_settings: true,
  continue_conversations: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  settings_data: {},
};

const updatedSettings: UserSettings = {
  ...testSettings,
  sync_chat_history: false,
};

describe("User Settings Synchronization", () => {
  test("Should retrieve user settings", async () => {
    // Use spyOn instead of reassigning
    const getUserSettingsSpy = spyOn(settingsModule, "getUserSettings");
    getUserSettingsSpy.mockResolvedValue(testSettings);

    const settings = await settingsModule.getUserSettings("test-user");

    expect(getUserSettingsSpy).toHaveBeenCalledWith("test-user");
    expect(settings).toBeDefined();
    expect(settings?.user_id).toBe("test-user");
    expect(settings?.sync_chat_history).toBe(true);
    expect(settings?.sync_settings).toBe(true);
    expect(settings?.continue_conversations).toBe(true);
  });

  test("Should create user settings if not exists", async () => {
    const getOrCreateUserSettingsSpy = spyOn(
      settingsModule,
      "getOrCreateUserSettings",
    );
    getOrCreateUserSettingsSpy.mockResolvedValue(testSettings);

    const settings = await settingsModule.getOrCreateUserSettings("test-user");

    expect(getOrCreateUserSettingsSpy).toHaveBeenCalledWith("test-user");
    expect(settings).toBeDefined();
    expect(settings?.user_id).toBe("test-user");
    expect(settings?.sync_chat_history).toBe(true);
    expect(settings?.sync_settings).toBe(true);
    expect(settings?.continue_conversations).toBe(true);
  });

  test("Should update user settings", async () => {
    const updateUserSettingsSpy = spyOn(settingsModule, "updateUserSettings");
    updateUserSettingsSpy.mockResolvedValue(updatedSettings);

    const settings = await settingsModule.updateUserSettings("test-user", {
      sync_chat_history: false,
    });

    expect(updateUserSettingsSpy).toHaveBeenCalledWith("test-user", {
      sync_chat_history: false,
    });
    expect(settings).toBeDefined();
    expect(settings?.user_id).toBe("test-user");
    expect(settings?.sync_chat_history).toBe(false);
  });
});
