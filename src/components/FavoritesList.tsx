import React from 'react';
import { Trash2, Plus, User } from 'lucide-react';
import { useYoutube } from '../context/YoutubeContext.tsx';
import { Channel } from '../types.ts';

const FavoritesList: React.FC = () => {
  const { favorites, removeFavorite, setSelectedChannel, selectedChannel, currentUser } = useYoutube();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Chaînes Favorites</h2>
      </div>
      {!currentUser && (
        <div className="p-6 text-center text-gray-500 dark:text-gray-400">
          <p>Connectez-vous pour voir vos chaînes favorites</p>
        </div>
      )}
      {currentUser && favorites.length > 0 ? (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {favorites.map((channel: Channel) => (
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
                  {channel.thumbnail ? (
                    <img
                      src={channel.thumbnail}
                      alt={channel.title}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                      <User size={28} className="text-gray-400 dark:text-gray-500" />
                    </div>
                  )}
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
                  aria-label={`Supprimer ${channel.title}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : currentUser ? (
        <div className="p-6 text-center">
          <div className="text-gray-400 dark:text-gray-500 mb-3">
            <Plus size={40} className="mx-auto" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 mb-2">Pas encore de chaînes favorites</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Utilisez la barre de recherche ci-dessus pour trouver et ajouter vos chaînes YouTube préférées
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default FavoritesList;