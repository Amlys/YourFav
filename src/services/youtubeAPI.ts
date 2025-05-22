import { Channel, Video } from '../types';

// YouTube API key
const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Get date from one month ago
// const getOneMonthAgo = () => { // Commentée car non utilisée et cause un avertissement
//   const date = new Date();
//   date.setMonth(date.getMonth() - 1);
//   return date.toISOString();
// };

export const youtubeAPI = {
  // Search for YouTube channels
  searchChannels: async (query: string): Promise<Channel[]> => {
    console.info(`[youtubeAPI] Searching channels for query: "${query}"`);
    try {
      const response = await fetch(
        `${BASE_URL}/search?part=snippet&q=${encodeURIComponent(
          query
        )}&type=channel&maxResults=10&key=${API_KEY}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[youtubeAPI] Failed to fetch channels. Status: ${response.status} ${response.statusText}. Response: ${errorText}`);
        throw new Error(`Failed to fetch channels: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.items) {
        console.warn('[youtubeAPI] No items found in API response for searchChannels.');
        return []; 
      }
      
      console.log(`[youtubeAPI] Found ${data.items.length} channels for query "${query}".`);
      return data.items.map((item: any) => ({
        id: item.id.channelId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url || '',
      }));
    } catch (error) {
      console.error('Error in searchChannels:', error);
      // return getMockChannels(query); // Commenter cette ligne
      throw error; // Propager l'erreur
    }
  },

  // Get latest videos from each channel (Optimized for quota)
  getLatestVideos: async (channelIds: string[]): Promise<Video[]> => {
    console.info(`[youtubeAPI] Fetching latest videos for channel IDs: ${channelIds.join(', ')}`);
    if (channelIds.length === 0) {
      console.log('[youtubeAPI] No channel IDs provided to getLatestVideos.');
      return [];
    }
    try {
      const allVideos: Video[] = [];

      for (const channelId of channelIds) {
        console.log(`[youtubeAPI] Processing channel ID: ${channelId}`);
        try {
          // 1. Get the uploads playlist ID for the channel
          console.log(`[youtubeAPI] Fetching channel details for ID: ${channelId}`);
          const channelDetailsResponse = await fetch(
            `${BASE_URL}/channels?part=contentDetails&id=${channelId}&key=${API_KEY}`
          );

          if (!channelDetailsResponse.ok) {
            const errorText = await channelDetailsResponse.text();
            console.warn(`[youtubeAPI] Failed to fetch channel details for ${channelId}. Status: ${channelDetailsResponse.status} ${channelDetailsResponse.statusText}. Response: ${errorText}`);
            continue;
          }

          const channelData = await channelDetailsResponse.json();
          if (!channelData.items || channelData.items.length === 0 || !channelData.items[0].contentDetails?.relatedPlaylists?.uploads) {
            console.warn(`[youtubeAPI] Could not find uploads playlist for channel ${channelId}. Data:`, channelData);
            continue;
          }
          const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;
          console.log(`[youtubeAPI] Found uploads playlist ID ${uploadsPlaylistId} for channel ${channelId}`);

          // 2. Get the latest video from the uploads playlist
          console.log(`[youtubeAPI] Fetching latest video from playlist ID: ${uploadsPlaylistId}`);
          const playlistItemsResponse = await fetch(
            `${BASE_URL}/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=1&key=${API_KEY}`
          );

          if (!playlistItemsResponse.ok) {
            const errorText = await playlistItemsResponse.text();
            console.warn(`[youtubeAPI] Failed to fetch videos for playlist ${uploadsPlaylistId} (channel ${channelId}). Status: ${playlistItemsResponse.status} ${playlistItemsResponse.statusText}. Response: ${errorText}`);
            continue;
          }

          const playlistData = await playlistItemsResponse.json();

          if (playlistData.items && playlistData.items.length > 0) {
            const videoItem = playlistData.items[0].snippet;
            console.log(`[youtubeAPI] Found video "${videoItem.title}" for channel ${channelId}`);
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
        } catch (channelError: any) {
          console.warn(`[youtubeAPI] Error processing channel ${channelId}:`, channelError.message || channelError);
        }
      }

      console.log(`[youtubeAPI] Successfully fetched ${allVideos.length} videos in total.`);
      return allVideos.sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    } catch (error: any) {
      console.error('[youtubeAPI] Error in getLatestVideos global catch:', error.message || error);
      throw error;
    }
  },

  // Récupère les infos détaillées d'une chaîne (dont la vraie miniature)
  getChannelDetails: async (channelId: string): Promise<Channel | null> => {
    try {
      const response = await fetch(
        `${BASE_URL}/channels?part=snippet&id=${channelId}&key=${API_KEY}`
      );
      const data = await response.json();
      if (!data.items || data.items.length === 0) return null;
      const snippet = data.items[0].snippet;
      return {
        id: channelId,
        title: snippet.title,
        description: snippet.description,
        thumbnail: snippet.thumbnails.high?.url || snippet.thumbnails.medium?.url || snippet.thumbnails.default?.url || '',
      };
    } catch (error) {
      console.error('[youtubeAPI] Error in getChannelDetails:', error);
      return null;
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