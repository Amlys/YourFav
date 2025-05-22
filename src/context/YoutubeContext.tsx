import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'; // Ajout de useEffect
import { Channel, Video } from '../types';
import { youtubeAPI } from '../services/youtubeAPI';

interface YoutubeContextType {
  favorites: Channel[];
  videos: Video[];
  searchResults: Channel[];
  isLoading: boolean;
  error: string | null;
  selectedChannel: string | null;
  addFavorite: (id: string, title: string, thumbnail: string) => void;
  removeFavorite: (id: string) => void;
  searchChannels: (query: string) => Promise<void>;
  fetchLatestVideos: () => Promise<void>;
  loadFromLocalStorage: () => void;
  setSelectedChannel: (id: string | null) => void;
  clearError: () => void;
}

const YoutubeContext = createContext<YoutubeContextType | undefined>(undefined);

export const YoutubeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<Channel[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [searchResults, setSearchResults] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);

  const clearError = () => setError(null);

  const loadFromLocalStorage = useCallback(() => {
    try {
      const savedFavorites = localStorage.getItem('favorites');
      if (savedFavorites) {
        const parsedFavorites: Channel[] = JSON.parse(savedFavorites);
        // Vérifier si les favoris chargés sont différents avant de mettre à jour l'état
        setFavorites(currentFavorites => {
          if (JSON.stringify(parsedFavorites) !== JSON.stringify(currentFavorites)) {
            return parsedFavorites;
          }
          return currentFavorites;
        });
      }
    } catch (e) {
      console.error('Error loading favorites from localStorage', e);
      setError('Failed to load saved channels');
    }
  }, []); // Garder les dépendances vides car localStorage est externe

  const saveToLocalStorage = (channels: Channel[]) => {
    try {
      localStorage.setItem('favorites', JSON.stringify(channels));
    } catch (e) {
      console.error('Error saving to localStorage', e);
      setError('Failed to save channels');
    }
  };

  const addFavorite = (id: string, title: string, thumbnail: string) => {
    try {
      const newChannel: Channel = { id, title, thumbnail };
      const updatedFavorites = [...favorites.filter(f => f.id !== id), newChannel];
      setFavorites(updatedFavorites);
      saveToLocalStorage(updatedFavorites);
      clearError();
    } catch (e) {
      console.error('Error adding favorite', e);
      setError('Failed to add channel to favorites');
    }
  };

  const removeFavorite = (id: string) => {
    try {
      const updatedFavorites = favorites.filter(channel => channel.id !== id);
      setFavorites(updatedFavorites);
      saveToLocalStorage(updatedFavorites);
      
      if (selectedChannel === id) {
        setSelectedChannel(null);
      }
      
      setVideos(prev => prev.filter(video => video.channelId !== id));
      clearError();
    } catch (e) {
      console.error('Error removing favorite', e);
      setError('Failed to remove channel from favorites');
    }
  };

  const searchChannels = useCallback(async (query: string) => { // Envelopper dans useCallback
    setIsLoading(true);
    setError(null);
    try {
      const results = await youtubeAPI.searchChannels(query);
      setSearchResults(results);
      // clearError(); // Pas besoin ici, déjà fait au début
    } catch (error) {
      console.error('Error searching channels:', error);
      setError(error instanceof Error ? error.message : 'Failed to search channels');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [/* Dépendances de youtubeAPI si elle change, sinon vide */]); // Ajouter les dépendances appropriées

  const fetchLatestVideos = useCallback(async () => {
    if (favorites.length === 0) {
      setVideos([]); // Vider les vidéos s'il n'y a pas de favoris
      setIsLoading(false); // S'assurer que isLoading est à false
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const channelIds = favorites.map(channel => channel.id);
      const latestVideos = await youtubeAPI.getLatestVideos(channelIds);
      
      const videosWithChannelThumbnail = latestVideos.map(video => ({
        ...video,
        channelThumbnail: favorites.find(f => f.id === video.channelId)?.thumbnail || ''
      }));
      
      setVideos(videosWithChannelThumbnail);
      // clearError(); // Pas besoin ici, déjà fait au début
    } catch (error) {
      console.error('Error fetching latest videos:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch latest videos');
    } finally {
      setIsLoading(false);
    }
  }, [favorites, /* Dépendances de youtubeAPI si elle change */]); // Dépendances : favorites et les fonctions de mise à jour d'état

  // Charger les favoris au montage initial
  useEffect(() => {
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);

  // Récupérer les vidéos lorsque les favoris changent
  useEffect(() => {
    if (favorites.length > 0) {
      fetchLatestVideos();
    }
  }, [favorites, fetchLatestVideos]); // fetchLatestVideos est maintenant stable grâce à useCallback

  return (
    <YoutubeContext.Provider
      value={{
        favorites,
        videos,
        searchResults,
        isLoading,
        error,
        selectedChannel,
        addFavorite,
        removeFavorite,
        searchChannels,
        fetchLatestVideos,
        loadFromLocalStorage,
        setSelectedChannel,
        clearError,
      }}
    >
      {children}
    </YoutubeContext.Provider>
  );
};

export const useYoutube = (): YoutubeContextType => {
  const context = useContext(YoutubeContext);
  if (context === undefined) {
    throw new Error('useYoutube must be used within a YoutubeProvider');
  }
  return context;
};