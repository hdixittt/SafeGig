import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ className = '' }) {
  const { dark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`theme-toggle ${className}`}
    >
      <span className="theme-toggle-track">
        <span className="theme-toggle-thumb">
          {dark
            ? <Moon size={12} strokeWidth={2.5} />
            : <Sun size={12} strokeWidth={2.5} />}
        </span>
      </span>
      <span className="theme-toggle-label">
        {dark ? 'Dark' : 'Light'}
      </span>
    </button>
  );
}
