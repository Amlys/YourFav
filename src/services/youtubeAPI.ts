import { Channel, Video } from '../types';

// YouTube API key
// const API_KEY = 'AIzaSyCk16nXD7Lf9FoQIQXPZVJxpKVZ6HLrfd0'; // Ancienne clé
const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Get date from one month ago
const getOneMonthAgo = () => {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  return date.toISOString();
};

export const youtubeAPI = {
  // Search for YouTube channels
  searchChannels: async (query: string): Promise<Channel[]> => {
    try {
      const response = await fetch(
        `${BASE_URL}/search?part=snippet&q=${encodeURIComponent(
          query
        )}&type=channel&maxResults=10&key=${API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch channels: ${response.status}`);
      }

      const data = await response.json();

      if (!data.items || data.items.length === 0) { // Vérifier aussi si items est vide
        // return getMockChannels(query); // Commenter cette ligne
        // throw new Error('No items found in API response'); // L'API peut ne rien trouver, ce n'est pas une erreur en soi
        return []; // Retourner un tableau vide si aucune chaîne n'est trouvée
      }

      return data.items.map((item: any) => ({
        id: item.id.channelId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.default.url,
      }));
    } catch (error) {
      console.error('Error in searchChannels:', error);
      // return getMockChannels(query); // Commenter cette ligne
      throw error; // Propager l'erreur
    }
  },

  // Get latest videos from each channel (Optimized for quota)
  getLatestVideos: async (channelIds: string[]): Promise<Video[]> => {
    try {
      const allVideos: Video[] = [];
      // const oneMonthAgo = getOneMonthAgo(); // Plus nécessaire pour la requête API directe

      for (const channelId of channelIds) {
        try {
          // 1. Get the uploads playlist ID for the channel
          const channelDetailsResponse = await fetch(
            `${BASE_URL}/channels?part=contentDetails&id=${channelId}&key=${API_KEY}`
          );

          if (!channelDetailsResponse.ok) {
            console.warn(`Failed to fetch channel details for ${channelId}: ${channelDetailsResponse.status}`);
            // const mockVideos = getMockVideos([channelId]); // Fallback commenté
            // allVideos.push(...mockVideos);
            continue;
          }

          const channelData = await channelDetailsResponse.json();
          if (!channelData.items || channelData.items.length === 0 || !channelData.items[0].contentDetails?.relatedPlaylists?.uploads) {
            console.warn(`Could not find uploads playlist for channel ${channelId}`);
            // const mockVideos = getMockVideos([channelId]); // Fallback commenté
            // allVideos.push(...mockVideos);
            continue;
          }
          const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;

          // 2. Get the latest video from the uploads playlist
          const playlistItemsResponse = await fetch(
            `${BASE_URL}/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=1&key=${API_KEY}`
          );

          if (!playlistItemsResponse.ok) {
            console.warn(`Failed to fetch videos for playlist ${uploadsPlaylistId} (channel ${channelId}): ${playlistItemsResponse.status}`);
            // const mockVideos = getMockVideos([channelId]); // Fallback commenté
            // allVideos.push(...mockVideos);
            continue;
          }

          const playlistData = await playlistItemsResponse.json();

          if (playlistData.items && playlistData.items.length > 0) {
            const videoItem = playlistData.items[0].snippet;
            // Filtrer ici si la vidéo est plus vieille qu'un mois, si nécessaire
            // const videoDate = new Date(videoItem.publishedAt);
            // if (videoDate < new Date(oneMonthAgo)) {
            //   continue;
            // }
            
            allVideos.push({
              id: videoItem.resourceId.videoId,
              title: videoItem.title,
              description: videoItem.description,
              thumbnail: videoItem.thumbnails.high?.url || videoItem.thumbnails.default?.url, // S'assurer d'avoir une miniature
              channelId: videoItem.channelId,
              channelTitle: videoItem.channelTitle,
              publishedAt: videoItem.publishedAt,
              channelThumbnail: '', // Sera rempli par le contexte
            });
          }
        } catch (channelError) {
          console.warn(`Error processing channel ${channelId}:`, channelError);
          // const mockVideos = getMockVideos([channelId]); // Fallback commenté
          // allVideos.push(...mockVideos);
        }
      }

      return allVideos.sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    } catch (error) {
      console.error('Error in getLatestVideos:', error);
      // return getMockVideos(channelIds); // Fallback commenté
      throw error; // Propager l'erreur pour une meilleure gestion dans le contexte
    }
  },
};

// Mock data functions for development (peuvent être supprimées si plus utilisées)
/* // Commenter ou supprimer si getMockChannels n'est plus utilisé
function getMockChannels(query: string): Channel[] {
  // ... (contenu original)
}
*/

/* // Commenter ou supprimer si getMockVideos n'est plus utilisé
function getMockVideos(channelIds: string[]): Video[] {
  // ... (contenu original)
}
*/