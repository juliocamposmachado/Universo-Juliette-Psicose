
import React from 'react';
import { Button } from './Button';

interface SplashScreenProps {
  onEnter: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onEnter }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-900 text-white animate-fade-in p-4">
      <div className="text-center space-y-4">
        <h1 className="text-5xl md:text-7xl font-bold text-indigo-400 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
          Universo Juliette Psicose
        </h1>
        <p className="text-xl md:text-2xl text-gray-300">
          por Julio Campos Machado
        </p>
      </div>
      
      <div className="absolute bottom-24 text-center text-gray-400 text-sm">
        <p>Escritor & Programador Full Stack</p>
        <p>Like Look Solutions - São Paulo, Brasil</p>
      </div>

      <div className="absolute bottom-8">
        <Button 
          onClick={onEnter} 
          className="px-10 py-4 text-lg transform hover:scale-105 transition-transform duration-200 animate-pulse hover:animate-none"
        >
          Entrar
        </Button>
      </div>
    </div>
  );
};