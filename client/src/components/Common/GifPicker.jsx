import { useState, useEffect } from 'react';
import axios from 'axios';

const GIPHY_API_KEY = import.meta.env.VITE_GIPHY_API_KEY || 'YOUR_GIPHY_API_KEY';

export default function GifPicker({ onSelect }) {
  const [gifs, setGifs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTrendingGifs();
  }, []);

  const fetchTrendingGifs = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=20`
      );
      setGifs(response.data.data);
    } catch (error) {
      console.error('Fetch trending GIFs error:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchGifs = async (query) => {
    if (!query.trim()) {
      fetchTrendingGifs();
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${query}&limit=20`
      );
      setGifs(response.data.data);
    } catch (error) {
      console.error('Search GIFs error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearch(value);
    const timeoutId = setTimeout(() => searchGifs(value), 500);
    return () => clearTimeout(timeoutId);
  };

  return (
    <div className="bg-white p-3 rounded-lg shadow-lg w-full max-w-md">
      <input
        type="text"
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search GIFs..."
        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none mb-3"
      />

      <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
        {loading ? (
          <div className="col-span-3 text-center py-8">Loading...</div>
        ) : (
          gifs.map((gif) => (
            <img
              key={gif.id}
              src={gif.images.fixed_height_small.url}
              alt={gif.title}
              onClick={() => onSelect(gif.images.original.url)}
              className="w-full h-24 object-cover rounded cursor-pointer hover:opacity-75 transition-opacity"
            />
          ))
        )}
      </div>
    </div>
  );
}