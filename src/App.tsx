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
import { Wedding, WeddingData } from './types';

type View = 'dashboard' | 'calendar' | 'details' | 'notifications' | 'settings' | 'newWedding';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Authentifié par défaut
  const [view, setView] = useState<View>('dashboard');
  const [selectedWedding, setSelectedWedding] = useState<Wedding | null>(null);
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [isNewWeddingModalOpen, setIsNewWeddingModalOpen] = useState(false);

  useEffect(() => {
    console.log('App component mounted');
    console.log('Authentication status:', isAuthenticated);
    console.log('Current API URL:', import.meta.env.VITE_API_URL);
    
    // Toujours charger les mariages au démarrage
    if (isAuthenticated) {
      console.log('User is authenticated, fetching weddings...');
      fetchWeddings();
    } else {
      console.log('User is not authenticated yet');
    }
  }, [isAuthenticated]);

  const fetchWeddings = async () => {
    try {
      console.log('\n=== Fetching Weddings ===');
      console.log('Time:', new Date().toISOString());
      
      // Utilisation de l'URL complète du backend
      const response = await fetch('http://localhost:3000/api/weddings', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      // Récupérer le texte brut de la réponse d'abord
      const rawText = await response.text();
      console.log('Raw response text:', rawText);

      // Vérifier si la réponse est vide
      if (!rawText.trim()) {
        throw new Error('Server returned empty response');
      }

      // Essayer de parser le JSON
      let data;
      try {
        data = JSON.parse(rawText);
      } catch (e) {
        console.error('Failed to parse response as JSON:', {
          rawText,
          error: e instanceof Error ? e.message : String(e),
          responseStatus: response.status,
          responseHeaders: Object.fromEntries(response.headers.entries())
        });
        throw new Error('Server response was not valid JSON');
      }

      // Si la réponse n'est pas OK, analyser l'erreur
      if (!response.ok) {
        let errorDetails;
        try {
          errorDetails = JSON.parse(rawText);
        } catch (e) {
          errorDetails = { error: rawText };
        }
        
        throw new Error(JSON.stringify({
          status: response.status,
          statusText: response.statusText,
          details: errorDetails
        }));
      }

      if (!Array.isArray(data)) {
        console.error('Received data is not an array:', data);
        throw new Error('Invalid data format received');
      }

      const processedData = data.map(wedding => ({
        ...wedding,
        date: new Date(wedding.date)
      }));

      console.log('Processed weddings:', processedData);
      setWeddings(processedData);
      console.log('=== Fetch Complete ===\n');

    } catch (error) {
      console.error('\n=== Error in fetchWeddings ===');
      console.error('Time:', new Date().toISOString());
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        });
        try {
          const parsedError = JSON.parse(error.message);
          console.error('Parsed error:', parsedError);
        } catch (e) {
          console.error('Raw error message:', error.message);
        }
      } else {
        console.error('Unknown error:', error);
      }
      console.error('=== Error End ===\n');
      setWeddings([]);
    }
  };

  if (!isAuthenticated) {
    console.log('Rendering login form...');
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

  console.log('Rendering authenticated content...');
  console.log('Current view:', view);
  console.log('Number of weddings:', weddings.length);

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

  const onSave = async (weddingData: Omit<Wedding, '_id'>) => {
    try {
      console.log('Saving wedding data:', weddingData);
      
      const response = await fetch('http://localhost:3000/api/weddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(weddingData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
      }

      const savedWedding = await response.json();
      console.log('Wedding saved successfully:', savedWedding);
      
      setWeddings(prevWeddings => [...prevWeddings, savedWedding]);
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
            onClose={() => setIsNewWeddingModalOpen(false)}
            onSave={onSave}
          />
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;