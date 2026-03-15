import { useState } from 'react';
import { userAPI } from '../../services/api';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

export default function UserSearch({ onSelectUser }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (searchQuery) => {
    setQuery(searchQuery);
    
    if (searchQuery.trim().length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await userAPI.searchUsers(searchQuery);
      setResults(response.data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (user) => {
    onSelectUser(user);
    setQuery('');
    setResults([]);
  };

  return (
    <div className="p-4 border-b">
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search users..."
          className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
        />
      </div>

      {results.length > 0 && (
        <div className="mt-2 bg-white rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {results.map((user) => (
            <motion.div
              key={user.id}
              whileHover={{ backgroundColor: '#f3f4f6' }}
              onClick={() => handleUserClick(user)}
              className="flex items-center space-x-3 p-3 cursor-pointer"
            >
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${user.displayName}`}
                alt={user.displayName}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <h4 className="font-semibold text-gray-800">{user.displayName}</h4>
                <p className="text-sm text-gray-600">@{user.username}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      
      {loading && (
        <div className="mt-2 text-center text-gray-500">Searching...</div>
      )}
    </div>
  );
}