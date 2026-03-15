import { useState, useRef, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import EmojiPicker from 'emoji-picker-react';

export default function MessageInput({ receiverId }) {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [gifs, setGifs] = useState([]);
  const [gifSearch, setGifSearch] = useState('');
  const { socket } = useSocket();
  const typingTimeoutRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const gifPickerRef = useRef(null);

  // Close pickers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
      if (gifPickerRef.current && !gifPickerRef.current.contains(event.target)) {
        setShowGifPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search GIFs using Giphy API
// Search GIFs using Tenor API (Google)
const searchGifs = async (query) => {
  const apiKey = 'AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ'; // Public API key
  const searchTerm = query || 'trending';
  const url = `https://tenor.googleapis.com/v2/search?q=${searchTerm}&key=${apiKey}&limit=20&media_filter=gif`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    const formattedGifs = data.results?.map(item => ({
      id: item.id,
      url: item.media_formats.gif.url,
      title: item.content_description
    })) || [];
    setGifs(formattedGifs);
  } catch (error) {
    console.error('Error fetching GIFs:', error);
    setGifs([]);
  }
};

  useEffect(() => {
    if (showGifPicker) {
      searchGifs('');
    }
  }, [showGifPicker]);

  const handleEmojiClick = (emojiObject) => {
    setMessage((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const handleGifSelect = (gifUrl) => {
    if (!socket || !receiverId) return;
    
    socket.emit('send-message', {
      receiverId,
      content: '',
      mediaUrl: gifUrl,
      mediaType: 'image',
    });
    
    setShowGifPicker(false);
  };

  const handleTyping = (value) => {
    setMessage(value);
    
    if (socket && receiverId) {
      socket.emit('typing', { receiverId });
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop-typing', { receiverId });
      }, 2000);
    }
  };

  const handleSend = () => {
    if (!message.trim() || !socket || !receiverId) {
      return;
    }

    socket.emit('send-message', {
      receiverId,
      content: message.trim(),
    });

    setMessage('');
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (socket) {
      socket.emit('stop-typing', { receiverId });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t p-4 bg-gray-50">
      <div className="flex items-end space-x-2 relative">
        <div className="relative" ref={emojiPickerRef}>
          <button
            type="button"
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker);
              setShowGifPicker(false);
            }}
            className="p-2 text-2xl hover:bg-gray-200 rounded-lg transition"
            title="Add emoji"
          >
            😊
          </button>
          
          {showEmojiPicker && (
            <div className="absolute bottom-full left-0 mb-2 z-50">
              <EmojiPicker onEmojiClick={handleEmojiClick} width={350} height={400} />
            </div>
          )}
        </div>

        <div className="relative" ref={gifPickerRef}>
          <button
            type="button"
            onClick={() => {
              setShowGifPicker(!showGifPicker);
              setShowEmojiPicker(false);
            }}
            className="p-2 px-3 text-sm font-bold text-primary-600 hover:bg-gray-200 rounded-lg transition"
            title="Add GIF"
          >
            GIF
          </button>
          
          {showGifPicker && (
            <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-2xl border-2 border-gray-200 p-3 w-80 max-h-96 overflow-y-auto z-50">
              <input
                type="text"
                placeholder="Search GIFs..."
                value={gifSearch}
                onChange={(e) => {
                  setGifSearch(e.target.value);
                  searchGifs(e.target.value);
                }}
                className="w-full px-3 py-2 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
             <div className="grid grid-cols-2 gap-2">
  {gifs.length === 0 && <p className="text-gray-400 col-span-2 text-center py-4">No GIFs found</p>}
  {gifs.map((gif) => (
    <img
      key={gif.id}
      src={gif.url}
      alt={gif.title}
      className="w-full h-24 object-cover rounded cursor-pointer hover:opacity-75 transition"
      onClick={() => handleGifSelect(gif.url)}
    />
                ))}
              </div>
            </div>
          )}
        </div>

        <textarea
          value={message}
          onChange={(e) => handleTyping(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 resize-none outline-none"
          rows="1"
          style={{ minHeight: '40px', maxHeight: '120px' }}
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={!message.trim()}
          className="px-6 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg hover:from-primary-600 hover:to-accent-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
        >
          Send
        </button>
      </div>
    </div>
  );
}