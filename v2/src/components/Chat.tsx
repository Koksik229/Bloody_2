import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: number;
  text: string;
  sender: "user" | "system";
  timestamp: Date;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Добро пожаловать в игру!",
      sender: "system",
      timestamp: new Date(),
    },
    {
      id: 2,
      text: "Проверьте свой инвентарь",
      sender: "system",
      timestamp: new Date(),
    },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([
        ...messages,
        {
          id: messages.length + 1,
          text: newMessage,
          sender: "user",
          timestamp: new Date(),
        },
      ]);
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="h-full bg-gradient-to-b from-bw-card-bg to-bw-dark-bg border border-bw-border rounded-lg shadow-lg flex flex-col">
      <div className="p-3 border-b border-bw-border">
        <h3 className="text-bw-accent-gold font-semibold text-sm">Чат</h3>
      </div>

      <ScrollArea className="flex-1 p-3">
        <div className="space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`text-sm ${
                message.sender === "user" ? "text-right" : "text-left"
              }`}
            >
              <div
                className={`inline-block max-w-xs px-3 py-2 rounded-lg ${
                  message.sender === "user"
                    ? "bg-bw-accent-gold text-bw-dark-bg"
                    : "bg-bw-muted text-bw-text-on-dark"
                }`}
              >
                <div className="text-xs opacity-70 mb-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
                <div>{message.text}</div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-bw-border flex space-x-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Введите сообщение..."
          className="bg-bw-input border-bw-border text-bw-text-on-dark placeholder:text-bw-muted rounded-md"
        />
        <Button
          onClick={handleSendMessage}
          size="sm"
          className="bg-bw-accent-gold hover:bg-bw-accent-gold/80 text-bw-dark-bg shadow-md"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Chat;
