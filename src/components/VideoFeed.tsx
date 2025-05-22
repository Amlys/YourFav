import React, { useState } from 'react';
import VideoCard from './VideoCard';
import { useYoutube } from '../context/YoutubeContext';
import { ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';

const VideoFeed: React.FC = () => {
  const { 
    favorites, 
    videos, 
    isLoading, 
    error,
    selectedChannel,
    clearError,
    fetchLatestVideos, // Garder pour le rafraîchissement manuel
  } = useYoutube();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    clearError();
    await fetchLatestVideos();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const filteredVideos = selectedChannel 
    ? videos.filter(video => video.channelId === selectedChannel)
    : videos;

  const selectedChannelName = selectedChannel 
    ? favorites.find(f => f.id === selectedChannel)?.title 
    : null;

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-4">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
        <button
          onClick={handleRefresh}
          className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {selectedChannelName 
            ? `Latest from ${selectedChannelName}` 
            : 'Latest Videos'}
        </h2>
        <button
          onClick={handleRefresh}
          disabled={isLoading || refreshing}
          className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          aria-label="Refresh feed"
        >
          <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      {isLoading ? (
        <div className="p-8 flex justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 mb-4"></div>
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      ) : filteredVideos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
          {filteredVideos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      ) : (
        <div className="p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {selectedChannel 
              ? "No videos found for this channel in the last month" 
              : favorites.length > 0 
                ? "No videos available from the last month"
                : "No videos available yet"}
          </p>
          {selectedChannel && (
            <a
              href={`https://www.youtube.com/channel/${selectedChannel}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              <span>View channel on YouTube</span>
              <ExternalLink size={16} className="ml-1" />
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoFeed;