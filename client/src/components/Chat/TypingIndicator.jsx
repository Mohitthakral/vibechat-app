import { motion } from 'framer-motion';

export default function TypingIndicator({ user }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center space-x-2"
    >
      <img
        src={user.avatar || `https://ui-avatars.com/api/?name=${user.displayName}`}
        alt={user.displayName}
        className="w-8 h-8 rounded-full"
      />
      <div className="bg-gray-200 rounded-2xl px-4 py-2 flex space-x-1">
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
          className="w-2 h-2 bg-gray-500 rounded-full"
        />
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
          className="w-2 h-2 bg-gray-500 rounded-full"
        />
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
          className="w-2 h-2 bg-gray-500 rounded-full"
        />
      </div>
    </motion.div>
  );
}