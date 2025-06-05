import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Youtube, Moon, Sun, LogIn, LogOut, Search, AlertCircle, Plus, User } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useSearch } from '../contexts/SearchContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { Channel } from '../types.ts';

const Header: React.FC = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const { currentUser, signInWithGoogle, signOutUser } = useAuth();
  const { searchResults, isLoading, error, searchChannels, clearError } = useSearch();
  const { addFavorite } = useFavorites();
  
  // États pour la SearchBar intégrée
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [addingFavorite, setAddingFavorite] = useState<string | null>(null);
  const [brokenThumbnails, setBrokenThumbnails] = useState<string[]>([]);

  useEffect(() => {
    // Cacher les résultats si on clique en dehors de la searchbar et de ses résultats
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showResults && !target.closest('.header-search-container')) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showResults]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      clearError();
      await searchChannels(query);
      setShowResults(true);
    }
  };

  const handleAddFavorite = async (channel: Channel) => {
    if (!currentUser) {
      return;
    }

    try {
      setAddingFavorite(channel.id);
      await addFavorite(channel);
      setShowResults(false);
      setQuery('');
      clearError();
    } catch (error) {
      console.error('[Header] Erreur lors de l\'ajout aux favoris:', error);
    } finally {
      setAddingFavorite(null);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-full px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo Section */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors flex-shrink-0"
          >
            <Youtube size={28} />
            <span className="font-bold text-xl lg:text-2xl">YourFav</span>
          </Link>
          
          {/* Search Section - Uniquement visible pour les utilisateurs connectés */}
          {currentUser && (
            <div className="flex-1 max-w-md lg:max-w-lg xl:max-w-2xl mx-4 lg:mx-8 header-search-container">
              <form onSubmit={handleSearch} className="relative">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="block w-full pl-10 pr-20 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-600 focus:border-transparent transition-all duration-200 shadow-sm"
                    placeholder="Rechercher une chaîne YouTube..."
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !query.trim()}
                    className="absolute right-1 top-1 bottom-1 bg-red-600 hover:bg-red-700 text-white px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    {isLoading ? '...' : 'Chercher'}
                  </button>
                </div>

                {/* Résultats de recherche */}
                {error && showResults && (
                  <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                      <AlertCircle size={16} />
                      <p className="text-sm">{error}</p>
                    </div>
                  </div>
                )}

                {showResults && searchResults && searchResults.length > 0 && !error && (
                  <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="max-h-80 overflow-y-auto">
                      {searchResults.map((channel: Channel) => (
                        <div
                          key={channel.id}
                          className="p-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          {/* Miniature de la chaîne */}
                          <div className="flex-shrink-0">
                            {channel.thumbnail && !brokenThumbnails.includes(channel.id) ? (
                              <img
                                src={channel.thumbnail}
                                alt={channel.title}
                                className="w-10 h-10 rounded-full object-cover"
                                onError={() => {
                                  setBrokenThumbnails((prev) => [...prev, channel.id]);
                                }}
                              />
                            ) : (
                              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                                <User size={20} className="text-gray-400 dark:text-gray-500" />
                              </div>
                            )}
                          </div>
                          
                          {/* Informations de la chaîne */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-gray-900 dark:text-white font-medium text-sm truncate">
                              {channel.title}
                            </h3>
                            {channel.description && (
                              <p className="text-gray-500 dark:text-gray-400 text-xs truncate">
                                {channel.description.length > 80 
                                  ? channel.description.substring(0, 80) + '...' 
                                  : channel.description
                                }
                              </p>
                            )}
                          </div>
                          
                          {/* Bouton d'ajout */}
                          <div className="flex-shrink-0">
                            <button
                              onClick={() => handleAddFavorite(channel)}
                              disabled={addingFavorite === channel.id}
                              className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full flex items-center justify-center disabled:opacity-50 transition-colors"
                              aria-label={`Ajouter ${channel.title} aux favoris`}
                            >
                              {addingFavorite === channel.id ? (
                                <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <Plus size={14} />
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {showResults && searchResults.length === 0 && !error && !isLoading && (
                  <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
                    <p className="text-gray-500 dark:text-gray-300 text-sm">Aucune chaîne trouvée</p>
                  </div>
                )}
              </form>
            </div>
          )}
          
          {/* Controls Section */}
          <div className="flex items-center space-x-2 lg:space-x-4 flex-shrink-0">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? (
                <Sun size={20} className="text-yellow-400" />
              ) : (
                <Moon size={20} className="text-gray-600" />
              )}
            </button>

            {currentUser ? (
              <div className="flex items-center space-x-2 lg:space-x-3">
                {currentUser.photoURL && (
                  <img 
                    src={currentUser.photoURL} 
                    alt={currentUser.displayName || 'User avatar'} 
                    className="w-8 h-8 lg:w-9 lg:h-9 rounded-full border border-gray-200 dark:border-gray-600"
                  />
                )}
                <span className="text-sm lg:text-base text-gray-700 dark:text-gray-300 hidden sm:inline font-medium max-w-32 truncate">
                  {currentUser.displayName || currentUser.email}
                </span>
                <button
                  onClick={signOutUser}
                  className="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Sign out"
                >
                  <LogOut size={16} />
                  <span className="hidden lg:inline">Déconnexion</span>
                </button>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                aria-label="Sign in with Google"
              >
                <LogIn size={16} />
                <span>Connexion</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;