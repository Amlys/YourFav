import React from 'react';
import { Trash2 } from 'lucide-react';
import { useYoutube } from '../context/YoutubeContext';

const FavoritesList: React.FC = () => {
  const { favorites, removeFavorite, setSelectedChannel, selectedChannel } = useYoutube();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Favorite Channels</h2>
      </div>
      {favorites.length > 0 ? (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {favorites.map((channel) => (
            <li key={channel.id} className="relative">
              <div 
                className={`p-4 flex items-center space-x-3 cursor-pointer transition-colors ${
                  selectedChannel === channel.id 
                    ? 'bg-red-50 dark:bg-red-900/20' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                onClick={() => setSelectedChannel(channel.id)}
              >
                <div className="flex-shrink-0">
                  <img
                    src={channel.thumbnail}
                    alt={channel.title}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {channel.title}
                  </p>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFavorite(channel.id);
                  }}
                  className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  aria-label={`Remove ${channel.title}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          <p>No favorite channels yet</p>
        </div>
      )}
    </div>
  );
};

export default FavoritesList;