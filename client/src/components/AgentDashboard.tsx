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
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null
  );
  const [typingStatus, setTypingStatus] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<Record<string, any[]>>({});
  const [activeCustomers, setActiveCustomers] = useState<
    { name: string; issue: string }[]
  >([]);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const socket = useRef<Socket<DefaultEventsMap, DefaultEventsMap> | null>(
    null
  );

  const currentAgent = {
    id: "79f82015-d9a2-4b3b-a34c-9c60601604ed",
    name: "SM",
    role: "Agent",
    email: "sm@gmail.com",
  };

  useEffect(() => {
    if (!socket.current) {
      socket.current = io("http://localhost:5000");

      socket.current.on("connect", () => {
        console.log("Agent connected to server:", socket.current?.id);
      });

      socket.current.on("disconnect", () => {
        console.log("Agent disconnected");
      });

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
            [selectedIssue || ""]: [
              ...(prev[selectedIssue || ""] || []),
              message,
            ],
          };
          return updatedHistory;
        });
      });

      socket.current.on("typing", ({ user, isTyping }) => {
        console.log(`${user} is typing...`);
        setTypingStatus(isTyping);
      });
    }

    return () => {
      socket.current?.off("message");
      socket.current?.off("typing");
    };
  }, [selectedIssue]);

  useEffect(() => {
    if (!socket.current) return;

    socket.current.on(
      "receive-message",
      ({ message, sender, timestamp, room }) => {
        console.log("Message received:", { message, sender, timestamp, room });

        const isCurrentUser = sender === currentAgent.id;

        setChatHistory((prev) => {
          const updatedHistory = {
            ...prev,
            [activeRoom || room]: [
              ...(prev[activeRoom || room] || []),
              { sender, message, timestamp, isCurrentUser },
            ],
          };
          console.log("Updated chatHistory:", updatedHistory);
          return updatedHistory;
        });
      }
    );

    return () => {
      socket.current?.off("receive-message");
    };
  }, [activeRoom, currentAgent.id]);

  useEffect(() => {
    const storedHistory = localStorage.getItem("chatHistory");

    if (storedHistory) {
      setChatHistory(JSON.parse(storedHistory));
    }
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
    localStorage.setItem("activeCustomers", JSON.stringify(activeCustomers));
  }, [activeCustomers]);
  useEffect(() => {
    const storedCustomers = localStorage.getItem("activeCustomers");
    if (storedCustomers) {
      setActiveCustomers(JSON.parse(storedCustomers));
    }
  }, []);
  useEffect(() => {
    if (socket.current) {
      socket.current.emit("request-active-customers");
    }
  }, [socket]);  
  
  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
  }, [chatHistory]);
  
  useEffect(() => {
    if (socket.current) {
      socket.current.on("active-customers", (customers) => {
        setActiveCustomers(customers);
        console.log("Active customers received:", customers);
      });
    }
  
    return () => {
      socket.current?.off("active-customers");
    };
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
      socket.current?.off("typing-status");
    };
  }, []);
  const fetchChatHistory = async (roomId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/chathistory/${roomId}`);
      const data = await response.json();
      setChatHistory((prev) => ({
        ...prev,
        [roomId]: data,
      }));
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  };
  const markAsResolved = () => {
    if (activeRoom) {
      // Notify server that the issue is resolved
      socket.current?.emit("mark-issue-resolved", {
        room: activeRoom,
        agentId: currentAgent.id,
      });
  
      // Update local state (optional, based on backend handling)
      setChatHistory((prev) => {
        const updatedHistory = { ...prev };
        delete updatedHistory[activeRoom]; // Remove resolved chat from active list
        return updatedHistory;
      });
  
      setActiveRoom(null);
      setSelectedCustomer(null);
      setSelectedIssue("");
      console.log(`Marked issue as resolved for room: ${activeRoom}`);
    }
  };
  const joinRoom = (customer: {
    name: string;
    issue: string;
    customerId: string;
  }) => {
    setSelectedCustomer(customer.name);
    setSelectedIssue(customer.issue);
    setSelectedCustomerId(customer.customerId);

    const room = `room-${customer.customerId}`;

    setActiveRoom(room);
    socket.current?.emit("join-room", {
      room,
      customerId: customer.customerId,
    });
    setMappedRoom(room);
    fetchChatHistory(room);
    console.log(`Agent joining room: ${room}`);
    console.log("Selected Customer ID:", customer.customerId);
  };

  const handleSendMessage = () => {
    if (message.trim() && activeRoom) {
      const timestamp = new Date().toISOString();
      const newMessage = {
        sender: currentAgent.id,
        message,
        timestamp,
        isCurrentUser: true,
      };

      socket.current?.emit("send-message", {
        room: activeRoom,
        ...newMessage,
      });

      setChatHistory((prev) => {
        const updatedHistory = {
          ...prev,
          [activeRoom]: [...(prev[activeRoom] || []), newMessage],
        };
        return updatedHistory;
      });

      setMessage("");
    } else {
      console.log("Message is empty or no active room selected");
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
    <div className="min-h-screen bg-gray-50 flex flex-col overflow-hidden">
      <NavbarList />
      <div className="flex flex-1 flex-col md:flex-row h-full overflow-hidden">
        <div className="md:w-1/4 bg-white shadow-md p-4 flex flex-col h-full overflow-y-auto">
          <h2 className="text-lg font-bold mb-4">Active Conversations</h2>
          {activeCustomers.length > 0 ? (
            activeCustomers.map((customer) => (
              <button
                key={customer.issue}
                onClick={() => joinRoom(customer)}
                className={`block w-full text-left p-2 rounded ${
                  selectedCustomer === customer.name
                    ? "bg-blue-100"
                    : "bg-gray-100"
                } hover:bg-blue-200 transition`}
              >
                <div className="flex justify-between">
                  <span>{customer.name}</span>
                  <span className="text-sm text-gray-500">{customer.issue}</span>
                </div>
              </button>
            ))
          ) : (
            <p className="text-center text-gray-500">No active conversations</p>
          )}
        </div>
        <div className="flex-1 flex flex-col bg-white p-6 shadow-md h-full overflow-hidden">
          {selectedCustomer ? (
            <>
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold mb-2">
                  Chat with {selectedCustomer}
                </h3>
                <button
                  onClick={markAsResolved}
                  className="px-4 py-2 bg-blue-200 text-black font-bold rounded"
                >
                  Mark as Resolved
                </button>
              </div>
              <div
                className="flex-1 p-4 border bg-gray-50 rounded overflow-y-auto"
                style={{ maxHeight: "70vh" }}
              >
                {activeRoom && chatHistory[activeRoom]?.length > 0 ? (
                  chatHistory[activeRoom].map((chat, index) => (
                    <div
                      key={index}
                      className={`flex mb-2 ${
                        chat.isCurrentUser ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg border shadow-md ${
                          chat.isCurrentUser
                            ? "bg-blue-100 text-blue-600 text-right"
                            : "bg-gray-100 text-gray-800 text-left"
                        }`}
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
                  ))
                ) : (
                  <p className="text-center text-gray-500">
                    No chat history available...
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2 mt-4">
                <input
                  type="text"
                  value={message}
                  onKeyDown={handleTyping}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 p-2 border rounded"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <p className="text-center text-gray-500">
              Select a customer to start chatting
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
