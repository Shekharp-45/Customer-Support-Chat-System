import React from "react";

type Agent = {
  fullName: string;
  email: string;
  mobile: string;
};

type AgentTableProps = {
  agents: Agent[];
  onDeleteAgent: (agentIndex: number) => void;
};

const DisplayAgents: React.FC<AgentTableProps> = ({
  agents,
  onDeleteAgent,
}) => {
  return (
    <div className="mt-6">
      <h3 className="font-semibold mb-4">Agents</h3>
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b text-left">Full Name</th>
            <th className="py-2 px-4 border-b text-left">Email ID</th>
            <th className="py-2 px-4 border-b text-left">Mobile No.</th>
            <th className="py-2 px-4 border-b text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {agents.length > 0 ? (
            agents.map((agent, index) => (
              <tr key={index} className="odd:bg-gray-100">
                <td className="py-2 px-4 border-b text-left text-gray-700">
                  {agent.fullName}
                </td>
                <td className="py-2 px-4 border-b text-left text-gray-700">
                  {agent.email}
                </td>
                <td className="py-2 px-4 border-b text-left text-gray-700">
                  {agent.mobile}
                </td>
                <td className="py-2 px-4 border-b text-left text-gray-700">
                  <button
                    onClick={() => onDeleteAgent(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="py-4 px-4 text-center text-gray-500">
                No agents added yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DisplayAgents;
