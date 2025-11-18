
import React from 'react';

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="flex items-center h-20 px-6 bg-gray-800 border-b border-gray-700 flex-shrink-0">
      <h1 className="text-2xl font-semibold text-white">{title}</h1>
    </header>
  );
};
