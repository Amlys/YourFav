import { Channel, Video } from '../types';
import { cache, CACHE_TTL, cacheKeys } from '../utils/cache';
import { 
  YouTubeSearchResponseSchema,
  YouTubeChannelsResponseSchema,
  YouTubeChannelContentDetailsSchema,
  YouTubePlaylistItemsResponseSchema,
  YouTubeVideoContentDetailsResponse,
  ChannelSchema,
  VideoSchema,
  validateChannel
} from '../types/schemas';
import { ValidationService } from './validation';

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
    
    // Check cache first
    const cacheKey = cacheKeys.searchResults(query);
    const cachedResults = cache.get<Channel[]>(cacheKey);
    if (cachedResults) {
      console.info(`[youtubeAPI] Using cached results for query: "${query}"`);
      return cachedResults;
    }
    
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
      // Récupérer les vrais thumbnails via l'API channels
      const channelIds = data.items.map((item: any) => item.id.channelId).filter(Boolean);
      if (channelIds.length === 0) return [];
      const channelsDetailsResponse = await fetch(
        `${BASE_URL}/channels?part=snippet&id=${channelIds.join(',')}&key=${API_KEY}`
      );
      const channelsDetailsData = await channelsDetailsResponse.json();
      const detailsMap = new Map();
      if (channelsDetailsData.items) {
        for (const ch of channelsDetailsData.items) {
          detailsMap.set(ch.id, ch.snippet.thumbnails.high?.url || ch.snippet.thumbnails.medium?.url || ch.snippet.thumbnails.default?.url || '');
        }
      }
      // Valider la réponse avec Zod
      const validationResult = ValidationService.validate(
        YouTubeSearchResponseSchema, 
        data, 
        `YouTube Search API for query: ${query}`
      );

      if (!validationResult.success) {
        console.error('[youtubeAPI] Failed to validate search response:', validationResult.error);
        throw new Error(validationResult.error.message);
      }

      const validatedData = validationResult.data;
      
      // Transformer les données en format Channel
      const rawResults = validatedData.items.map((item) => ({
        id: item.id.channelId,
        title: item.snippet.title,
        description: item.snippet.description || '',
        thumbnail: detailsMap.get(item.id.channelId) || '',
      }));

      // Valider chaque Channel individuellement
      const channelsValidation = ValidationService.validateArrayPartial(
        ChannelSchema,
        rawResults,
        'Search Results Channels'
      );

      if (channelsValidation.successRate < 0.5) {
        console.warn(`[youtubeAPI] Low success rate in channel validation: ${Math.round(channelsValidation.successRate * 100)}%`);
      }

      const results = channelsValidation.validItems;
      
      // Cache the results
      cache.set(cacheKey, results, CACHE_TTL.SEARCH_RESULTS);
      console.info(`[youtubeAPI] Cached ${results.length} validated search results for query: "${query}"`);
      
      return results;
    } catch (error) {
      console.error('Error in searchChannels:', error);
      throw error; // Propager l'erreur
    }
  },

  // Helper method to get latest video for a single channel
  getChannelLatestVideo: async (channelId: string): Promise<Video | null> => {
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
        return null;
      }

      const channelData = await channelDetailsResponse.json();
      if (!channelData.items || channelData.items.length === 0 || !channelData.items[0].contentDetails?.relatedPlaylists?.uploads) {
        console.warn(`[youtubeAPI] Could not find uploads playlist for channel ${channelId}. Data:`, channelData);
        return null;
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
        return null;
      }

      const playlistData = await playlistItemsResponse.json();

      if (playlistData.items && playlistData.items.length > 0) {
        const videoItem = playlistData.items[0].snippet;
        
        // Filtrer les Shorts
        const isShort =
          videoItem.title.toLowerCase().includes('shorts') ||
          videoItem.description.toLowerCase().includes('shorts') ||
          (videoItem.thumbnails &&
            (videoItem.thumbnails.high?.url?.includes('/shorts/') ||
             videoItem.thumbnails.medium?.url?.includes('/shorts/') ||
             videoItem.thumbnails.default?.url?.includes('/shorts/')));
        
        if (isShort) {
          console.log(`[youtubeAPI] Video "${videoItem.title}" ignorée car c'est un Short.`);
          return null;
        }

        // Récupérer la durée de la vidéo
        const videoId = videoItem.resourceId.videoId;
        const videoDetailsResponse = await fetch(
          `${BASE_URL}/videos?part=contentDetails&id=${videoId}&key=${API_KEY}`
        );
        
        if (!videoDetailsResponse.ok) {
          const errorText = await videoDetailsResponse.text();
          console.warn(`[youtubeAPI] Failed to fetch video details for ${videoId}. Status: ${videoDetailsResponse.status} ${videoDetailsResponse.statusText}. Response: ${errorText}`);
          return null;
        }
        
        const videoDetailsData = await videoDetailsResponse.json();
        if (!videoDetailsData.items || videoDetailsData.items.length === 0) {
          console.warn(`[youtubeAPI] No details found for video ${videoId}`);
          return null;
        }
        
        const durationISO = videoDetailsData.items[0].contentDetails.duration;
        const durationSeconds = youtubeAPI.parseISODurationToSeconds(durationISO);
        
        if (durationSeconds <= 180) {
          console.log(`[youtubeAPI] Video "${videoItem.title}" ignorée car durée <= 3min (${durationSeconds}s)`);
          return null;
        }

        return {
          id: videoItem.resourceId.videoId,
          title: videoItem.title,
          description: videoItem.description,
          thumbnail: videoItem.thumbnails.high?.url || videoItem.thumbnails.default?.url,
          channelId: videoItem.channelId,
          channelTitle: videoItem.channelTitle,
          publishedAt: videoItem.publishedAt,
          channelThumbnail: '', // Sera rempli par le contexte
        };
      }
      return null;
    } catch (channelError: any) {
      console.warn(`[youtubeAPI] Error processing channel ${channelId}:`, channelError.message || channelError);
      return null;
    }
  },

  // Utility function to parse ISO 8601 duration to seconds
  parseISODurationToSeconds: (duration: string): number => {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    const seconds = parseInt(match[3] || '0', 10);
    return hours * 3600 + minutes * 60 + seconds;
  },

  // Get latest videos from each channel (Optimized with parallel processing)
  getLatestVideos: async (channelIds: string[]): Promise<Video[]> => {
    console.info(`[youtubeAPI] Fetching latest videos for channel IDs: ${channelIds.join(', ')}`);
    if (channelIds.length === 0) {
      console.log('[youtubeAPI] No channel IDs provided to getLatestVideos.');
      return [];
    }
    
    // Check cache first
    const cacheKey = cacheKeys.latestVideos(channelIds);
    const cachedVideos = cache.get<Video[]>(cacheKey);
    if (cachedVideos) {
      console.info(`[youtubeAPI] Using cached videos for channels: ${channelIds.join(', ')}`);
      return cachedVideos;
    }
    
    try {
      // Optimisation: Traitement parallèle des chaînes
      console.info(`[youtubeAPI] Starting parallel processing of ${channelIds.length} channels`);
      const startTime = performance.now();
      
      const videoPromises = channelIds.map(channelId => 
        youtubeAPI.getChannelLatestVideo(channelId)
      );
      
      const videoResults = await Promise.allSettled(videoPromises);
      const allVideos: Video[] = [];
      
      videoResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          allVideos.push(result.value);
        } else if (result.status === 'rejected') {
          console.warn(`[youtubeAPI] Failed to fetch video for channel ${channelIds[index]}:`, result.reason);
        }
      });

      const endTime = performance.now();
      const processingTime = Math.round(endTime - startTime);
      console.info(`[youtubeAPI] Parallel processing completed in ${processingTime}ms. Successfully fetched ${allVideos.length}/${channelIds.length} videos.`);

      // Sort videos by publication date
      const sortedVideos = allVideos.sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
      
      // Cache the results
      cache.set(cacheKey, sortedVideos, CACHE_TTL.VIDEOS);
      console.info(`[youtubeAPI] Cached ${sortedVideos.length} videos for channels: ${channelIds.join(', ')}`);
      
      return sortedVideos;
    } catch (error: any) {
      console.error('[youtubeAPI] Error in getLatestVideos:', error.message || error);
      throw error;
    }
  },

    },

  // Récupère les infos détaillées d'une chaîne (dont la vraie miniature)
  getChannelDetails: async (channelId: string): Promise<Channel | null> => {
    // Check cache first
    const cacheKey = cacheKeys.channelDetails(channelId);
    const cachedChannel = cache.get<Channel>(cacheKey);
    if (cachedChannel) {
      console.info(`[youtubeAPI] Using cached channel details for: ${channelId}`);
      return cachedChannel;
    }
    
    try {
      const response = await fetch(
        `${BASE_URL}/channels?part=snippet&id=${channelId}&key=${API_KEY}`
      );
      const data = await response.json();
      if (!data.items || data.items.length === 0) return null;
      const snippet = data.items[0].snippet;
      const channelDetails = {
        id: channelId,
        title: snippet.title,
        description: snippet.description,
        thumbnail: snippet.thumbnails.high?.url || snippet.thumbnails.medium?.url || snippet.thumbnails.default?.url || '',
      };
      
      // Cache the channel details
      cache.set(cacheKey, channelDetails, CACHE_TTL.CHANNEL_DETAILS);
      console.info(`[youtubeAPI] Cached channel details for: ${channelId}`);
      
      return channelDetails;
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