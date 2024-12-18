import { useState, useEffect } from 'react';
import type { Wedding, WeddingInput, View } from './types';
import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';
import WeddingDetails from './components/WeddingDetails';
import NewWeddingForm from './components/NewWeddingForm';
import Navbar from './components/layout/Navbar';
import SettingsView from './components/SettingsView';
import SecretCode from './components/SecretCode';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function App() {
  const [view, setView] = useState<View>('dashboard');
  const [selectedWedding, setSelectedWedding] = useState<Wedding | null>(null);
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [isNewWeddingModalOpen, setIsNewWeddingModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchWeddings = async () => {
    try {
      setIsLoading(true);
      setError(null);
  
      const apiUrl = `${API_BASE_URL}/api/weddings`;
      console.log('=== Fetching Weddings ===');
      console.log('API URL:', apiUrl);
      console.log('Token:', localStorage.getItem('token') ? 'Present' : 'Missing');

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include'
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', [...response.headers.entries()]);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch weddings: ${response.status} ${errorText}`);
      }

      const data: Wedding[] = await response.json();
      setWeddings(data);
    } catch (err) {
      console.error('Error fetching weddings:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('App component mounted');
    console.log('Current API URL:', API_BASE_URL);
    console.log('Current view:', view);
    console.log('Environment variables:', import.meta.env);
    
    fetchWeddings();
  }, []);

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

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Veuillez vous connecter pour supprimer un mariage');
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/weddings/${weddingId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Veuillez vous connecter pour créer un mariage');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/weddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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

  const handleWeddingUpdate = async (updatedWedding: Wedding) => {
    if (!updatedWedding._id) return;
    
    try {
      const response = await fetch(`/api/weddings/${updatedWedding._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedWedding),
      });

      if (!response.ok) {
        throw new Error('Failed to update wedding');
      }

      setWeddings(prevWeddings => 
        prevWeddings.map(wedding => 
          wedding._id === updatedWedding._id ? updatedWedding : wedding
        )
      );
    } catch (error) {
      console.error('Error updating wedding:', error);
    }
  };

  if (!isAuthenticated) {
    return <SecretCode onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <ThemeProvider>
      <LanguageProvider>
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
                onUpdate={handleWeddingUpdate}
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
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;