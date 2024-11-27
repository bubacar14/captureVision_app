import React from 'react';
import { Bell, Calendar, Home, Plus, Settings } from 'lucide-react';
import { View } from '../../types';

interface NavbarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  onNewWedding: () => void;
}

export default function Navbar({ currentView, onViewChange, onNewWedding }: NavbarProps) {
  const NavButton = ({ view, icon: Icon, onClick }: { view: View; icon: React.ElementType; onClick?: () => void }) => (
    <button
      onClick={onClick || (() => onViewChange(view))}
      className={`p-3 rounded-xl transition-all duration-300 relative group ${
        currentView === view
          ? 'bg-[#00B09C] text-white'
          : 'text-[#9FA2A7] hover:text-[#00B09C]'
      }`}
    >
      <Icon className={`h-6 w-6 transition-transform duration-300 ${currentView === view ? 'scale-110' : 'group-hover:scale-110'}`} />
      {currentView === view && (
        <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#00B09C] rounded-full" />
      )}
    </button>
  );

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-[#232D36] backdrop-blur-lg rounded-2xl shadow-lg border border-[#9FA2A7]/10 px-6 py-2">
      <div className="flex items-center space-x-8">
        <NavButton view="dashboard" icon={Home} />
        <NavButton view="calendar" icon={Calendar} />
        <NavButton view="newWedding" icon={Plus} onClick={onNewWedding} />
        <NavButton view="notifications" icon={Bell} />
        <NavButton view="settings" icon={Settings} />
      </div>
    </div>
  );
}