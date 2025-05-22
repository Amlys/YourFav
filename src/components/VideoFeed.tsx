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
    watchedVideoIds,
    laterVideoIds,
    markVideoWatched,
    markVideoLater,
    removeVideoFromWatched,
    removeVideoFromLater,
  } = useYoutube();
  const [refreshing, setRefreshing] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [tab, setTab] = useState<'a_voir' | 'deja_vu' | 'plus_tard'>('a_voir');

  const handleRefresh = async () => {
    setRefreshing(true);
    clearError();
    await fetchLatestVideos();
    setTimeout(() => setRefreshing(false), 1000);
  };

  let filteredVideos = videos;
  if (tab === 'a_voir') {
    filteredVideos = videos.filter(
      v => !watchedVideoIds.includes(v.id) && !laterVideoIds.includes(v.id) && (showAll || !selectedChannel || v.channelId === selectedChannel)
    );
  } else if (tab === 'deja_vu') {
    filteredVideos = videos.filter(v => watchedVideoIds.includes(v.id) && (showAll || !selectedChannel || v.channelId === selectedChannel));
  } else if (tab === 'plus_tard') {
    filteredVideos = videos.filter(v => laterVideoIds.includes(v.id) && (showAll || !selectedChannel || v.channelId === selectedChannel));
  }

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
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row md:justify-between md:items-center gap-2">
        <div className="flex items-center gap-2 mb-2 md:mb-0">
          <button onClick={() => setTab('a_voir')} className={`px-3 py-1 rounded-t-md md:rounded-md text-sm font-semibold ${tab === 'a_voir' ? 'bg-red-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>À voir</button>
          <button onClick={() => setTab('deja_vu')} className={`px-3 py-1 rounded-t-md md:rounded-md text-sm font-semibold ${tab === 'deja_vu' ? 'bg-red-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>Déjà visionnée</button>
          <button onClick={() => setTab('plus_tard')} className={`px-3 py-1 rounded-t-md md:rounded-md text-sm font-semibold ${tab === 'plus_tard' ? 'bg-red-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>Plus tard</button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isLoading || refreshing}
            className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            aria-label="Rafraîchir le flux"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          </button>
          {selectedChannel && !showAll && (
            <button
              onClick={() => setShowAll(true)}
              className="ml-2 px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 text-sm transition-colors"
            >
              Voir toutes les vidéos
            </button>
          )}
          {showAll && (
            <button
              onClick={() => setShowAll(false)}
              className="ml-2 px-3 py-1 rounded bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-600 text-sm transition-colors"
            >
              Filtrer par chaîne
            </button>
          )}
        </div>
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
            <VideoCard 
              key={video.id} 
              video={video} 
              tab={tab}
              onMarkWatched={() => markVideoWatched(video.id)}
              onMarkLater={() => markVideoLater(video.id)}
              onRemoveWatched={() => removeVideoFromWatched(video.id)}
              onRemoveLater={() => removeVideoFromLater(video.id)}
            />
          ))}
        </div>
      ) : (
        <div className="p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {selectedChannel 
              ? "Aucune vidéo trouvée pour cette chaîne au cours du dernier mois" 
              : favorites.length > 0 
                ? "Aucune vidéo disponible pour le dernier mois"
                : "Aucune vidéo disponible pour le moment"}
          </p>
          {selectedChannel && (
            <a
              href={`https://www.youtube.com/channel/${selectedChannel}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              <span>Voir la chaîne sur YouTube</span>
              <ExternalLink size={16} className="ml-1" />
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoFeed;