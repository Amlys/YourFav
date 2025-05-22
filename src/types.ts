export interface Channel {
  id: string;
  title: string;
  thumbnail: string;
  description?: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelId: string;
  channelTitle: string;
  channelThumbnail: string;
  publishedAt: string;
}