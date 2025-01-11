import React, { useState, useEffect } from "react";
import NavbarList from "../components/Navbar.tsx";
import AddAgentForm from "../components/AddAgentForm.tsx";
import DisplayAgents from "../components/DisplayAgents.tsx";
import ChatConversation from "../components/ChatConversation.tsx";

const AdminDashboard: React.FC = () => {
  const [agents, setAgents] = useState<
    { fullName: string; email: string; mobile: string }[]
  >([]);
  const [selectedView, setSelectedView] = useState<string>("Add Agents");
  const [chatSessions, setChatSessions] = useState<string[]>([]);
  const [selectedChatSessionId, setSelectedChatSessionId] = useState<
    string | null
  >(null);
  const senderIdToAgentName: { [key: string]: string } = {
    "79f82015-d9a2-4b3b-a34c-9c60601604ed": "SM",
  };
  useEffect(() => {
    const storedAgents = localStorage.getItem("agents");
    if (storedAgents) {
      setAgents(JSON.parse(storedAgents));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("agents", JSON.stringify(agents));
  }, [agents]);

  useEffect(() => {
    const fetchChatSessions = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/chats/conversations"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch chat sessions");
        }
        const result: { data: string[] } = await response.json();
        const uniqueSessions = Array.from(new Set(result.data));
        setChatSessions(uniqueSessions);
      } catch (error) {
        console.error("Error fetching chat sessions:", error);
      }
    };

    fetchChatSessions();
  }, []);

  const onAddAgent = async (agent: {
    fullName: string;
    email: string;
    mobile: string;
  }) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(agent),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        setAgents((prev) => [...prev, agent]);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error adding agent:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  const handleDeleteAgent = (agentIndex: number) => {
    const updatedAgents = agents.filter((_, index) => index !== agentIndex);
    setAgents(updatedAgents);
  };

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedChatSessionId(event.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <NavbarList />

      <div className="flex flex-1 flex-col lg:flex-row">
        <div className="w-full lg:w-1/5 bg-white shadow-md p-4 lg:h-screen">
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
              <AddAgentForm onAddAgent={onAddAgent} />
              <DisplayAgents
                agents={agents}
                onDeleteAgent={handleDeleteAgent}
              />
            </div>
          )}

          {selectedView === "See Conversations" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Conversations</h2>
              {Array.isArray(chatSessions) && chatSessions.length > 0 ? (
                <div className="mb-4">
                  <label
                    htmlFor="conversationSelector"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Select a Conversation:
                  </label>
                  <select
                    id="conversationSelector"
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                    onChange={handleSelectChange}
                    value={selectedChatSessionId || ""}
                  >
                    <option value="" disabled>
                      Select a conversation
                    </option>
                    {chatSessions.map((sessionId, index) => (
                      <option key={sessionId} value={sessionId}>
                        {`Customer (${index + 1}) handled by ${
                          senderIdToAgentName[
                            "79f82015-d9a2-4b3b-a34c-9c60601604ed"
                          ] || "Unknown Agent"
                        }`}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <p className="text-gray-500">No conversations available.</p>
              )}
              {selectedChatSessionId && (
                <ChatConversation chatSessionId={selectedChatSessionId} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
