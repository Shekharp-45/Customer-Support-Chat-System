import React, { useState } from "react";
import NavbarList from "../components/Navbar.tsx";

const AgentDashboard: React.FC = () => {
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const [isCustomerListVisible, setIsCustomerListVisible] = useState<boolean>(
    true
  );

  const customers = [
    { name: "Customer 1", issue: "Windows: Account issue" },
    { name: "Customer 2", issue: "Android: Billing issue" },
    { name: "Customer 3", issue: "iOS: Login problem" },
    { name: "Customer 4", issue: "Windows: Other queries" },
  ];

  const [chatHistory, setChatHistory] = useState<{
    [key: string]: { messages: string[]; timestamps: string[] };
  }>({
    "Customer 1": {
      messages: ["Customer: Hello, I need help with my Windows account."],
      timestamps: [new Date().toLocaleTimeString()],
    },
    "Customer 2": {
      messages: ["Customer: I have an issue with Android billing."],
      timestamps: [new Date().toLocaleTimeString()],
    },
    "Customer 3": {
      messages: ["Customer: Can't log in to my iOS account."],
      timestamps: [new Date().toLocaleTimeString()],
    },
    "Customer 4": { messages: [], timestamps: [] },
  });

  const handleSendMessage = () => {
    if (message.trim() && selectedCustomer) {
      setChatHistory((prev) => ({
        ...prev,
        [selectedCustomer]: {
          messages: [
            ...(prev[selectedCustomer]?.messages || []),
            `Agent: ${message}`,
          ],
          timestamps: [
            ...(prev[selectedCustomer]?.timestamps || []),
            new Date().toLocaleTimeString(),
          ],
        },
      }));
      setMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <NavbarList />

      <div className="flex flex-1">
        <div
          className={`absolute z-10 lg:relative lg:z-auto w-full lg:w-1/5 bg-white shadow-md h-screen lg:h-auto p-4 transform ${
            isCustomerListVisible
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          } transition-transform`}
        >
          <button
            className="block lg:hidden mb-4 text-red-500"
            onClick={() => setIsCustomerListVisible(false)}
          >
            Close
          </button>
          <h2 className="text-lg font-bold mb-4">Customers</h2>
          <div className="flex flex-col gap-2">
            {customers.map((customer) => (
              <button
                key={customer.name}
                onClick={() => {
                  setSelectedCustomer(customer.name);
                  setIsCustomerListVisible(false);
                }}
                className={`px-4 py-2 text-left rounded ${
                  selectedCustomer === customer.name
                    ? "bg-gray-300 text-black"
                    : "bg-white text-black hover:bg-gray-200"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span>{customer.name}</span>
                  <span className="text-sm text-gray-500">
                    {customer.issue}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:ml-0">
          <button
            className="block lg:hidden mb-4 px-4 py-2 bg-gray-700 text-white rounded shadow hover:bg-gray-600"
            onClick={() => setIsCustomerListVisible(true)}
          >
            Show Customers
          </button>
          {selectedCustomer ? (
            <div className="m-4 flex flex-1 flex-col h-full ">
              <h2 className="text-2xl font-bold mb-4">
                Chat with {selectedCustomer}
              </h2>
              <div className="flex-1 p-4 border rounded bg-white shadow-md overflow-y-auto">
                {chatHistory[selectedCustomer]?.messages.length > 0 ? (
                  chatHistory[selectedCustomer].messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`mb-4 p-2 rounded ${
                        msg.startsWith("Agent:")
                          ? "bg-gray-200 text-black self-end"
                          : "bg-white text-black"
                      }`}
                    >
                      <p>{msg}</p>
                      <p className="text-xs text-gray-400">
                        {chatHistory[selectedCustomer]?.timestamps[index]}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">No messages yet...</p>
                )}
              </div>
              <div className="mt-4 flex items-center p-4 border-t bg-gray-50">
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
            <p className="text-gray-400 flex items-center justify-center flex-1">
              Select a customer to start chatting.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
