import React from 'react';
import SearchBar from '../components/SearchBar';
import FavoritesList from '../components/FavoritesList';
import VideoFeed from '../components/VideoFeed';

const HomePage: React.FC = () => {
  return (
    <div className="h-full w-full px-3 py-4 lg:px-6 lg:py-6">
      {/* Section de recherche - Plus compacte */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 lg:p-6 mb-4 lg:mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Vos chaînes YouTube favorites
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-4 lg:mb-6 text-sm lg:text-base">
          Recherchez et ajoutez vos chaînes YouTube préférées pour voir leurs dernières vidéos
        </p>
        <SearchBar />
      </div>
      
      {/* Contenu principal - Layout optimisé */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 lg:gap-6 h-full">
        {/* Sidebar des favoris - Plus étroite sur grand écran */}
        <div className="xl:col-span-1">
          <FavoritesList />
        </div>
        
        {/* Feed de vidéos - Plus d'espace */}
        <div className="xl:col-span-4">
          <VideoFeed />
        </div>
      </div>
    </div>
  );
};

export default HomePage;