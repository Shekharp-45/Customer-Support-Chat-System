import React, { useState, useEffect } from "react";
import NavbarList from "../components/Navbar.tsx";
import AddAgentForm from "../components/AddAgentForm.tsx";
import DisplayAgents from "../components/DisplayAgents.tsx";

interface Conversation {
  customer: string;
  agentName: string;
  messages: string[];
}

const AdminDashboard: React.FC = () => {
  const [agents, setAgents] = useState<
    { fullName: string; email: string; mobile: string }[]
  >([]);
  const [selectedView, setSelectedView] = useState<string>("Add Agents");
  // eslint-disable-next-line
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      customer: "Customer 1",
      agentName: "John Doe",
      messages: [
        "Customer: Hello, I need help with my Windows account.",
        "Agent: Sure, I’d be happy to assist you. Can you let me know the specific issue you’re facing?",
        "Customer: I’m unable to log into my account. It says my password is incorrect.",
        "Agent: I see. Have you tried resetting your password?",
        "Customer: Yes, but I didn’t receive the password reset email.",
        "Agent: Okay. Let me verify your account details. Could you please provide the email address associated with your account?",
        "Customer: Sure, it’s customer1@example.com.",
        "Agent: Thank you. Let me check. One moment, please.",
        "Agent: I’ve checked the account. It seems there was a typo in the registered email address. I’ll correct it for you. You should now receive the password reset email.",
        "Customer: Oh, I see. I’ll check my inbox now.",
        "Customer: Got it! I’ve reset my password, but now it’s asking for a security code.",
        "Agent: That’s part of the two-step verification process. The code is sent to your registered phone number. Did you receive a code?",
        "Customer: Let me check... Yes, I’ve got the code.",
        "Agent: Great! Enter the code, and you should be able to access your account.",
        "Customer: It worked! I’m in now. Thanks for your help.",
        "Agent: You’re welcome! Is there anything else I can assist you with?",
        "Customer: Actually, yes. Can you help me link my Windows account to my Office 365 subscription?",
        "Agent: Absolutely. Here’s how you can do it: Go to the Microsoft account settings, select 'Subscriptions,' and click on 'Link an Office Account.' You’ll need to sign in with your Office 365 credentials.",
        "Customer: Okay, I’m trying that now... It’s asking for a product key.",
        "Agent: Do you have the product key with you? If not, you can retrieve it from your purchase confirmation email.",
        "Customer: Let me check... Found it. Entering it now.",
        "Customer: It worked! My Office 365 is now linked to my Windows account.",
        "Agent: Perfect! Glad we could resolve both issues. Is there anything else I can help with?",
        "Customer: No, that’s all for now. Thanks again, John!",
        "Agent: My pleasure. Have a great day!",
      ],
    },
    {
      customer: "Customer 2",
      agentName: "Jane Smith",
      messages: [
        "Customer: I have an issue with Android billing.",
        "Agent: Let me check that for you.",
      ],
    },
  ]);
  const [selectedConversationIndex, setSelectedConversationIndex] = useState<
    number | null
  >(null);

  // Loading the agents from localStorage when the component mounts
  useEffect(() => {
    const storedAgents = localStorage.getItem("agents");
    if (storedAgents) {
      setAgents(JSON.parse(storedAgents));
    }
  }, []);

  // Save the agents to localStorage whenever the agents state changes
  useEffect(() => {
    if (agents.length > 0) {
      localStorage.setItem("agents", JSON.stringify(agents));
    }
  }, [agents]);

  const handleAddAgent = (agent: {
    fullName: string;
    email: string;
    mobile: string;
  }) => {
    setAgents((prev) => [...prev, agent]);
  };

  const handleDeleteAgent = (agentIndex: number) => {
    const updatedAgents = agents.filter((_, index) => index !== agentIndex);
    setAgents(updatedAgents);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <NavbarList />

      <div className="flex flex-1">
        <div className="w-1/5 bg-white shadow-md h-screen p-4">
          <h2 className="text-lg font-bold mb-4">Admin Panel</h2>
          <button
            onClick={() => setSelectedView("Add Agents")}
            className={`w-full text-left px-4 py-2 mb-2 rounded ${
              selectedView === "Add Agents"
                ? "bg-gray-300 text-black"
                : "bg-white text-black hover:bg-gray-100"
            }`}
          >
            Add Agents
          </button>
          <button
            onClick={() => setSelectedView("See Conversations")}
            className={`w-full text-left px-4 py-2 rounded ${
              selectedView === "See Conversations"
                ? "bg-gray-300 text-black"
                : "bg-white text-black hover:bg-gray-100"
            }`}
          >
            See Conversations
          </button>
        </div>
        <div className="flex-1 p-4">
          {selectedView === "Add Agents" && (
            <div>
              <AddAgentForm onAddAgent={handleAddAgent} />
              <DisplayAgents
                agents={agents}
                onDeleteAgent={handleDeleteAgent}
              />
            </div>
          )}

          {selectedView === "See Conversations" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Conversations</h2>
              <div className="mb-4">
                <label
                  htmlFor="conversationSelector"
                  className="block text-sm font-medium text-gray-700"
                >
                  Select a Conversation:
                </label>
                <select
                  id="conversationSelector"
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  onChange={(e) =>
                    setSelectedConversationIndex(
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                  value={
                    selectedConversationIndex !== null
                      ? selectedConversationIndex
                      : ""
                  }
                >
                  <option value="" disabled>
                    -- Select Conversation --
                  </option>
                  {conversations.map((conv, index) => (
                    <option key={index} value={index}>
                      {conv.customer} (Handled by {conv.agentName})
                    </option>
                  ))}
                </select>
              </div>
              {selectedConversationIndex !== null ? (
                <div
                  className="border rounded p-6 flex-grow overflow-y-auto space-y-4"
                  style={{
                    maxHeight: "calc(100vh - 200px)",
                  }}
                >
                  {conversations[selectedConversationIndex]?.messages.map(
                    (msg, index) => (
                      <div
                        key={index}
                        className={`flex ${
                          msg.startsWith("Agent")
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`p-3 rounded-lg max-w-sm break-words ${
                            msg.startsWith("Agent")
                              ? "bg-black text-white"
                              : "bg-white text-black border border-gray-300"
                          }`}
                        >
                          <p>{msg}</p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p className="text-gray-500">
                  Please select a conversation to view the chat history.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
