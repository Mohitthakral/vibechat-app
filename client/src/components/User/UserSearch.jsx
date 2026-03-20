import { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import { MagnifyingGlassIcon, UserPlusIcon, UserMinusIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function UserSearch({ onSelectUser }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [following, setFollowing] = useState(new Set());
  const [followLoading, setFollowLoading] = useState({});

  useEffect(() => {
    const loadFollowing = async () => {
      try {
        const response = await userAPI.getFollowing();
        const followingIds = new Set(response.data.map(u => u.id));
        setFollowing(followingIds);
      } catch (error) {
        console.error('Load following error:', error);
      }
    };
    loadFollowing();
  }, []);

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

  const handleFollow = async (e, userId) => {
    e.stopPropagation();
    setFollowLoading(prev => ({ ...prev, [userId]: true }));
    try {
      await userAPI.followUser(userId);
      setFollowing(prev => new Set([...prev, userId]));
      toast.success('Follow request sent! 🎉');
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setFollowLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleUnfollow = async (e, userId) => {
    e.stopPropagation();
    setFollowLoading(prev => ({ ...prev, [userId]: true }));
    try {
      await userAPI.unfollowUser(userId);
      setFollowing(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
      toast.success('Unfollowed!');
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setFollowLoading(prev => ({ ...prev, [userId]: false }));
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
              className="flex items-center justify-between p-3"
            >
              {/* User info */}
              <div className="flex items-center space-x-3 flex-1">
                <img
                  src={user.avatar || `https://ui-avatars.com/api/?name=${user.displayName}`}
                  alt={user.displayName}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <h4 className="font-semibold text-gray-800">{user.displayName}</h4>
                  <p className="text-sm text-gray-600">@{user.username}</p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center space-x-2">
                {!following.has(user.id) ? (
                  // Not following — show Follow button only
                  <button
                    onClick={(e) => handleFollow(e, user.id)}
                    disabled={followLoading[user.id]}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 transition-colors"
                  >
                    {followLoading[user.id] ? (
                      <span>...</span>
                    ) : (
                      <>
                        <UserPlusIcon className="h-4 w-4" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                ) : (
                  // Following — show Chat + Unfollow buttons
                  <>
                    <button
                      onClick={() => handleUserClick(user)}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-medium bg-green-500 text-white hover:bg-green-600 transition-colors"
                    >
                      <ChatBubbleLeftIcon className="h-4 w-4" />
                      <span>Chat</span>
                    </button>
                    <button
                      onClick={(e) => handleUnfollow(e, user.id)}
                      disabled={followLoading[user.id]}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                      {followLoading[user.id] ? (
                        <span>...</span>
                      ) : (
                        <>
                          <UserMinusIcon className="h-4 w-4" />
                          <span>Unfollow</span>
                        </>
                      )}
                    </button>
                  </>
                )}
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