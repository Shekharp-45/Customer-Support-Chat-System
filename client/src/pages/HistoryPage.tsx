import React, { useEffect, useState } from "react";

const HistoryPage = ({ userId }: { userId: number }) => {
  const [chats, setChats] = useState<any[]>([]);

  useEffect(() => {
    fetch(`http://localhost:5000/api/chats/history/${userId}`)
      .then((res) => res.json())
      .then((data) => setChats(data));
  }, [userId]);

  return (
    <div>
      <h1>Your Chat History</h1>
      {chats.map((chat) => (
        <div key={chat.id}>
          <h2>Chat with Agent {chat.agentId || "Unassigned"}</h2>
          {chat.messages.map((msg) => (
            <p key={msg.id}>
              <strong>{msg.senderId === userId ? "You" : "Agent"}:</strong> {msg.content}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
};

export default HistoryPage;
