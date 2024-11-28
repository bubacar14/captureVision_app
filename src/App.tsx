import { useState, useEffect } from 'react';
import { Wedding, WeddingInput, View } from './types';
import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';
import WeddingDetails from './components/WeddingDetails';
import NewWeddingForm from './components/NewWeddingForm';
import Navbar from './components/layout/Navbar';
import SettingsView from './components/SettingsView';
import SecretCode from './components/SecretCode';
import { ThemeProvider } from './context/ThemeContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function App() {
  const [view, setView] = useState<View>('dashboard');
  const [selectedWedding, setSelectedWedding] = useState<Wedding | null>(null);
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [isNewWeddingModalOpen, setIsNewWeddingModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    console.log('App component mounted');
    console.log('Current API URL:', API_BASE_URL);
    console.log('Current view:', view);
    console.log('Environment variables:', import.meta.env);
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
        const errorData = await response.json();
        console.error('Error fetching weddings:', {
          status: response.status,
          errorData
        });
        throw new Error(errorData.message || `Erreur: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Received weddings data:', data);

      if (!Array.isArray(data)) {
        console.error('Invalid weddings data format:', data);
        throw new Error('Format de données invalide reçu du serveur');
      }

      setWeddings(data);
      
      // If we have a selected wedding, verify it still exists in the new data
      if (selectedWedding) {
        const stillExists = data.some(w => w._id === selectedWedding._id);
        if (!stillExists) {
          console.log('Selected wedding no longer exists in data, resetting view');
          setSelectedWedding(null);
          setView('dashboard');
        }
      }
    } catch (err) {
      console.error('Error in fetchWeddings:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération des mariages');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteWedding = async (weddingId: string) => {
    try {
      setError(null);
      setIsLoading(true);
      console.log('Attempting to delete wedding:', weddingId);
      
      // Log the current state
      const currentWedding = weddings.find(w => w._id === weddingId);
      console.log('Wedding to delete:', currentWedding);
      
      if (!currentWedding) {
        console.error('Wedding not found in local state:', weddingId);
        // Refresh the list to ensure our state is current
        await fetchWeddings();
        throw new Error('Mariage introuvable dans la liste actuelle. La page a été rafraîchie.');
      }

      const response = await fetch(`${API_BASE_URL}/api/weddings/${weddingId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
      });

      const responseStatus = response.status;
      console.log('Delete response status:', responseStatus);

      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          console.error('Delete wedding error response:', errorData);
          
          if (responseStatus === 404 || errorData.message === 'Wedding not found') {
            // Wedding doesn't exist on server, clean up local state
            setWeddings(prevWeddings => prevWeddings.filter(w => w._id !== weddingId));
            if (selectedWedding?._id === weddingId) {
              setSelectedWedding(null);
              setView('dashboard');
            }
            errorMessage = 'Ce mariage a déjà été supprimé. La liste a été mise à jour.';
          } else {
            errorMessage = `Échec de la suppression: ${errorData.message || responseStatus}`;
          }
        } catch (jsonError) {
          console.error('Error parsing delete response:', jsonError);
          errorMessage = `Erreur lors de la suppression: ${responseStatus}`;
        }
        
        // Refresh the list to ensure we're in sync
        await fetchWeddings();
        throw new Error(errorMessage);
      }

      // Success - update local state
      setWeddings(prevWeddings => prevWeddings.filter(w => w._id !== weddingId));
      if (selectedWedding?._id === weddingId) {
        setSelectedWedding(null);
        setView('dashboard');
      }
      
      console.log('Wedding deleted successfully');
      await fetchWeddings();
    } catch (err) {
      console.error('Error deleting wedding:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de la suppression du mariage');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateWedding = async (weddingData: WeddingInput) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/weddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(weddingData),
      });

      if (!response.ok) {
        throw new Error('Failed to create wedding');
      }

      const newWedding = await response.json();
      setWeddings([...weddings, newWedding]);
      setIsNewWeddingModalOpen(false);
    } catch (err) {
      console.error('Error creating wedding:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de la création du mariage');
    }
  };

  if (!isAuthenticated) {
    return <SecretCode onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Navbar 
          currentView={view} 
          onViewChange={setView}
          onNewWedding={() => setIsNewWeddingModalOpen(true)}
        />
        
        <main className="container mx-auto px-4 py-8">
          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          {view === 'dashboard' && (
            isLoading ? (
              <div className="flex justify-center items-center h-64">
                <p className="text-gray-500">Chargement des mariages...</p>
              </div>
            ) : weddings.length > 0 ? (
              <Dashboard
                weddings={weddings}
                onWeddingSelect={(wedding) => {
                  setSelectedWedding(wedding);
                  setView('details');
                }}
                isLoading={isLoading}
              />
            ) : (
              <div className="flex justify-center items-center h-64">
                <p className="text-gray-500">Aucun mariage trouvé</p>
              </div>
            )
          )}

          {view === 'calendar' && (
            <CalendarView 
              weddings={weddings} 
              onWeddingSelect={(wedding) => {
                setSelectedWedding(wedding);
                setView('details');
              }} 
            />
          )}

          {view === 'details' && selectedWedding && (
            <WeddingDetails
              wedding={selectedWedding}
              onBack={() => {
                setSelectedWedding(null);
                setView('dashboard');
              }}
              onDelete={handleDeleteWedding}
            />
          )}

          {view === 'settings' && (
            <SettingsView />
          )}

          {isNewWeddingModalOpen && (
            <NewWeddingForm
              onSave={handleCreateWedding}
              onCancel={() => setIsNewWeddingModalOpen(false)}
            />
          )}
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;