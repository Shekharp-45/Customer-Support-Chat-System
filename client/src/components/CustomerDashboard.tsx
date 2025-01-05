import React, { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import NavbarList from "../components/Navbar.tsx";

const CustomerDashboard: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<string>("Profile");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<Record<string, any[]>>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const socket = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const supportCategories = ["Windows", "Android", "iOS"];

  const currentUser = {
    id: "f82b7e8f-2e62-490a-904b-52a24a109b53",
    name: "Shekhar",
    role: "Customer",
    email: "sp@gmail.com",
  };

  useEffect(() => {
    if (!socket.current) {
      socket.current = io("http://localhost:5000");

      socket.current.on("connect", () => {
        console.log("Connected to server via Socket.IO");
      });

      socket.current.on("disconnect", () => {
        console.log("Disconnected from server");
      });
    }

    return () => {
      socket.current?.disconnect();
      console.log("Socket disconnected on cleanup");
      socket.current = null;
    };
  }, []);
  useEffect(() => {
    console.log(currentUser);
    if (!socket.current) return;

    socket.current.on(
      "receive-message",
      ({ message, sender, timestamp, room }) => {
        console.log("Message received:", { message, sender, timestamp, room });

        const isCurrentUser = sender === currentUser.id;

        setChatHistory((prev) => {
          const updatedHistory = {
            ...prev,
            [selectedCategory || room]: [
              ...(prev[selectedCategory || room] || []),
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
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedCategory) {
      const savedChatHistory = localStorage.getItem("chatHistory");
      const parsedHistory = savedChatHistory
        ? JSON.parse(savedChatHistory)
        : {};
      setChatHistory(parsedHistory);
    }
  }, [selectedCategory]);
  useEffect(() => {
    console.log("Chat history updated (useEffect):", chatHistory);
  }, [chatHistory]);

  const handleSendMessage = () => {
    if (message.trim() && selectedCategory) {
      const room = `room-${currentUser.id}`;
      const timestamp = new Date().toISOString();
      const newMessage = {
        sender: currentUser.id,
        message,
        timestamp,
        isCurrentUser: true,
      };

      socket.current?.emit("send-message", {
        room,
        ...newMessage,
      });

      setChatHistory((prev) => {
        const updatedHistory = {
          ...prev,
          [selectedCategory]: [...(prev[selectedCategory] || []), newMessage],
        };
        localStorage.setItem("chatHistory", JSON.stringify(updatedHistory));
        return updatedHistory;
      });

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

  const joinRoom = (category: string) => {
    if (!category) {
      console.error("Category must be selected to join a room.");
      return;
    }

    setSelectedCategory(category);

    const room = `room-${currentUser.id}`;

    console.log(`Customer joining room: ${room}`);
    socket.current?.emit("join-room", {
      room,
      user: currentUser.name,
      customerId: currentUser.id,
      category: category,
    });
  };

  const handleTyping = debounce(() => {
    if (selectedCategory) {
      const room = `room-${currentUser.id}`;
      socket.current?.emit("typing", {
        room,
        user: currentUser.name,
        isTyping: true,
      });
    }
  }, 300);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col ">
      <NavbarList />

      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden p-4 bg-gray-200 text-black border-b border-gray-300"
      >
        {isSidebarOpen ? "Close Menu" : "Open Menu"}
      </button>

      <div className="flex flex-1">
        <div
          className={`${
            isSidebarOpen ? "block" : "hidden"
          } lg:block w-full lg:w-1/5 bg-white shadow-md h-screen p-4 fixed lg:relative z-10`}
        >
          <div className="mb-6 p-2">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-gray-400 p-3 w-10 h-10 flex items-center justify-center text-dark font-bold">
                {currentUser.name ? currentUser.name[0] : "A"}
              </div>
              <div>
                <p className="font-semibold">{currentUser.role}</p>
                <p className="text-xs font-normal">{currentUser.email}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {["Profile", "Support"].map((option) => (
              <button
                key={option}
                onClick={() => {
                  setSelectedOption(option);
                  setIsSidebarOpen(false);
                }}
                className={`text-left px-4 py-2 rounded ${
                  selectedOption === option
                    ? "bg-gray-300 text-black"
                    : "bg-white text-black hover:bg-gray-200"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 p-4 lg:ml-1/5">
          {selectedOption === "Profile" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">My Profile</h2>
              <p className="text-gray-600">
                Welcome to your profile! Here you can update your personal
                information.
              </p>
            </div>
          )}
          {selectedOption === "Support" && (
            <div className="flex flex-col h-full">
              <h2 className="text-2xl font-bold mb-4">Support</h2>
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Select a Category:</h3>
                <div className="flex gap-4 mt-2">
                  {supportCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategory(category);
                        joinRoom(category);
                      }}
                      className={`px-4 py-2 rounded ${
                        selectedCategory === category
                          ? "bg-gray-300 text-black"
                          : "bg-white text-black hover:bg-gray-200"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {selectedCategory ? (
                <div className="flex flex-col flex-1 border rounded bg-white shadow-md p-4">
                  <h3 className="text-xl font-bold mb-4">
                    Chat with {selectedCategory} Agent
                  </h3>
                  <div
                    className="flex-1 p-2 border overflow-y-auto bg-gray-50"
                    style={{ maxHeight: "400px" }}
                  >
                    {selectedCategory &&
                    chatHistory[selectedCategory]?.length > 0 ? (
                      chatHistory[selectedCategory].map((chat, index) => (
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
                      <p className="text-gray-400">
                        No chat history available...
                      </p>
                    )}
                  </div>

                  {isTyping && (
                    <p className="text-sm text-gray-500">Agent is typing...</p>
                  )}
                  <div className="flex items-center mt-4">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleTyping}
                      placeholder="Type a message..."
                      className="flex-1 p-2 border rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />

                    <button
                      onClick={handleSendMessage}
                      className="ml-2 px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600"
                    >
                      Send
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400">
                  Please select a category to chat with an agent.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
