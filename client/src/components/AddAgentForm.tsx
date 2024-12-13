import React, { useState } from "react";

interface AddAgentFormProps {
  onAddAgent: (agent: { fullName: string; email: string; mobile: string }) => void;
}

const AddAgentForm: React.FC<AddAgentFormProps> = ({ onAddAgent }) => {
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [mobile, setMobile] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fullName && email && mobile) {
      onAddAgent({ fullName, email, mobile });
      setFullName("");
      setEmail("");
      setMobile("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Full Name</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="mt-1 block w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter full name"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter email"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
        <input
          type="tel"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          className="mt-1 block w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter mobile number"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600"
      >
        Add Agent
      </button>
    </form>
  );
};

export default AddAgentForm;
