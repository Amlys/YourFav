import React, { useState } from 'react';
import { Play, Calendar, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Video } from '../types';

interface VideoCardProps {
  video: Video;
}

const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'recently';
    }
  };

  return (
    <>
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-video bg-gray-200 dark:bg-gray-700">
          <img 
            src={video.thumbnail} 
            alt={video.title} 
            className="w-full h-full object-cover"
          />
          <div 
            className={`absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <button
              onClick={() => setModalOpen(true)}
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
            <img 
              src={video.channelThumbnail} 
              alt={video.channelTitle} 
              className="w-6 h-6 rounded-full mr-2"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {video.channelTitle}
            </span>
          </div>
          
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <Calendar size={14} className="mr-1" />
            <span>Published {formatDate(video.publishedAt)}</span>
          </div>
        </div>
        
        <div className="px-4 pb-4">
          <a 
            href={`https://www.youtube.com/watch?v=${video.id}`} 
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
                src={`https://www.youtube.com/embed/${video.id}`}
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
                  <img 
                    src={video.channelThumbnail} 
                    alt={video.channelTitle} 
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  <span className="text-gray-700 dark:text-gray-300">
                    {video.channelTitle}
                  </span>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
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
};

export default VideoCard;