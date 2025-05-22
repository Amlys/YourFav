import React from 'react';
import SearchBar from '../components/SearchBar';
import VideoFeed from '../components/VideoFeed';
import FavoritesList from '../components/FavoritesList';
import { useYoutube } from '../context/YoutubeContext';

const HomePage: React.FC = () => {
  const { favorites, currentUser, isLoading } = useYoutube(); 

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
          {isLoading && <p className="text-center text-gray-500 dark:text-gray-400">Loading videos...</p>}
          {!isLoading && !currentUser && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm text-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Welcome to Yourfav!
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Please sign in to see your personalized feed and manage your favorite channels.
              </p>
            </div>
          )}
          {!isLoading && currentUser && favorites.length === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm text-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                No favorites yet
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Search for YouTubers and add them to your favorites to see their latest videos here.
              </p>
            </div>
          )}
          {!isLoading && currentUser && favorites.length > 0 && (
            <VideoFeed />
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;