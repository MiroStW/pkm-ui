import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

export default function ChatPage() {
  return (
    <Container className="py-6">
      <h1 className="mb-6 text-3xl font-bold">Chat</h1>

      <Card className="h-[calc(100vh-12rem)]">
        <CardHeader>
          <CardTitle>Chat Interface</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[calc(100%-5rem)] flex-col">
          <div className="flex-1 overflow-y-auto">
            <p className="text-muted-foreground py-8 text-center">
              Your chat messages will appear here
            </p>
          </div>
          <div className="border-t pt-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type your message..."
                className="min-w-0 flex-1 rounded-md border px-3 py-2"
              />
              <button className="bg-primary text-primary-foreground rounded-md px-4 py-2">
                Send
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}
