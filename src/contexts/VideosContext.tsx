import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Video } from '../types';
import { youtubeAPI } from '../services/youtubeAPI';
import { useAuth } from './AuthContext';
import { useFavorites } from './FavoritesContext';

interface VideosContextType {
  videos: Video[];
  watchedVideoIds: string[];
  laterVideoIds: string[];
  deletedVideoIds: string[];
  isLoading: boolean;
  error: string | null;
  fetchLatestVideos: () => Promise<void>;
  markVideoWatched: (videoId: string) => void;
  markVideoLater: (videoId: string) => void;
  markVideoDeleted: (videoId: string) => void;
  removeVideoFromWatched: (videoId: string) => void;
  removeVideoFromLater: (videoId: string) => void;
  restoreVideoFromDeleted: (videoId: string) => void;
  clearError: () => void;
}

const VideosContext = createContext<VideosContextType | undefined>(undefined);

export const VideosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { favorites } = useFavorites();
  const [videos, setVideos] = useState<Video[]>([]);
  const [watchedVideoIds, setWatchedVideoIds] = useState<string[]>([]);
  const [laterVideoIds, setLaterVideoIds] = useState<string[]>([]);
  const [deletedVideoIds, setDeletedVideoIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  // Mémoisation des clés localStorage pour éviter les re-calculs
  const storageKeys = useMemo(() => {
    if (!currentUser) return null;
    return {
      watched: `watchedVideos_${currentUser.uid}`,
      later: `laterVideos_${currentUser.uid}`,
      deleted: `deletedVideos_${currentUser.uid}`,
    };
  }, [currentUser]);

  // Gestion du localStorage pour les vidéos vues, plus tard et supprimées (par utilisateur)
  useEffect(() => {
    if (!currentUser || !storageKeys) {
      setWatchedVideoIds([]);
      setLaterVideoIds([]);
      setDeletedVideoIds([]);
      return;
    }
    
    const watched = localStorage.getItem(storageKeys.watched);
    const later = localStorage.getItem(storageKeys.later);
    const deleted = localStorage.getItem(storageKeys.deleted);
    
    setWatchedVideoIds(watched ? JSON.parse(watched) : []);
    setLaterVideoIds(later ? JSON.parse(later) : []);
    setDeletedVideoIds(deleted ? JSON.parse(deleted) : []);
  }, [currentUser, storageKeys]);

  // Sauvegarder les vidéos vues dans localStorage
  useEffect(() => {
    if (!currentUser || !storageKeys) return;
    localStorage.setItem(storageKeys.watched, JSON.stringify(watchedVideoIds));
  }, [watchedVideoIds, currentUser, storageKeys]);

  // Sauvegarder les vidéos "plus tard" dans localStorage
  useEffect(() => {
    if (!currentUser || !storageKeys) return;
    localStorage.setItem(storageKeys.later, JSON.stringify(laterVideoIds));
  }, [laterVideoIds, currentUser, storageKeys]);

  // Sauvegarder les vidéos supprimées dans localStorage
  useEffect(() => {
    if (!currentUser || !storageKeys) return;
    localStorage.setItem(storageKeys.deleted, JSON.stringify(deletedVideoIds));
  }, [deletedVideoIds, currentUser, storageKeys]);

  const markVideoWatched = useCallback((videoId: string) => {
    setWatchedVideoIds((prev) => prev.includes(videoId) ? prev : [...prev, videoId]);
    setLaterVideoIds((prev) => prev.filter(id => id !== videoId)); // Si on marque comme vue, on l'enlève de "plus tard"
    setDeletedVideoIds((prev) => prev.filter(id => id !== videoId)); // Et on l'enlève de "supprimées"
  }, []);

  const markVideoLater = useCallback((videoId: string) => {
    setLaterVideoIds((prev) => prev.includes(videoId) ? prev : [...prev, videoId]);
    setWatchedVideoIds((prev) => prev.filter(id => id !== videoId)); // Si on met "plus tard", on l'enlève de "vue"
    setDeletedVideoIds((prev) => prev.filter(id => id !== videoId)); // Et on l'enlève de "supprimées"
  }, []);

  const markVideoDeleted = useCallback((videoId: string) => {
    setDeletedVideoIds((prev) => prev.includes(videoId) ? prev : [...prev, videoId]);
    setWatchedVideoIds((prev) => prev.filter(id => id !== videoId)); // Si on supprime, on l'enlève de "vue"
    setLaterVideoIds((prev) => prev.filter(id => id !== videoId)); // Et on l'enlève de "plus tard"
  }, []);

  const removeVideoFromWatched = useCallback((videoId: string) => {
    setWatchedVideoIds((prev) => prev.filter(id => id !== videoId));
  }, []);

  const removeVideoFromLater = useCallback((videoId: string) => {
    setLaterVideoIds((prev) => prev.filter(id => id !== videoId));
  }, []);

  const restoreVideoFromDeleted = useCallback((videoId: string) => {
    setDeletedVideoIds((prev) => prev.filter(id => id !== videoId));
  }, []);

  const fetchLatestVideos = useCallback(async () => {
    if (!currentUser) {
      setVideos([]);
      setIsLoading(false);
      return;
    }
    
    if (favorites.length === 0) {
      setVideos([]);
      setIsLoading(false);
      console.log("[VideosContext] No favorites to fetch videos for.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    console.info(`[VideosContext] Fetching latest videos for ${favorites.length} favorite(s) of user ${currentUser.uid}.`);
    
    try {
      const channelIds = favorites.map(channel => channel.id);
      const latestVideos = await youtubeAPI.getLatestVideos(channelIds);
      
      // Ajouter les miniatures des chaînes aux vidéos
      const videosWithChannelThumbnail = latestVideos.map(video => ({
        ...video,
        channelThumbnail: favorites.find(f => f.id === video.channelId)?.thumbnail || ''
      }));
      
      setVideos(videosWithChannelThumbnail);
      console.log(`[VideosContext] Successfully fetched ${latestVideos.length} videos for user ${currentUser.uid}.`);
    } catch (error: any) {
      console.error(`[VideosContext] Error fetching latest videos for user ${currentUser.uid}:`, error.message || error);
      setError(error.message || 'Failed to fetch latest videos');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, favorites]);

  // Récupérer les vidéos lorsque les favoris changent
  useEffect(() => {
    if (currentUser && favorites.length > 0) {
      console.log("[VideosContext] Favorites changed or user changed, fetching latest videos.");
      fetchLatestVideos();
    } else if (currentUser && favorites.length === 0) {
      console.log("[VideosContext] User has no favorites, clearing videos.");
      setVideos([]);
    }
  }, [currentUser, favorites, fetchLatestVideos]);

  // Mémoisation de la valeur du contexte pour éviter les re-renders inutiles
  const contextValue = useMemo(() => ({
    videos,
    watchedVideoIds,
    laterVideoIds,
    deletedVideoIds,
    isLoading,
    error,
    fetchLatestVideos,
    markVideoWatched,
    markVideoLater,
    markVideoDeleted,
    removeVideoFromWatched,
    removeVideoFromLater,
    restoreVideoFromDeleted,
    clearError,
  }), [
    videos,
    watchedVideoIds,
    laterVideoIds,
    deletedVideoIds,
    isLoading,
    error,
    fetchLatestVideos,
    markVideoWatched,
    markVideoLater,
    markVideoDeleted,
    removeVideoFromWatched,
    removeVideoFromLater,
    restoreVideoFromDeleted,
    clearError,
  ]);

  return (
    <VideosContext.Provider value={contextValue}>
      {children}
    </VideosContext.Provider>
  );
};

export const useVideos = (): VideosContextType => {
  const context = useContext(VideosContext);
  if (context === undefined) {
    throw new Error('useVideos must be used within a VideosProvider');
  }
  return context;
}; 