import React from 'react';
import { Trash2, Plus, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useSearch } from '../contexts/SearchContext';
import { Channel } from '../types.ts';

const FavoritesList: React.FC = () => {
  const { currentUser } = useAuth();
  const { favorites, removeFavorite } = useFavorites();
  const { selectedChannel, setSelectedChannel } = useSearch();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
      <div className="p-5 lg:p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Chaînes Favorites</h2>
      </div>
      {!currentUser && (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          <p className="text-lg">Connectez-vous pour voir vos chaînes favorites</p>
        </div>
      )}
      {currentUser && favorites.length > 0 ? (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {favorites.map((channel: Channel) => (
            <li key={channel.id} className="relative">
              <div 
                className={`p-4 lg:p-5 flex items-center space-x-4 cursor-pointer transition-all duration-200 ${
                  selectedChannel === channel.id 
                    ? 'bg-red-50 dark:bg-red-900/20 border-r-4 border-red-600' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                onClick={() => setSelectedChannel(channel.id)}
              >
                <div className="flex-shrink-0">
                  {channel.thumbnail ? (
                    <img
                      src={channel.thumbnail}
                      alt={channel.title}
                      className="w-12 h-12 rounded-full object-cover shadow-sm"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 shadow-sm">
                      <User size={24} className="text-gray-400 dark:text-gray-500" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-medium text-gray-900 dark:text-white truncate">
                    {channel.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Chaîne YouTube
                  </p>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFavorite(channel.id);
                  }}
                  className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                  aria-label={`Supprimer ${channel.title}`}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : currentUser ? (
        <div className="p-8 lg:p-12 text-center">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <Plus size={48} className="mx-auto" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg font-medium mb-3">Pas encore de chaînes favorites</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 leading-relaxed">
            Utilisez la barre de recherche ci-dessus pour trouver et ajouter vos chaînes YouTube préférées
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default FavoritesList;