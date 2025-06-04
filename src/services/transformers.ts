import { 
  Channel, 
  Video,
  validateChannel,
  validateVideo
} from '../types/schemas';
import { 
  YouTubeSearchResponse,
  YouTubeChannelsResponse,
  YouTubePlaylistItemsResponse 
} from '../types/schemas';

// Transformer pour convertir une réponse de recherche YouTube en données brutes
export const transformSearchResultToChannel = (
  searchItem: YouTubeSearchResponse['items'][0],
  thumbnailUrl?: string
): any => {
  return {
    id: searchItem.id.channelId,
    title: searchItem.snippet.title,
    description: searchItem.snippet.description || '',
    thumbnail: thumbnailUrl || '',
  };
};

// Transformer pour convertir les détails d'une chaîne YouTube en données brutes
export const transformYouTubeChannelToChannel = (
  youtubeChannel: YouTubeChannelsResponse['items'][0]
): any => {
  const snippet = youtubeChannel.snippet;
  const thumbnailUrl = 
    snippet.thumbnails?.high?.url ||
    snippet.thumbnails?.medium?.url ||
    snippet.thumbnails?.default?.url ||
    '';

  return {
    id: youtubeChannel.id,
    title: snippet.title,
    description: snippet.description || '',
    thumbnail: thumbnailUrl,
  };
};

// Transformer pour convertir un élément de playlist YouTube en données brutes
export const transformPlaylistItemToVideo = (
  playlistItem: YouTubePlaylistItemsResponse['items'][0],
  channelThumbnail?: string
): any => {
  const snippet = playlistItem.snippet;
  const thumbnailUrl = 
    snippet.thumbnails?.high?.url ||
    snippet.thumbnails?.medium?.url ||
    snippet.thumbnails?.default?.url;

  return {
    id: snippet.resourceId.videoId,
    title: snippet.title,
    description: snippet.description || '',
    thumbnail: thumbnailUrl,
    channelId: snippet.channelId,
    channelTitle: snippet.channelTitle,
    channelThumbnail: channelThumbnail || '',
    publishedAt: snippet.publishedAt,
  };
};

// Helper pour valider et créer un Channel de façon sûre
export const createValidatedChannel = (data: any): Channel | null => {
  try {
    return validateChannel(data);
  } catch (error) {
    console.warn('[Transformer] Failed to create valid Channel:', error);
    return null;
  }
};

// Helper pour valider et créer un Video de façon sûre
export const createValidatedVideo = (data: any): Video | null => {
  try {
    return validateVideo(data);
  } catch (error) {
    console.warn('[Transformer] Failed to create valid Video:', error);
    return null;
  }
};

// Transformer de batch pour traiter plusieurs éléments
export const transformAndValidateChannels = (
  items: any[],
  context: string = 'batch'
): { validChannels: Channel[]; failedCount: number; successRate: number } => {
  const validChannels: Channel[] = [];
  let failedCount = 0;

  for (const item of items) {
    const validChannel = createValidatedChannel(item);
    if (validChannel) {
      validChannels.push(validChannel);
    } else {
      failedCount++;
    }
  }

  const successRate = items.length > 0 ? validChannels.length / items.length : 1;
  
  console.info(
    `[Transformer] ${context}: ${validChannels.length}/${items.length} channels valid (${Math.round(successRate * 100)}%)`
  );

  return { validChannels, failedCount, successRate };
};

export const transformAndValidateVideos = (
  items: any[],
  context: string = 'batch'
): { validVideos: Video[]; failedCount: number; successRate: number } => {
  const validVideos: Video[] = [];
  let failedCount = 0;

  for (const item of items) {
    const validVideo = createValidatedVideo(item);
    if (validVideo) {
      validVideos.push(validVideo);
    } else {
      failedCount++;
    }
  }

  const successRate = items.length > 0 ? validVideos.length / items.length : 1;
  
  console.info(
    `[Transformer] ${context}: ${validVideos.length}/${items.length} videos valid (${Math.round(successRate * 100)}%)`
  );

  return { validVideos, failedCount, successRate };
}; 