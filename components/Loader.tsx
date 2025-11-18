
import React from 'react';

interface LoaderProps {
  text?: string;
}

export const Loader: React.FC<LoaderProps> = ({ text = 'Gerando...' }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8 bg-gray-800/50 rounded-lg">
      <div className="w-12 h-12 border-4 border-t-indigo-500 border-gray-600 rounded-full animate-spin"></div>
      <p className="text-lg text-gray-300 font-semibold">{text}</p>
    </div>
  );
};
