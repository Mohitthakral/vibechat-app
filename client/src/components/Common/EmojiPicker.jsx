import { useState } from 'react';

const EMOJIS = [
  '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂',
  '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛',
  '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩', '🥳',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
  '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👏', '🙌',
  '🎉', '🎊', '🎁', '🎈', '🎂', '🍕', '🍔', '🍟', '🌮', '🍿',
];

export default function EmojiPicker({ onSelect }) {
  return (
    <div className="bg-white p-3 rounded-lg shadow-lg grid grid-cols-10 gap-2 max-h-48 overflow-y-auto">
      {EMOJIS.map((emoji, index) => (
        <button
          key={index}
          onClick={() => onSelect(emoji)}
          className="text-2xl hover:bg-gray-100 rounded p-1 transition-colors"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}