import React, { useState } from "react";
import NavbarList from "../components/Navbar.tsx";

const CustomerDashboard: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<string>("Profile");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const supportCategories = ["Windows", "Android", "iOS"];

  const currentUser = {
    name: "John Doe",
    role: "Customer",
    email: "johndoe@example.com",
  };

  const handleSendMessage = () => {
    if (message.trim() && selectedCategory) {
      console.log(`Message to ${selectedCategory} Agent: ${message}`);
      setMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
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
            <div className="flex justify-start items-center gap-2">
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
                    <p className="text-gray-400">
                      Chat history will appear here...
                    </p>
                  </div>
                  <div className="flex items-center mt-4">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
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
