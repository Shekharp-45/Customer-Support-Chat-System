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
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const supportCategories = ["Windows", "Android", "iOS"];
  const currentUser = {
    id:"f82b7e8f-2e62-490a-904b-52a24a109b53", // Add ID for proper backend handling
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
    if (selectedCategory) {
      const room = selectedCategory;
      const customerId = currentUser.id || "bb27cc2b-7d1f-4af4-9336-1b34c9aa1ab3"; // Default ID as fallback
  
      // Emit the join-room event
      console.log(`Attempting to join room: ${room} with customerId: ${customerId}`);
      socket.current?.emit("join-room", {
        room: selectedCategory, 
        user: currentUser.name, 
        customerId: currentUser.id || "bb27cc2b-7d1f-4af4-9336-1b34c9aa1ab3"
      });
      
  
      // Log the event for debugging
      console.log(`Joining room: ${room}`);
      console.log("Emitting join-room with:", {
        room: selectedCategory,
        user: currentUser.name,
        customerId: currentUser.id || "bb27cc2b-7d1f-4af4-9336-1b34c9aa1ab3"
      });
      

  
      // Listen for new messages
      const handleReceiveMessage = ({ message, sender, timestamp }) => {
        console.log("Message received:", { message, sender, timestamp });
  
        setChatHistory((prev) => ({
          ...prev,
          [room]: [
            ...(prev[room] || []),
            {
              sender,
              message,
              timestamp: new Date(timestamp).toLocaleTimeString(), // Format timestamp
              isCurrentUser: sender === currentUser.name,
            },
          ],
        }));
      };
  
      socket.current?.off("receive-message", handleReceiveMessage);
      socket.current?.on("receive-message", handleReceiveMessage);
  
      // Listen for typing status
      const handleTypingStatus = ({ isTyping: typingStatus }) => {
        console.log("Typing status updated:", typingStatus);
        setIsTyping(typingStatus);
      };
  
      socket.current?.off("typing-status", handleTypingStatus);
      socket.current?.on("typing-status", handleTypingStatus);
  
      // Cleanup function to remove listeners when the component unmounts or `selectedCategory` changes
      return () => {
        console.log(`Cleaning up listeners for room: ${room}`);
        socket.current?.off("receive-message", handleReceiveMessage);
        socket.current?.off("typing-status", handleTypingStatus);
      };
    }
  }, [selectedCategory]);
  

  // Send message
  const handleSendMessage = () => {
    if (message.trim() && selectedCategory) {
      const timestamp = new Date().toISOString();
  
      // Emit send-message event with proper room and sender details
      socket.current?.emit("send-message", {
        room: selectedCategory, // Should correspond to the UUID mapping
        message,
        sender: currentUser.id, // Use sender ID for backend consistency
      });
  
      // Update chat history locally
      setChatHistory((prev) => ({
        ...prev,
        [selectedCategory]: [
          ...(prev[selectedCategory] || []),
          {
            sender: currentUser.name,
            message,
            timestamp: new Date(timestamp).toLocaleTimeString(),
            isCurrentUser: true,
          },
        ],
      }));
  
      setMessage(""); // Clear input field
    } else {
      console.log("Message is empty or no category selected");
    }
  };
  

  // Handle typing status
  const handleTyping = () => {
    if (selectedCategory && !typingTimeoutRef.current) {
      const payload = { room: selectedCategory, user: currentUser.name, isTyping: true };
      console.log("Sending typing event:", payload);

      socket.current?.emit("typing", payload);
  
      // Stop typing after 1 second of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        const stopTypingPayload = { room: selectedCategory, user: currentUser.name, isTyping: false };
        console.log("Stopping typing event:", stopTypingPayload);
  
        socket.current?.emit("typing", stopTypingPayload);
        typingTimeoutRef.current = null;
      }, 1000);
    }
  };
  

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <NavbarList />

      {/* Sidebar Toggle */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden p-4 bg-gray-200 text-black border-b border-gray-300"
      >
        {isSidebarOpen ? "Close Menu" : "Open Menu"}
      </button>

      <div className="flex flex-1">
        {/* Sidebar */}
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

        {/* Main Content */}
        <div className="flex-1 p-4 lg:ml-1/5">
          {selectedOption === "Profile" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">My Profile</h2>
              <p className="text-gray-600">
                Welcome to your profile! Here you can update your personal information.
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
                      onClick={() => setSelectedCategory(category)}
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
                  <div className="flex-1 p-2 border overflow-y-auto bg-gray-50">
                    {chatHistory[selectedCategory]?.length ? (
                      chatHistory[selectedCategory].map((chat, index) => (
                        <p
                          key={index}
                          className={`${
                            chat.isCurrentUser
                              ? "text-blue-600 text-right"
                              : "text-gray-800 text-left"
                          }`}
                        >
                          {chat.sender}: {chat.message}{" "}
                          <span className="text-xs text-gray-500">
                            {chat.timestamp}
                          </span>
                        </p>
                      ))
                    ) : (
                      <p className="text-gray-400">Chat history will appear here...</p>
                    )}
                  </div>
                  {isTyping && <p className="text-sm text-gray-500">Agent is typing...</p>}
                  <div className="flex items-center mt-4">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleTyping}
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
                <p className="text-gray-400">Please select a category to chat with an agent.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
