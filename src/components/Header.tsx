import React from 'react';
import { Link } from 'react-router-dom';
import { Youtube, Moon, Sun, LogIn, LogOut } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const { currentUser, signInWithGoogle, signOutUser } = useAuth();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors"
          >
            <Youtube size={24} />
            <span className="font-bold text-xl">Yourfav</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? (
                <Sun size={20} className="text-yellow-400" />
              ) : (
                <Moon size={20} className="text-gray-600" />
              )}
            </button>

            {currentUser ? (
              <div className="flex items-center space-x-2">
                {currentUser.photoURL && (
                  <img 
                    src={currentUser.photoURL} 
                    alt={currentUser.displayName || 'User avatar'} 
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <span className="text-sm text-gray-700 dark:text-gray-300 hidden sm:inline">
                  {currentUser.displayName || currentUser.email}
                </span>
                <button
                  onClick={signOutUser}
                  className="flex items-center space-x-1 p-2 rounded-md text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Sign out"
                >
                  <LogOut size={18} />
                  <span className="hidden md:inline">Déconnexion</span>
                </button>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="flex items-center space-x-1 p-2 rounded-md text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Sign in with Google"
              >
                <LogIn size={18} />
                <span className="hidden md:inline">Connexion</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;