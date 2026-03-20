import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, CameraIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    bio: user?.bio || '',
  });
  const [selectedFile, setSelectedFile] = useState(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      data.append('displayName', formData.displayName);
      data.append('bio', formData.bio);
      if (selectedFile) data.append('avatar', selectedFile);

      // WITH this:
const response = await userAPI.updateProfile(data);
toast.success('Profile updated! 🎉');

// Wait for toast to show then redirect
setTimeout(() => {
  window.location.href = '/chat';
}, 1500);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-accent-500 text-white p-4 flex items-center space-x-3">
        <button onClick={() => navigate('/chat')} className="p-1 rounded-full hover:bg-white/20">
          <ArrowLeftIcon className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold">Edit Profile</h1>
      </div>

      <div className="max-w-md mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
       {/* Avatar */}
<div className="flex justify-center mb-6">
  <div className="relative cursor-pointer" onClick={() => fileInputRef.current.click()}>
    <img
      src={avatarPreview || `https://ui-avatars.com/api/?name=${user?.displayName}&background=random&size=128`}
      alt="Profile"
      className="w-32 h-32 rounded-full object-cover border-4 border-primary-200"
    />
    <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
      <CameraIcon className="h-8 w-8 text-white" />
    </div>
    <div className="absolute bottom-0 right-0 bg-primary-500 text-white p-2 rounded-full shadow-lg">
      <CameraIcon className="h-5 w-5" />
    </div>
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      className="hidden"
      onChange={handleImageSelect}
    />
  </div>
</div>
          </div>

          <p className="text-center text-sm text-gray-500 mb-6">
            Tap the camera icon to change your photo
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                disabled
                value={user?.username}
                className="input-field opacity-60 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">Username cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name
              </label>
              <input
                type="text"
                className="input-field"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="Your display name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                className="input-field resize-none"
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell something about yourself..."
                maxLength={150}
              />
              <p className="text-xs text-gray-400 mt-1">{formData.bio.length}/150</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}