
import React from 'react';

// FIX: Changed JSX.Element to React.ReactElement to resolve namespace issue.
const FeatureCard: React.FC<{ title: string; description: string; icon: React.ReactElement }> = ({ title, description, icon }) => (
  <div className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-indigo-500/20 hover:scale-105 transition-all duration-300">
    <div className="flex items-center mb-4">
      <div className="p-3 bg-indigo-600/20 rounded-full mr-4">
        {React.cloneElement(icon, { className: "h-8 w-8 text-indigo-400" })}
      </div>
      <h3 className="text-xl font-bold text-white">{title}</h3>
    </div>
    <p className="text-gray-400">{description}</p>
  </div>
);

export const Dashboard: React.FC = () => {
  return (
    <div className="animate-fade-in">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8 mb-8 border border-gray-700">
        <h2 className="text-3xl font-bold text-white mb-2">Bem-vindo ao Universo Juliette Psicose</h2>
        <p className="text-gray-400 text-lg">Seu estúdio digital para criar, expandir e gerenciar a saga. Use os módulos na lateral para começar a sua jornada criativa.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FeatureCard 
          title="Narrativa"
          description="Crie livros, roteiros e HQs. Dê vida às histórias da Juliette com o poder da IA."
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v11.494m0 0a7.5 7.5 0 007.5-7.5H4.5a7.5 7.5 0 007.5 7.5z" /></svg>}
        />
        <FeatureCard 
          title="Artes Visuais"
          description="Gere artes conceituais, capas de livros e pôsteres com o estilo único da saga."
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
        />
        <FeatureCard 
          title="Personagens"
          description="Desenvolva fichas de personagens completas, explorando suas múltiplas versões e psicologias."
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
        />
      </div>
    </div>
  );
};