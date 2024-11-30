import React from 'react';
import { Bell, Calendar, Home, Plus, Settings, Menu, X } from 'lucide-react';
import type { View } from '../../types';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';

interface NavbarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  onNewWedding: () => void;
}

export default function Navbar({ currentView, onViewChange, onNewWedding }: NavbarProps) {
  const { t } = useLanguage();
  
  const NavButton = ({ view, icon: Icon, onClick }: { view: View; icon: React.ElementType; onClick?: () => void }) => (
    <motion.button
      whileHover={{ scale: 1.1, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick || (() => onViewChange(view))}
      className={`relative p-3 rounded-2xl transition-all duration-300 ${
        currentView === view
          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
          : 'text-gray-100 hover:text-blue-400 hover:bg-gray-800/50'
      }`}
      aria-label={t(`nav.${view}`)}
    >
      <Icon className="h-6 w-6" />
    </motion.button>
  );

  return (
    <div className="fixed inset-x-0 bottom-0 flex items-center justify-center pointer-events-none z-50 pb-4 sm:pb-8">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gray-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-gray-800 px-4 sm:px-8 py-3 sm:py-5 pointer-events-auto mx-4 sm:mx-0"
      >
        <div className="flex items-center justify-center gap-4 sm:gap-10">
          <NavButton view="dashboard" icon={Home} />
          <NavButton view="calendar" icon={Calendar} />
          <motion.div
            whileHover={{ scale: 1.1, y: -4 }}
            whileTap={{ scale: 0.95 }}
            className="relative -mt-8 mx-1 sm:mx-2"
          >
            <button
              onClick={onNewWedding}
              className="p-4 sm:p-5 rounded-2xl bg-blue-500 text-white shadow-xl hover:shadow-2xl hover:shadow-blue-500/30 hover:bg-blue-400 transition-all duration-300"
            >
              <Plus className="h-6 w-6 sm:h-7 sm:w-7" />
            </button>
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-blue-400 rounded-full opacity-50 blur-sm" />
          </motion.div>
          <NavButton view="notifications" icon={Bell} />
          <NavButton view="settings" icon={Settings} />
        </div>
      </motion.div>
    </div>
  );
}