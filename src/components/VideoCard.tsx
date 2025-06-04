import React, { useState, useMemo, useCallback } from 'react';
import { Play, Calendar, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Video } from '../types';
import OptimizedImage from './OptimizedImage';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';

interface VideoCardProps {
  video: Video;
  tab?: 'a_voir' | 'deja_vu' | 'plus_tard';
  onMarkWatched?: () => void;
  onMarkLater?: () => void;
  onRemoveWatched?: () => void;
  onRemoveLater?: () => void;
}

const VideoCard: React.FC<VideoCardProps> = React.memo(({ 
  video, 
  tab, 
  onMarkWatched, 
  onMarkLater, 
  onRemoveWatched, 
  onRemoveLater 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Performance monitoring  
  usePerformanceMonitor('VideoCard', {
    trackRenderTime: true,
    trackMemory: false,
    logInterval: 10000,
  });

  // Mémoisation du formatage de date
  const formattedDate = useMemo(() => {
    try {
      return formatDistanceToNow(new Date(video.publishedAt), { addSuffix: true });
    } catch (error) {
      return 'recently';
    }
  }, [video.publishedAt]);

  // Mémoisation des handlers pour éviter les re-créations
  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);
  const handleOpenModal = useCallback(() => setModalOpen(true), []);
  const handleCloseModal = useCallback(() => setModalOpen(false), []);

  // Mémoisation des URL YouTube
  const youtubeVideoUrl = useMemo(() => 
    `https://www.youtube.com/watch?v=${video.id}`, [video.id]);
  const youtubeEmbedUrl = useMemo(() => 
    `https://www.youtube.com/embed/${video.id}`, [video.id]);

  return (
    <>
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="relative aspect-video bg-gray-200 dark:bg-gray-700">
          <OptimizedImage
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full"
            loading="lazy"
            quality="medium"
          />
          <div 
            className={`absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <button
              onClick={handleOpenModal}
              className="bg-red-600 hover:bg-red-700 text-white rounded-full p-3 transform transition-transform duration-300 hover:scale-110"
              aria-label="Play video"
            >
              <Play size={24} fill="white" />
            </button>
          </div>
        </div>
        
        <div className="p-4">
          <h3 
            className="text-gray-900 dark:text-white font-medium line-clamp-2 mb-2 h-12"
            title={video.title}
          >
            {video.title}
          </h3>
          
          <div className="flex items-center mb-3">
            <OptimizedImage
              src={video.channelThumbnail}
              alt={video.channelTitle}
              className="w-6 h-6 rounded-full mr-2"
              loading="lazy"
              quality="low"
              width={24}
              height={24}
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {video.channelTitle}
            </span>
          </div>
          
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
            <Calendar size={14} className="mr-1" />
            <span>Published {formattedDate}</span>
          </div>
          
          <div className="flex gap-2 mt-2">
            {tab === 'a_voir' && (
              <>
                <button onClick={onMarkWatched} className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition">Déjà vu</button>
                <button onClick={onMarkLater} className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition">Plus tard</button>
              </>
            )}
            {tab === 'deja_vu' && (
              <button onClick={onRemoveWatched} className="px-2 py-1 bg-gray-400 text-white rounded text-xs hover:bg-gray-500 transition">Retirer</button>
            )}
            {tab === 'plus_tard' && (
              <button onClick={onRemoveLater} className="px-2 py-1 bg-gray-400 text-white rounded text-xs hover:bg-gray-500 transition">Retirer</button>
            )}
          </div>
        </div>
        
        <div className="px-4 pb-4">
          <a 
            href={youtubeVideoUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            <span>Watch on YouTube</span>
            <ExternalLink size={12} className="ml-1" />
          </a>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden max-w-4xl w-full">
            <div className="relative pb-[56.25%] h-0">
              <iframe
                src={youtubeEmbedUrl}
                title={video.title}
                className="absolute top-0 left-0 w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <div className="p-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {video.title}
              </h3>
              <div className="flex justify-between items-center">
                              <div className="flex items-center">
                <OptimizedImage
                  src={video.channelThumbnail}
                  alt={video.channelTitle}
                  className="w-8 h-8 rounded-full mr-2"
                  loading="lazy"
                  quality="low"
                  width={32}
                  height={32}
                />
                  <span className="text-gray-700 dark:text-gray-300">
                    {video.channelTitle}
                  </span>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

VideoCard.displayName = 'VideoCard';

export default VideoCard;