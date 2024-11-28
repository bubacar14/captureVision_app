import { useState, useEffect } from 'react';
import { Wedding, WeddingInput, View } from './types';
import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';
import WeddingDetails from './components/WeddingDetails';
import NotificationsView from './components/NotificationsView';
import SettingsView from './components/SettingsView';
import NewWeddingForm from './components/NewWeddingForm';
import Navbar from './components/layout/Navbar';
import AccessCodeForm from './components/AccessCodeForm';
import { ThemeProvider } from './context/ThemeContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true); 
  const [view, setView] = useState<View>('dashboard');
  const [selectedWedding, setSelectedWedding] = useState<Wedding | null>(null);
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [isNewWeddingModalOpen, setIsNewWeddingModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log('App component mounted');
    console.log('Current API URL:', API_BASE_URL);
    fetchWeddings();
  }, []);

  const fetchWeddings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching weddings from:', `${API_BASE_URL}/api/weddings`);

      const response = await fetch(`${API_BASE_URL}/api/weddings`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('Response not OK:', {
          status: response.status,
          statusText: response.statusText
        });

        let errorMessage = `Error: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.text();
          console.error('Error data:', errorData);
          errorMessage = errorData;
        } catch (e) {
          console.error('Could not parse error response:', e);
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Received data:', data);

      if (!data.weddings || !Array.isArray(data.weddings)) {
        console.error('Invalid data format:', data);
        throw new Error('Invalid data format received from server');
      }

      setWeddings(data.weddings);
    } catch (err) {
      console.error('Error fetching weddings:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de la récupération des mariages');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <ThemeProvider>
        <AccessCodeForm onSuccess={() => {
          console.log('Authentication successful');
          setIsAuthenticated(true);
          console.log('Authentication state updated, should trigger useEffect');
        }} />
      </ThemeProvider>
    );
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement des mariages...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-container">
          <h2>Erreur</h2>
          <p>{error}</p>
          <button onClick={fetchWeddings}>Réessayer</button>
        </div>
      );
    }

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

  const onSave = async (weddingData: WeddingInput) => {
    try {
      console.log('Saving wedding data:', weddingData);
      console.log('API Base URL:', API_BASE_URL);
      
      const response = await fetch(`${API_BASE_URL}/api/weddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...weddingData,
          date: new Date(weddingData.date),
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Server error response:', errorData);
        let errorMessage = 'Failed to save wedding';
        try {
          errorMessage = errorData;
        } catch (e) {
          // Si le texte n'est pas du JSON valide, utiliser le texte brut
          errorMessage = errorData || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const savedWedding = await response.json();
      console.log('Wedding saved successfully:', savedWedding);
      
      setWeddings([...weddings, savedWedding]);
      setIsNewWeddingModalOpen(false);
      setView('dashboard');
    } catch (error) {
      console.error('Error saving wedding:', error);
      alert(`Erreur lors de l'enregistrement du mariage: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
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
            onCancel={() => setIsNewWeddingModalOpen(false)}
            onSave={onSave}
          />
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;