import React, { useState, useEffect } from "react";

interface Message {
  sender_id: string;
  chat_session_id: string;
  message: string;
  created_at: string;
}

interface ChatConversationProps {
  chatSessionId: string;
  onChatSessionSelected?: (chatSessionId: string) => void;
}

const ChatConversation: React.FC<ChatConversationProps> = ({
  chatSessionId,
  onChatSessionSelected,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/chats/conversations/${chatSessionId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch messages");
        }
        const data: Message[] = await response.json();
        setMessages(data);
        if (onChatSessionSelected) {
          onChatSessionSelected(chatSessionId);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [chatSessionId, onChatSessionSelected]);

  if (loading) {
    return <p className="text-center text-gray-500">Loading...</p>;
  }

  return (
    <div className="p-4 bg-gray-100 rounded-md shadow-md max-w-lg mx-auto h-96 overflow-y-auto">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex ${
            message.sender_id === "79f82015-d9a2-4b3b-a34c-9c60601604ed"
              ? "justify-start"
              : "justify-end"
          } mb-4`}
        >
          <div
            className={`${
              message.sender_id === "79f82015-d9a2-4b3b-a34c-9c60601604ed"
                ? "bg-blue-500 text-white"
                : "bg-gray-500 text-white"
            } p-3 rounded-lg max-w-xs`}
          >
            <p>{message.message}</p>
            <small className="block text-xs mt-1 text-gray-200">
              {new Date(message.created_at).toLocaleString()}
            </small>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatConversation;
