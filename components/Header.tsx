import React, { useState, useEffect } from 'react';
import { CUTM_LOGO_URL } from '../constants';

const Header: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return true;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  return (
    <header className="glass-header px-6 py-3 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <div className="bg-white p-1 rounded-lg shadow-sm">
          <img
            src={CUTM_LOGO_URL}
            alt="CUTM Logo"
            className="h-10 auto object-contain"
          />
        </div>
        <div>
          <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-maroon-900 to-red-800 dark:from-white dark:to-gray-400">
            Centurion AI
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 font-semibold">
            University Assistant
          </p>
        </div>
      </div>
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:scale-110 transition-all duration-200"
        aria-label="Toggle theme"
      >
        {isDarkMode ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>
    </header>
  );
};

export default Header;