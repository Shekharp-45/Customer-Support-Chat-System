import React from "react";
import ChatWindow from "../components/Chat/ChatWindow";

const ChatPage = () => {
  const chatSessionId = 1; // Fetch this dynamically
  const userId = 123; // Fetch this dynamically

  return <ChatWindow chatSessionId={chatSessionId} userId={userId} />;
};

export default ChatPage;
