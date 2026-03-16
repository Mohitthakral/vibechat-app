import { useState } from 'react';
import UserSearch from '../components/User/UserSearch';
import ConversationList from '../components/Chat/ConversationList';
import ChatWindow from '../components/Chat/ChatWindow';

export default function ChatPage() {
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <div className="h-[calc(100vh-64px)] flex">
      {/* Sidebar - hidden on mobile when chat is open */}
      <div className={`${selectedUser ? 'hidden md:flex' : 'flex'} w-full md:w-80 border-r flex-col bg-purple-100 shrink-0`}>
        <UserSearch onSelectUser={setSelectedUser} />
        <div className="flex-1 overflow-y-auto" style={{backgroundColor: '#F5F3FF'}}>
          <ConversationList onSelectUser={setSelectedUser} />
        </div>
      </div>

      {/* Chat Window - full screen on mobile */}
      <div className={`${selectedUser ? 'flex' : 'hidden md:flex'} flex-1 flex-col`}>
        {selectedUser && (
          <button 
            className="md:hidden p-2 text-left bg-purple-100 text-purple-700 font-medium"
            onClick={() => setSelectedUser(null)}
          >
            ← Back
          </button>
        )}
        <ChatWindow selectedUser={selectedUser} />
      </div>
    </div>
  );
}