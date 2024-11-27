import { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import AccessCodeForm from './components/AccessCodeForm';
import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';
import WeddingDetails from './components/WeddingDetails';
import NotificationsView from './components/NotificationsView';
import SettingsView from './components/SettingsView';
import NewWeddingForm from './components/NewWeddingForm';
import Navbar from './components/layout/Navbar';
import { Wedding } from './types';

type View = 'dashboard' | 'calendar' | 'details' | 'notifications' | 'settings' | 'newWedding';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [view, setView] = useState<View>('dashboard');
  const [selectedWedding, setSelectedWedding] = useState<Wedding | null>(null);
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [isNewWeddingModalOpen, setIsNewWeddingModalOpen] = useState(false);

  useEffect(() => {
    console.log('App component mounted');
    console.log('Authentication status:', isAuthenticated);
    console.log('Current API URL:', import.meta.env.VITE_API_URL);
    
    if (isAuthenticated) {
      console.log('User is authenticated, fetching weddings...');
      fetchWeddings();
    }
  }, [isAuthenticated]);

  const fetchWeddings = async () => {
    try {
      console.log('Fetching weddings...');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/weddings`);
      if (!response.ok) {
        throw new Error(`Failed to fetch weddings: ${response.status}`);
      }
      const data = await response.json();
      console.log('Weddings fetched:', data);
      // Vérifier si data est un tableau ou s'il contient une propriété weddings
      const weddingsArray = Array.isArray(data) ? data : data.weddings;
      setWeddings(weddingsArray || []);
    } catch (error) {
      console.error('Error fetching weddings:', error);
      // Initialiser avec un tableau vide en cas d'erreur
      setWeddings([]);
    }
  };

  if (!isAuthenticated) {
    return (
      <ThemeProvider>
        <AccessCodeForm onSuccess={() => {
          console.log('Authentication successful');
          setIsAuthenticated(true);
        }} />
      </ThemeProvider>
    );
  }

  const renderContent = () => {
    console.log('Rendering content, current view:', view);
    console.log('Current weddings:', weddings);

    switch (view) {
      case 'dashboard':
        return (
          <Dashboard 
            weddings={weddings} 
            onWeddingSelect={(wedding) => {
              console.log('Wedding selected:', wedding);
              setSelectedWedding(wedding);
              setView('details');
            }} 
          />
        );
      case 'calendar':
        return <CalendarView 
          weddings={weddings} 
          onWeddingSelect={(wedding) => {
            console.log('Wedding selected from calendar:', wedding);
            setSelectedWedding(wedding);
            setView('details');
          }}
        />;
      case 'details':
        return selectedWedding ? (
          <WeddingDetails 
            wedding={selectedWedding} 
            onBack={() => setView('dashboard')}
          />
        ) : null;
      case 'notifications':
        return <NotificationsView weddings={weddings} onViewChange={setView} />;
      case 'settings':
        return <SettingsView />;
      default:
        return <Dashboard weddings={weddings} onWeddingSelect={setSelectedWedding} />;
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-900 text-white">
        <Navbar 
          currentView={view}
          onViewChange={setView}
          onNewWedding={() => setIsNewWeddingModalOpen(true)}
        />
        <main className="container mx-auto px-4 py-8">
          {renderContent()}
        </main>
        {isNewWeddingModalOpen && (
          <NewWeddingForm
            onClose={() => setIsNewWeddingModalOpen(false)}
            onSave={async (newWedding) => {
              try {
                console.log('Envoi des données au serveur:', newWedding);
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/weddings`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(newWedding),
                });
                
                if (!response.ok) {
                  const errorData = await response.json();
                  console.error('Erreur serveur:', errorData);
                  throw new Error(errorData.message || `Erreur ${response.status}: ${response.statusText}`);
                }

                const savedWedding = await response.json();
                console.log('Mariage sauvegardé avec succès:', savedWedding);
                setWeddings(prev => [...prev, savedWedding]);
                setIsNewWeddingModalOpen(false);
                setView('dashboard');
              } catch (error) {
                console.error('Erreur lors de la sauvegarde:', error);
                throw error;
              }
            }}
          />
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;