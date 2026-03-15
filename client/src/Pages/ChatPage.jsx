import { useState } from 'react';
import UserSearch from '../components/User/UserSearch';
import ConversationList from '../components/Chat/ConversationList';
import ChatWindow from '../components/Chat/ChatWindow';

export default function ChatPage() {
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <div className="h-[calc(100vh-64px)] flex">
      {/* Sidebar */}
          <div className="w-80 border-r flex flex-col bg-purple-100">
            <UserSearch onSelectUser={setSelectedUser} />
           <div className="w-80 border-r flex flex-col" style={{backgroundColor: '#F5F3FF'}}>
             <ConversationList onSelectUser={setSelectedUser} />
        </div>
      </div>

      {/* Chat Window */}
      <ChatWindow selectedUser={selectedUser} />
    </div>
  );
}