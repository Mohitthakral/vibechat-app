import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';

export default function MessageBubble({ message }) {
  const { user } = useAuth();
  const isSent = message.senderId === user?.id;

  return (
    <div className={`flex ${isSent ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`max-w-[70%] px-4 py-2 rounded-2xl ${
        isSent
          ? 'bg-primary-400 text-white rounded-br-none shadow-lg'
          : 'bg-white text-gray-800 shadow-lg rounded-bl-none'
      }`}>
        {message.content && (
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        )}
        {message.mediaUrl && message.mediaType === 'image' && (
          <img src={message.mediaUrl} alt="Shared" className="rounded-lg max-w-full mt-1" />
        )}
        <div className={`flex items-center mt-1 space-x-1 ${isSent ? 'justify-end' : 'justify-start'}`}>
          <span className={`text-xs ${isSent ? 'text-white opacity-70' : 'text-gray-400'}`}>
            {format(new Date(message.createdAt), 'HH:mm')}
          </span>
          {isSent && (
            <span className="text-xs text-white opacity-70">
              {message.isRead ? '✓✓' : '✓'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}