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

  // Charger les mariages depuis l'API
  useEffect(() => {
    const fetchWeddings = async () => {
      try {
        const apiUrl = import.meta.env.PROD 
          ? 'https://wedding-planner-app-qlvw.onrender.com/api/weddings'
          : 'http://localhost:3000/api/weddings';

        console.log('Fetching weddings from:', apiUrl);
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          },
          mode: 'cors'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Weddings fetched successfully:', data);
        setWeddings(data);
      } catch (error) {
        console.error('Error fetching weddings:', error);
      }
    };

    if (isAuthenticated) {
      fetchWeddings();
    }
  }, [isAuthenticated]);

  const handleAddWedding = async (weddingData: Omit<Wedding, 'id'>) => {
    console.log('Adding new wedding:', weddingData);
    try {
      const apiUrl = import.meta.env.PROD 
        ? 'https://wedding-planner-app-qlvw.onrender.com/api/weddings'
        : 'http://localhost:3000/api/weddings';

      console.log('Sending request to:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify(weddingData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error(errorText);
      }

      const newWedding = await response.json();
      console.log('Wedding added successfully:', newWedding);
      setWeddings(prevWeddings => [...prevWeddings, newWedding]);
      setIsNewWeddingModalOpen(false);
    } catch (error) {
      console.error('Error adding wedding:', error);
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Le serveur n\'est pas accessible. Veuillez vérifier votre connexion.');
      }
      throw error;
    }
  };

  const handleWeddingSelect = (wedding: Wedding) => {
    setSelectedWedding(wedding);
    setView('details');
  };

  const handleViewChange = (newView: View) => {
    if (newView === 'newWedding') {
      setIsNewWeddingModalOpen(true);
    } else {
      setView(newView);
      if (newView !== 'details') {
        setSelectedWedding(null);
      }
    }
  };

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return (
          <Dashboard
            weddings={weddings}
            onWeddingSelect={handleWeddingSelect}
          />
        );
      case 'calendar':
        return (
          <CalendarView
            weddings={weddings}
            onWeddingSelect={handleWeddingSelect}
          />
        );
      case 'details':
        return selectedWedding ? (
          <WeddingDetails
            wedding={selectedWedding}
            onBack={() => handleViewChange('dashboard')}
          />
        ) : null;
      case 'notifications':
        return (
          <NotificationsView
            weddings={weddings}
            onViewChange={handleViewChange}
          />
        );
      case 'settings':
        return <SettingsView />;
      default:
        return null;
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        <div className="max-w-7xl mx-auto pb-24">
          <main className="px-6 py-8">
            {renderView()}
          </main>
        </div>

        <NewWeddingForm
          isOpen={isNewWeddingModalOpen}
          onSubmit={handleAddWedding}
          onCancel={() => setIsNewWeddingModalOpen(false)}
        />

        <Navbar
          currentView={view}
          onViewChange={handleViewChange}
        />
      </div>
    </ThemeProvider>
  );
}

export default App;