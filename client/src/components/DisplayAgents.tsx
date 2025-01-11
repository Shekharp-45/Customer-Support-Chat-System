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
  const defaultAgent: Agent = {
    fullName: "SM",
    email: "sm@gmail.com",
    mobile: "7066679183",
  };

  const displayedAgents = agents.length > 0 ? agents : [defaultAgent];

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
            {displayedAgents.map((agent, index) => (
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DisplayAgents;
