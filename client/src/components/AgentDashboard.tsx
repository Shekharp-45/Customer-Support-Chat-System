import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import NavbarList from "../components/Navbar.tsx";

const socket = io("http://localhost:5000");

const AgentDashboard: React.FC = () => {
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const [typingStatus, setTypingStatus] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<{ [key: string]: { messages: string[]; timestamps: string[] } }>({});
  const [activeCustomers, setActiveCustomers] = useState<{ name: string; issue: string }[]>([]);
  const messageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    socket.on("receive-message", ({ message, sender, timestamp }) => {
      setChatHistory((prev) => ({
        ...prev,
        [sender]: {
          messages: [...(prev[sender]?.messages || []), `Customer: ${message}`],
          timestamps: [...(prev[sender]?.timestamps || []), timestamp],
        },
      }));

      setActiveCustomers((prev) => {
        if (!prev.find((customer) => customer.name === sender)) {
          return [...prev, { name: sender, issue: "Unknown" }];
        }
        return prev;
      });
    });

    socket.on("typing-status", ({ isTyping, sender }) => {
      if (selectedCustomer === sender) {
        setTypingStatus(isTyping ? "Customer is typing..." : "");
      }
    });

    socket.on("active-customers", (customers) => {
      setActiveCustomers(customers);
    });

    return () => {
      socket.off("receive-message");
      socket.off("typing-status");
      socket.off("active-customers");
    };
  }, [selectedCustomer]);

  const handleSendMessage = () => {
    if (message.trim() && selectedCustomer) {
      const timestamp = new Date().toLocaleTimeString();
      const room = `room-${selectedCustomer}`;
      socket.emit("send-message", {
        room,
        message,
        sender: "Agent",
        timestamp,
      });

      setChatHistory((prev) => ({
        ...prev,
        [selectedCustomer]: {
          messages: [...(prev[selectedCustomer]?.messages || []), `Agent: ${message}`],
          timestamps: [...(prev[selectedCustomer]?.timestamps || []), timestamp],
        },
      }));

      setMessage("");
    }
  };

  const handleTyping = () => {
    if (selectedCustomer) {
      const room = `room-${selectedCustomer}`;
      socket.emit("typing", { room, isTyping: true });

      setTimeout(() => {
        socket.emit("typing", { room, isTyping: false });
      }, 2000);
    }
  };

  const joinRoom = (customer: string) => {
    setSelectedCustomer(customer);
    const room = `room-${customer}`;
    socket.emit("join-room", { room, user: "Agent" });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <NavbarList />
      <div className="flex flex-1">
        <div className="w-1/4 bg-white shadow-md p-4">
          <h2 className="text-lg font-bold mb-4">Active Conversations</h2>
          {activeCustomers.length > 0 ? (
            activeCustomers.map((customer) => (
              <button
                key={customer.name}
                onClick={() => joinRoom(customer.name)}
                className={`block w-full text-left p-2 rounded ${
                  selectedCustomer === customer.name ? "bg-gray-300" : "bg-white"
                }`}
              >
                {customer.name} - {customer.issue}
              </button>
            ))
          ) : (
            <p className="text-center text-gray-500">No active conversations</p>
          )}
        </div>
        <div className="flex-1 flex flex-col">
          {selectedCustomer ? (
            <>
              <h2 className="text-2xl font-bold p-4">Chat with {selectedCustomer}</h2>
              <div className="flex-1 p-4 border rounded bg-white shadow-md overflow-y-auto">
                {chatHistory[selectedCustomer]?.messages.map((msg, index) => (
                  <div key={index} className="mb-2">
                    <p>{msg}</p>
                    <p className="text-xs text-gray-500">{chatHistory[selectedCustomer]?.timestamps[index]}</p>
                  </div>
                ))}
                {typingStatus && <p className="text-sm italic text-gray-500">{typingStatus}</p>}
              </div>
              <div className="p-4 border-t">
                <input
                  ref={messageInputRef}
                  type="text"
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    handleTyping();
                  }}
                  placeholder="Type a message..."
                  className="w-full p-2 border rounded"
                />
                <button onClick={handleSendMessage} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">
                  Send
                </button>
              </div>
            </>
          ) : (
            <p className="text-center text-gray-500">Select a customer to start chatting</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
