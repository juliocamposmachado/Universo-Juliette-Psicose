import React, { useState, useCallback, useEffect } from 'react';
import { generateArt } from '../services/geminiService';
import { Button } from '../components/Button';
import { Loader } from '../components/Loader';
import { LocalStorageWarning } from '../components/LocalStorageWarning';
import { ApiKeyInput } from '../components/ApiKeyInput';
import type { GeneratedArt } from '../types';

export const VisualArtsModule: React.FC = () => {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('juliette_api_key_visuals') || '');
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [arts, setArts] = useState<GeneratedArt[]>(() => {
    try {
        const saved = localStorage.getItem('juliette_visual_arts');
        return saved ? JSON.parse(saved) : [];
    } catch (error) {
        console.error("Falha ao carregar artes do LocalStorage:", error);
        return [];
    }
  });

  useEffect(() => {
      try {
          localStorage.setItem('juliette_visual_arts', JSON.stringify(arts));
      } catch (error) {
          console.error("Falha ao salvar artes no LocalStorage:", error);
      }
  }, [arts]);

  const handleGenerate = useCallback(async () => {
    if (!prompt || !apiKey) return;
    setIsLoading(true);
    try {
      // FIX: Added apiKey as the first argument to generateArt.
      const result = await generateArt(apiKey, prompt);
      if (result && !result.startsWith("Falha") && !result.startsWith("Erro:")) {
        setArts(prev => [{ prompt, imageUrl: result }, ...prev]);
        setPrompt('');
      } else {
        console.error(result);
        // TODO: Show an error message to the user
      }
    } catch (error) {
      console.error("Failed to generate art", error);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, apiKey]);

  return (
    <div className="space-y-6">
      <LocalStorageWarning />
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">Gerador de Artes Visuais</h3>
        <div className="mb-4">
          <ApiKeyInput initialKey={apiKey} onKeyChange={setApiKey} moduleName="visuals" />
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            className="flex-grow bg-gray-900 border border-gray-600 rounded-md text-white p-3 focus:ring-indigo-500 focus:border-indigo-500 transition"
            placeholder="Ex: Juliette em uma cidade cyberpunk chuvosa..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleGenerate()}
            disabled={!apiKey || isLoading}
          />
          <Button onClick={handleGenerate} isLoading={isLoading} disabled={!prompt || !apiKey} className="sm:w-auto w-full">
            Gerar Arte
          </Button>
        </div>
      </div>

      {isLoading && arts.length === 0 && <Loader text="Invocando a musa digital..." />}

      {arts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading && (
            <div className="flex flex-col justify-center items-center bg-gray-800 rounded-lg shadow-lg border border-dashed border-gray-600 aspect-[3/4]">
                <Loader text="Gerando..." />
            </div>
          )}
          {arts.map((art, index) => (
            <div key={index} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden group animate-fade-in">
              <div className="relative">
                <img src={art.imageUrl} alt={art.prompt} className="w-full h-auto object-cover aspect-[3/4] group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="p-4">
                <p className="text-gray-400 text-sm truncate">{art.prompt}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};