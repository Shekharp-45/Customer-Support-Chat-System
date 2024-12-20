import React, { useState } from "react";

interface AddAgentFormProps {
  onAddAgent: (agent: { fullName: string; email: string; mobile: string }) => Promise<void>;
}

const AddAgentForm: React.FC<AddAgentFormProps> = ({ onAddAgent }) => {
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [mobile, setMobile] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^[0-9]{10}$/;

    if (!emailRegex.test(email)) {
      setError("Invalid email address.");
      return;
    }

    if (!mobileRegex.test(mobile)) {
      setError("Invalid mobile number. Must be 10 digits.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      await onAddAgent({ fullName, email, mobile });
      setFullName("");
      setEmail("");
      setMobile("");
    } catch (err) {
      setError("Failed to add agent. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
        <input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="mt-1 block w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter full name"
          required
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter email"
          required
        />
      </div>
      <div>
        <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">Mobile Number</label>
        <input
          id="mobile"
          type="tel"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          className="mt-1 block w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter mobile number"
          required
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        className="w-full px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
        disabled={isLoading}
      >
        {isLoading ? "Adding..." : "Add Agent"}
      </button>
    </form>
  );
};

export default AddAgentForm;
