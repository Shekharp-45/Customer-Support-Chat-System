import React, { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import NavbarList from "../components/Navbar.tsx";
import { DefaultEventsMap } from "@socket.io/component-emitter";

const AgentDashboard: React.FC = () => {
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [mappedRoom, setMappedRoom] = useState<string | null>(null); 
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [typingStatus, setTypingStatus] = useState<string | null>(null);
   const [chatHistory, setChatHistory] = useState<Record<string, any[]>>({});
  const [activeCustomers, setActiveCustomers] = useState<
    { name: string; issue: string }[]
  >([]);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const socket = useRef<Socket<DefaultEventsMap, DefaultEventsMap> | null>(null);

  // Assuming you have a `currentAgent` state storing the agent's details
  const currentAgent = {
    id: "79f82015-d9a2-4b3b-a34c-9c60601604ed",
    name: "SM",
    role: "Agent",
    email: "sm@gmail.com",
  };

  // Connect to Socket.IO on component mount
  useEffect(() => {
    if (!socket.current) {
      socket.current = io("http://localhost:5000");

      socket.current.on("connect", () => {
        console.log("Agent connected to server:", socket.current?.id);
      });

      socket.current.on("disconnect", () => {
        console.log("Agent disconnected");
      });

      // Receive active customers list
      socket.current.on(
        "active-customers",
        (customers: { name: string; issue: string }[]) => {
          setActiveCustomers(customers);
          console.log("Active customers received:", customers);
        }
      );
    }

    return () => {
      socket.current?.disconnect();
      socket.current = null;
    };
  }, []);
  useEffect(() => {
    if (socket.current) {
      socket.current.on("message", (message) => {
        console.log("New message received:", message);
        setChatHistory((prev) => {
          const updatedHistory = {
            ...prev,
            [selectedIssue || '']: [...(prev[selectedIssue || ''] || []), message],
          };
          return updatedHistory;
        });
      });
  
      socket.current.on("typing", ({ user, isTyping }) => {
        console.log(`${user} is typing...`);
        setTypingStatus(isTyping);
      });
    }
  
    // Cleanup listeners on component unmount
    return () => {
      socket.current?.off("message");
      socket.current?.off("typing");
    };
  }, [selectedIssue]);
  
  
  useEffect(() => {
    if (!socket.current) return;
  
    console.log("Socket instance:", socket.current);
    console.log("Setting up receive-message listener");
  
    socket.current.on("receive-message", ({ message, sender, timestamp, room }) => {
      console.log("Received message:", { message, sender, room });
      setChatHistory((prev) => ({
        ...prev,
        [room]: [...(prev[room] || []), { sender, message, timestamp }],
      }));

    });
    
    
  
    return () => {
      console.log("Removing receive-message listener");
      socket.current?.off("receive-message");
    };
  }, []);
  
  useEffect(() => {
    console.log("Chat history updated (useEffect):", chatHistory);
  }, [chatHistory]);
  
  

  useEffect(() => {
    const storedHistory = localStorage.getItem("chatHistory");
    if (storedHistory) {
      setChatHistory(JSON.parse(storedHistory));
    }
  }, []);
  useEffect(() => {
    if (socket.current) {
      socket.current.on("typing-status", ({ user, isTyping }) => {
        if (isTyping) {
          setTypingStatus(`${user} is typing...`);
        } else {
          setTypingStatus(null);
        }
      });
    }

    return () => {
      // Cleanup listener on component unmount
      socket.current?.off("typing-status");
    };
  }, []);
  

  // Join a room and fetch its history
  const joinRoom = (customer: {
    name: string;
    issue: string;
    customerId: string;
  }) => {
    setSelectedCustomer(customer.name);
    setSelectedIssue(customer.issue);
    setSelectedCustomerId(customer.customerId);
    // Assume room is generated as `room-{issue}-{customer_name}`
    const room = `room-${customer.customerId}`;

    // Emit join-room event with customerId
    socket.current?.emit("join-room", {
      room,
      user: "Agent",
      customerId: customer.customerId,
    });
    setMappedRoom(room);
    setActiveRoom(room); 
    console.log(`Agent joining room: ${room}`);
    console.log("Selected Customer ID:", customer.customerId);
  };

  // Send a message
  const handleSendMessage = () => {
    if (message.trim() && activeRoom) {
      const room = `room-${currentAgent.id}`;
      const timestamp = new Date().toISOString();
      const newMessage = {
        sender: currentAgent.id,
        message,
        timestamp,
      };
  
      socket.current?.emit("send-message", {
        room: activeRoom,
        ...newMessage,
      });
  
      setChatHistory((prev) => ({
        ...prev,
        [activeRoom]: [
          ...(prev[activeRoom] || []),
          { ...newMessage, isCurrentUser: true },
        ],
      }));
  
      setMessage("");
    } else {
      console.log("Message is empty or no category selected");
    }
  };
  

  const debounce = (func: (...args: any[]) => void, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const handleTyping = debounce(() => {
  if (activeRoom) {
    socket.current?.emit("typing", {
      room: activeRoom,
      user: currentAgent.name,
      isTyping: true,
    });
  }
}, 300);


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavbarList />
      <div className="flex flex-1 flex-col md:flex-row">
        {/* Sidebar */}
        <div className="md:w-1/4 bg-white shadow-md p-4">
          <h2 className="text-lg font-bold mb-4">Active Conversations</h2>
          {activeCustomers.length > 0 ? (
            activeCustomers.map((customer) => (
              <button
                key={customer.name}
                onClick={() => joinRoom(customer)}
                className={`block w-full text-left p-2 rounded ${
                  selectedCustomer === customer.name
                    ? "bg-blue-100"
                    : "bg-gray-100"
                } hover:bg-blue-200 transition`}
              >
                <div className="flex justify-between">
                  <span>{customer.name}</span>
                  <span className="text-sm text-gray-500">
                    {customer.issue}
                  </span>
                </div>
              </button>
            ))
          ) : (
            <p className="text-center text-gray-500">No active conversations</p>
          )}
        </div>
  {/* Chat Window */}
  <div className="flex-1 flex flex-col bg-white p-4 shadow-md">
          {selectedCustomer ? (
            <>
              <h3 className="text-xl font-bold mb-2">Chat with {selectedCustomer}</h3>
              <div className="flex-1 p-2 border overflow-y-auto bg-gray-50" style={{ maxHeight: "400px" }}>
  {chatHistory[activeRoom || ""]?.map((chat, index) => (
    <div
      key={index}
      className={`flex ${
        chat.sender === currentAgent.id ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`${
          chat.sender === currentAgent.id
            ? "text-blue-600"
            : "text-gray-800"
        } p-2 rounded max-w-xs`}
      >
        <p>{chat.message}</p>
        <span className="text-xs text-gray-500">
          {new Date(chat.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })}
        </span>
      </div>
    </div>
  ))}
</div>

              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={message}
                  onKeyDown={handleTyping}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 p-2 border rounded"
                />
                <button onClick={handleSendMessage} className="px-4 py-2 bg-blue-500 text-white rounded">
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