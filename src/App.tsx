import { useState } from 'react';
import Navbar from './components/layout/Navbar';
import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';
import WeddingDetails from './components/WeddingDetails';
import NotificationsView from './components/NotificationsView';
import NewWeddingForm from './components/NewWeddingForm';
import SettingsView from './components/SettingsView';
import AccessCodeForm from './components/AccessCodeForm';
import { ThemeProvider } from './context/ThemeContext';
import { View, Wedding } from './types';
import './styles/animations.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [view, setView] = useState<View>('dashboard');
  const [selectedWedding, setSelectedWedding] = useState<Wedding | null>(null);
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [isNewWeddingModalOpen, setIsNewWeddingModalOpen] = useState(false);

  if (!isAuthenticated) {
    return (
      <ThemeProvider>
        <AccessCodeForm onSuccess={() => setIsAuthenticated(true)} />
      </ThemeProvider>
    );
  }

  const handleAddWedding = (weddingData: Omit<Wedding, 'id'>) => {
    const newWedding: Wedding = {
      ...weddingData,
      id: (weddings.length + 1).toString(),
    };
    setWeddings([...weddings, newWedding]);
    setIsNewWeddingModalOpen(false);
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