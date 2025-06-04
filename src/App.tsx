import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LandingPage from './pages/LandingPage';
import Header from './components/Header';
import { AppProvider } from './contexts/AppProvider';
import { useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Composant pour protéger les routes qui nécessitent une authentification
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAuthLoading } = useAuth();
  const location = useLocation();

  // Pendant le chargement initial de l'authentification, on peut montrer un loader
  if (isAuthLoading) { // Changer isLoading par isAuthLoading
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si l'utilisateur n'est pas connecté, rediriger vers la landing page
  if (!currentUser && !isAuthLoading) { // S'assurer que le chargement de l'auth est terminé
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Si l'utilisateur est connecté, afficher le contenu protégé
  return <>{children}</>;
};

// Layout pour les pages authentifiées avec Header
const AuthenticatedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AppProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            <Routes>
              {/* La landing page est accessible à tous et est la route par défaut */}
              <Route path="/" element={<LandingPage />} />
              
              {/* Routes protégées qui nécessitent une authentification */}
              <Route path="/home" element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <HomePage />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              } />
              
              {/* Rediriger toutes les autres routes vers la landing page */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </AppProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;