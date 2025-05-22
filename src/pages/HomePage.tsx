import React, { useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import VideoFeed from '../components/VideoFeed';
import FavoritesList from '../components/FavoritesList';
import { useYoutube } from '../context/YoutubeContext';

const HomePage: React.FC = () => {
  const { loadFromLocalStorage, favorites } = useYoutube();
  
  useEffect(() => {
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);

  return (
    <div className="flex flex-col space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Yourfav <span className="text-red-600">YouTube</span> Feed
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Keep up with your favorite YouTubers in one personalized feed
        </p>
        <SearchBar />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <FavoritesList />
        </div>
        <div className="lg:col-span-3">
          {favorites.length > 0 ? (
            <VideoFeed />
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm text-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                No favorites yet
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Search for your favorite YouTubers to add them to your feed
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;