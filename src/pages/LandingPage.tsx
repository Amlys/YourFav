// filepath: c:\Users\LAM\Downloads\project\src\pages\LandingPage.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useYoutube } from '../context/YoutubeContext';
import { Youtube, CheckCircle, ListVideo, Bell } from 'lucide-react'; // LogIn supprimé car SVG utilisé

const LandingPage: React.FC = () => {
  const { currentUser, signInWithGoogle, isAuthLoading } = useYoutube(); // Utiliser isAuthLoading
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser && !isAuthLoading) { // Attendre la fin du chargement de l'auth
      navigate('/home');
    }
  }, [currentUser, isAuthLoading, navigate]); // Ajouter isAuthLoading aux dépendances

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
      // La redirection sera gérée par le useEffect ci-dessus
    } catch (error) {
      console.error("Erreur lors de la connexion Google:", error);
      // Afficher une notification d'erreur si nécessaire
    }
  };

  // Pendant que l'état d'authentification initial se charge
  if (isAuthLoading) { // Utiliser isAuthLoading
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-500 via-red-600 to-red-700 p-4 text-white">
        <div className="animate-pulse">
          <Youtube size={48} className="mb-4" />
          <p className="text-2xl">Chargement de votre expérience Yourfav...</p>
        </div>
      </div>
    );
  }
  
  // Si l'utilisateur est déjà connecté (après le chargement de l'auth), la redirection via useEffect se chargera
  // Cette condition peut être simplifiée ou supprimée si useEffect gère bien la redirection
  if (currentUser && !isAuthLoading) {
    return null; 
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 via-gray-50 to-white dark:from-gray-800 dark:via-gray-900 dark:to-black p-6 pt-12 pb-20">
      <main className="text-center max-w-3xl mx-auto">
        <div className="flex justify-center items-center mb-8">
          <Youtube size={64} className="text-red-600" />
          <h1 className="ml-4 text-5xl md:text-6xl font-bold text-gray-800 dark:text-white">
            Yourfav
          </h1>
        </div>

        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10 px-4">
          Ne manquez plus jamais une vidéo de vos chaînes YouTube préférées ! Centralisez vos abonnements et recevez un flux personnalisé des dernières publications, le tout en un seul endroit.
        </p>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-12 text-left px-4">
          <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center text-red-500 dark:text-red-400 mb-3">
              <ListVideo size={28} className="mr-3 flex-shrink-0" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Flux Unifié</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Consultez les dernières vidéos de toutes vos chaînes favorites en un seul endroit, sans distraction.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center text-red-500 dark:text-red-400 mb-3">
              <CheckCircle size={28} className="mr-3 flex-shrink-0" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Gestion Facile</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Ajoutez ou supprimez des chaînes de vos favoris en quelques clics. C'est simple et intuitif.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center text-red-500 dark:text-red-400 mb-3">
              <Bell size={28} className="mr-3 flex-shrink-0" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Restez à Jour</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Plus besoin de naviguer entre plusieurs pages ou applications. Tout ce qui compte est ici.
            </p>
          </div>
        </div>

        <button
          onClick={handleSignIn}
          disabled={isAuthLoading} // Utiliser isAuthLoading pour le bouton
          className="w-full max-w-xs mx-auto flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 disabled:opacity-70"
        >
          <svg className="w-5 h-5 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48px" height="48px"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l0.013-0.013l7.627,6.017C43.022,36.375,44,34,44,30C44,22.659,43.862,21.35,43.611,20.083z"/></svg>
          {isAuthLoading ? 'Chargement...' : 'Se connecter avec Google'} {/* Mettre à jour le texte du bouton */} 
        </button>
        <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          Créez un compte ou connectez-vous pour commencer à personnaliser votre expérience.
        </p>
      </main>
      <footer className="absolute bottom-0 left-0 right-0 p-4 text-center text-xs text-gray-500 dark:text-gray-400">
        © {new Date().getFullYear()} Yourfav. Tous droits réservés.
      </footer>
    </div>
  );
};

export default LandingPage;
