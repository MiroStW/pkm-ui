"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useUserSettings } from "@/lib/hooks/useUserSettings";
import { toast } from "@/components/ui/toast";

export default function SettingsPage() {
  const { settings, isLoading, updateSettings } = useUserSettings();

  const handleSyncSettingChange = async (
    setting: "sync_chat_history" | "sync_settings" | "continue_conversations",
    checked: boolean,
  ) => {
    try {
      await updateSettings({ [setting]: checked });
      toast({
        title: "Settings Updated",
        description: "Your synchronization preferences have been saved.",
      });
    } catch (error) {
      console.error(
        `Error updating ${setting}:`,
        error instanceof Error ? error.message : "Unknown error",
      );
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Container className="py-6">
      <h1 className="mb-6 text-3xl font-bold">Settings</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize how the application looks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Theme</label>
                <p className="text-muted-foreground text-sm">
                  Choose between light, dark, or system theme
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Synchronization</CardTitle>
            <CardDescription>
              Manage cross-device synchronization settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <div>
                  <Label
                    htmlFor="sync-chat-history"
                    className="text-sm font-medium"
                  >
                    Sync Chat History
                  </Label>
                  <p className="text-muted-foreground text-sm">
                    Allow access to your chat history across all your devices
                  </p>
                </div>
                <Switch
                  id="sync-chat-history"
                  checked={!!settings.sync_chat_history}
                  disabled={isLoading}
                  onCheckedChange={(checked: boolean) =>
                    handleSyncSettingChange("sync_chat_history", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <div>
                  <Label
                    htmlFor="sync-settings"
                    className="text-sm font-medium"
                  >
                    Sync Settings
                  </Label>
                  <p className="text-muted-foreground text-sm">
                    Keep your application settings in sync between devices
                  </p>
                </div>
                <Switch
                  id="sync-settings"
                  checked={!!settings.sync_settings}
                  disabled={isLoading}
                  onCheckedChange={(checked: boolean) =>
                    handleSyncSettingChange("sync_settings", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <div>
                  <Label
                    htmlFor="continue-conversations"
                    className="text-sm font-medium"
                  >
                    Continue Conversations
                  </Label>
                  <p className="text-muted-foreground text-sm">
                    Pick up conversations where you left off on other devices
                  </p>
                </div>
                <Switch
                  id="continue-conversations"
                  checked={!!settings.continue_conversations}
                  disabled={isLoading}
                  onCheckedChange={(checked: boolean) =>
                    handleSyncSettingChange("continue_conversations", checked)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Manage your account settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <p className="text-muted-foreground text-sm">
                  Your account email address
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Password</label>
                <p className="text-muted-foreground text-sm">
                  Change your account password
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Manage how you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  Email Notifications
                </label>
                <p className="text-muted-foreground text-sm">
                  Receive email notifications for important updates
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
