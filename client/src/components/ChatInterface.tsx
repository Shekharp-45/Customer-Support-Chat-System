import React from 'react';

const ChatInterface: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="px-4 py-3 bg-blue-500 text-white flex justify-between">
        <h2 className="text-lg font-semibold">Chat with Support</h2>
        <span className="text-sm">Online</span>
      </header>
      <div className="flex-1 p-4 overflow-y-auto bg-white">
        <div className="mb-4">
          <div className="p-2 bg-gray-200 rounded max-w-xs">Hello, how can I help you?</div>
        </div>
        <div className="mb-4 text-right">
          <div className="p-2 bg-blue-500 text-white rounded max-w-xs ml-auto">I need help with my account.</div>
        </div>
      </div>
      <footer className="px-4 py-3 bg-gray-200 flex items-center">
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border rounded focus:outline-none"
        />
        <button className="ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Send
        </button>
      </footer>
    </div>
  );
};

export default ChatInterface;
