import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import lightLogo from '../assets/lightmodelogo.png';
import darkLogo from '../assets/darkmodelogo.png';

export default function Logo({ className = '', style = {} }) {
  const { theme } = useTheme();
  
  return (
    <img 
      src={theme === 'dark' ? darkLogo : lightLogo} 
      alt="FinLock Logo" 
      className={className}
      style={{ 
        height: '32px', 
        width: 'auto', 
        display: 'inline-block', 
        objectFit: 'contain', 
        verticalAlign: 'middle',
        ...style 
      }}
    />
  );
}
