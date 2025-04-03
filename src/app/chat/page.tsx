import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Chat } from "@/components/chat";

export default function ChatPage() {
  return (
    <Container className="py-6">
      <h1 className="mb-6 text-3xl font-bold">Chat</h1>

      <Card className="h-[calc(100vh-12rem)]">
        <CardHeader>
          <CardTitle>Chat Interface</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[calc(100%-5rem)] flex-col p-0">
          <Chat />
        </CardContent>
      </Card>
    </Container>
  );
}
