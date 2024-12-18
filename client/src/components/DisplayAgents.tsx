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
      <h3 className="font-semibold text-xl mb-4">Agents</h3>
      <div className="overflow-x-auto">
        <table className="w-full bg-white border border-gray-200 shadow-md rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 border-b text-left text-sm font-medium text-gray-600">
                Full Name
              </th>
              <th className="py-3 px-4 border-b text-left text-sm font-medium text-gray-600">
                Email ID
              </th>
              <th className="py-3 px-4 border-b text-left text-sm font-medium text-gray-600">
                Mobile No.
              </th>
              <th className="py-3 px-4 border-b text-left text-sm font-medium text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {agents.length > 0 ? (
              agents.map((agent, index) => (
                <tr
                  key={index}
                  className={`${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-gray-100`}
                >
                  <td className="py-3 px-4 border-b text-left text-gray-700 text-sm">
                    {agent.fullName}
                  </td>
                  <td className="py-3 px-4 border-b text-left text-gray-700 text-sm">
                    {agent.email}
                  </td>
                  <td className="py-3 px-4 border-b text-left text-gray-700 text-sm">
                    {agent.mobile}
                  </td>
                  <td className="py-3 px-4 border-b text-left">
                    <button
                      onClick={() => onDeleteAgent(index)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                      aria-label={`Delete agent ${agent.fullName}`}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="py-6 px-4 text-center text-gray-500 text-sm"
                >
                  No agents added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DisplayAgents;
