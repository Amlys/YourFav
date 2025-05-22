import React, { useState } from 'react';
import { Search, AlertCircle } from 'lucide-react';
import { useYoutube } from '../context/YoutubeContext';

const SearchBar: React.FC = () => {
  const { searchChannels, addFavorite, searchResults, isLoading, error, clearError } = useYoutube();
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      clearError();
      await searchChannels(query);
      setShowResults(true);
    }
  };

  const handleAddFavorite = (channelId: string, channelTitle: string, channelThumbnail: string) => {
    try {
      addFavorite(channelId, channelTitle, channelThumbnail);
      setShowResults(false);
      setQuery('');
      clearError();
    } catch (error) {
      console.error('Error adding favorite:', error);
    }
  };

  return (
    <div className="relative">
      <form onSubmit={handleSearch} className="flex">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-600"
            placeholder="Search for a YouTube channel..."
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-r-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && showResults && (
        <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 rounded-md shadow-lg p-4">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertCircle size={16} />
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {showResults && searchResults.length > 0 && !error && (
        <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden">
          <div className="max-h-96 overflow-y-auto">
            {searchResults.map((channel) => (
              <div
                key={channel.id}
                className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                onClick={() => handleAddFavorite(channel.id, channel.title, channel.thumbnail)}
              >
                <img
                  src={channel.thumbnail}
                  alt={channel.title}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-gray-900 dark:text-white font-medium">{channel.title}</h3>
                  <p className="text-gray-500 dark:text-gray-300 text-sm truncate">{channel.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showResults && searchResults.length === 0 && !error && !isLoading && (
        <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 rounded-md shadow-lg p-3 text-center">
          <p className="text-gray-500 dark:text-gray-300">No channels found</p>
        </div>
      )}
    </div>
  );
};

export default SearchBar;