import React, { useState, useMemo, useCallback } from 'react';
import VideoCard from './VideoCard';
import { useFavorites } from '../contexts/FavoritesContext';
import { useVideos } from '../contexts/VideosContext';
import { useSearch } from '../contexts/SearchContext';
import { ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';

const VideoFeed: React.FC = () => {
  const { favorites } = useFavorites();
  const { selectedChannel } = useSearch();
  const { 
    videos, 
    isLoading, 
    error,
    clearError,
    fetchLatestVideos,
    watchedVideoIds,
    laterVideoIds,
    deletedVideoIds,
    markVideoWatched,
    markVideoLater,
    markVideoDeleted,
    removeVideoFromWatched,
    removeVideoFromLater,
    restoreVideoFromDeleted,
  } = useVideos();
  const [refreshing, setRefreshing] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [tab, setTab] = useState<'a_voir' | 'deja_vu' | 'plus_tard' | 'supprimees'>('a_voir');

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    clearError();
    await fetchLatestVideos();
    setTimeout(() => setRefreshing(false), 1000);
  }, [clearError, fetchLatestVideos]);

  // Mémoisation des vidéos filtrées pour éviter les re-calculs inutiles
  const filteredVideos = useMemo(() => {
    if (tab === 'a_voir') {
      return videos.filter(
        v => !watchedVideoIds.includes(v.id) && 
            !laterVideoIds.includes(v.id) && 
            !deletedVideoIds.includes(v.id) &&
            (showAll || !selectedChannel || v.channelId === selectedChannel)
      );
    } else if (tab === 'deja_vu') {
      return videos.filter(
        v => watchedVideoIds.includes(v.id) && 
            (showAll || !selectedChannel || v.channelId === selectedChannel)
      );
    } else if (tab === 'plus_tard') {
      return videos.filter(
        v => laterVideoIds.includes(v.id) && 
            (showAll || !selectedChannel || v.channelId === selectedChannel)
      );
    } else if (tab === 'supprimees') {
      return videos.filter(
        v => deletedVideoIds.includes(v.id) && 
            (showAll || !selectedChannel || v.channelId === selectedChannel)
      );
    }
    return videos;
  }, [videos, tab, watchedVideoIds, laterVideoIds, deletedVideoIds, showAll, selectedChannel]);

  // Mémoisation du nom de la chaîne sélectionnée
  const selectedChannelName = useMemo(() => 
    selectedChannel ? favorites.find(f => f.id === selectedChannel)?.title : null,
    [selectedChannel, favorites]
  );

  // Mémoisation des handlers de changement d'onglet
  const handleTabChange = useCallback((newTab: 'a_voir' | 'deja_vu' | 'plus_tard' | 'supprimees') => 
    setTab(newTab), []);
  
  const handleShowAllToggle = useCallback(() => setShowAll(prev => !prev), []);

  // Mémoisation des handlers de vidéo pour éviter les re-créations
  const createVideoHandlers = useCallback((videoId: string) => ({
    onMarkWatched: () => markVideoWatched(videoId),
    onMarkLater: () => markVideoLater(videoId),
    onMarkDeleted: () => markVideoDeleted(videoId),
    onRemoveWatched: () => removeVideoFromWatched(videoId),
    onRemoveLater: () => removeVideoFromLater(videoId),
    onRestoreDeleted: () => restoreVideoFromDeleted(videoId),
  }), [markVideoWatched, markVideoLater, markVideoDeleted, removeVideoFromWatched, removeVideoFromLater, restoreVideoFromDeleted]);

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-6">
          <AlertCircle size={24} />
          <p className="text-lg">{error}</p>
        </div>
        <button
          onClick={handleRefresh}
          className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-2 font-medium"
        >
          <RefreshCw size={18} />
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
      <div className="p-5 lg:p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <button 
            onClick={() => handleTabChange('a_voir')} 
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              tab === 'a_voir' 
                ? 'bg-red-600 text-white shadow-md' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            À voir
          </button>
          <button 
            onClick={() => handleTabChange('deja_vu')} 
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              tab === 'deja_vu' 
                ? 'bg-red-600 text-white shadow-md' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Déjà visionnée
          </button>
          <button 
            onClick={() => handleTabChange('plus_tard')} 
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              tab === 'plus_tard' 
                ? 'bg-red-600 text-white shadow-md' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Plus tard
          </button>
          <button 
            onClick={() => handleTabChange('supprimees')} 
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              tab === 'supprimees' 
                ? 'bg-red-600 text-white shadow-md' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Supprimées
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isLoading || refreshing}
            className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50"
            aria-label="Rafraîchir le flux"
          >
            <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
          </button>
          {selectedChannel && !showAll && (
            <button
              onClick={handleShowAllToggle}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm font-medium transition-colors shadow-sm"
            >
              Voir toutes les vidéos
            </button>
          )}
          {showAll && (
            <button
              onClick={handleShowAllToggle}
              className="px-4 py-2 rounded-lg bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-600 text-sm font-medium transition-colors shadow-sm"
            >
              Filtrer par chaîne
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 flex justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 mb-4"></div>
            <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      ) : filteredVideos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 p-6">
          {filteredVideos.map((video) => {
            const handlers = createVideoHandlers(video.id);
            return (
              <VideoCard 
                key={video.id} 
                video={video} 
                tab={tab}
                {...handlers}
              />
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-lg">
              {tab === 'supprimees' 
                ? "Aucune vidéo supprimée"
                : selectedChannel 
                  ? "Aucune vidéo trouvée pour cette chaîne au cours du dernier mois" 
                  : favorites.length > 0 
                    ? "Aucune vidéo disponible pour le dernier mois"
                    : "Aucune vidéo disponible pour le moment"}
            </p>
            {selectedChannel && tab !== 'supprimees' && (
              <a
                href={`https://www.youtube.com/channel/${selectedChannel}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
              >
                <span>Voir la chaîne sur YouTube</span>
                <ExternalLink size={16} className="ml-2" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoFeed;