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
      
      // Vérifier si l'utilisateur est authentifié
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No authentication token found');
        setError('Veuillez vous connecter pour voir les mariages');
        setIsLoading(false);
        return;
      }

      const apiUrl = `${API_BASE_URL}/api/weddings`;
      console.log('Fetching weddings from:', apiUrl);
      console.log('Using token:', token.substring(0, 10) + '...');

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.message || `Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Received data:', data);

      if (!data.data || !Array.isArray(data.data)) {
        console.error('Invalid data format:', data);
        throw new Error('Format de données invalide reçu du serveur');
      }

      setWeddings(data.data);
      
      // If we have a selected wedding, verify it still exists in the new data
      if (selectedWedding) {
        const stillExists = data.data.some(w => w._id === selectedWedding._id);
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

  const handleUpdateWedding = async (mongoId: string, updatedData: Partial<Wedding>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Updating wedding with ID:', mongoId);
      console.log('Update data:', updatedData);
      
      // Prepare the data for the API
      const dataToUpdate = {
        ...updatedData,
        date: updatedData.date 
          ? (updatedData.date instanceof Date 
            ? updatedData.date.toISOString()
            : new Date(updatedData.date).toISOString())
          : undefined
      };
      
      console.log('Data being sent to server:', dataToUpdate);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Veuillez vous connecter pour mettre à jour un mariage');
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/weddings/${mongoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToUpdate)
      });

      console.log('App - Update response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Update error response:', errorData);
        
        // Enhanced error message based on the type of error
        let errorMessage = errorData.message || `Erreur: ${response.status} ${response.statusText}`;
        if (response.status === 404) {
          errorMessage = `Mariage non trouvé (ID: ${errorData.requestedId}). Veuillez rafraîchir la page.`;
        } else if (errorData.details) {
          errorMessage += ` - ${errorData.details}`;
        }
        
        throw new Error(errorMessage);
      }

      const updatedWedding = await response.json();
      console.log('Updated wedding from server:', updatedWedding);
      
      // Update the weddings list with the new data
      setWeddings(prevWeddings =>
        prevWeddings.map(w =>
          (w._id === mongoId || w.id === mongoId) 
            ? { ...updatedWedding, date: new Date(updatedWedding.date) }
            : w
        )
      );

      // Update selected wedding if it's the one that was just modified
      if (selectedWedding && (selectedWedding._id === mongoId || selectedWedding.id === mongoId)) {
        setSelectedWedding({ ...updatedWedding, date: new Date(updatedWedding.date) });
      }

      console.log('Wedding updated successfully');
      
      // Refresh the weddings list to ensure we have the latest data
      fetchWeddings();
      
    } catch (err) {
      console.error('Error updating wedding:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de la mise à jour du mariage');
    } finally {
      setIsLoading(false);
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
                onUpdate={handleUpdateWedding}
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