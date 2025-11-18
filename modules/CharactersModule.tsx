import React, { useState, useCallback, useEffect } from 'react';
import { generateCharacter } from '../services/geminiService';
import { Button } from '../components/Button';
import { Loader } from '../components/Loader';
import { LocalStorageWarning } from '../components/LocalStorageWarning';
import type { Character } from '../types';

const downloadJSON = (data: object, filename: string) => {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const downloadText = (character: Character, filename: string) => {
  const content = `
Nome: ${character.name}
Versão: ${character.version}
--------------------------------------

APARÊNCIA
${character.appearance}

--------------------------------------

PSICOLOGIA
${character.psychology}

--------------------------------------

PODERES
- ${character.powers.join('\n- ')}

--------------------------------------

CONTRADIÇÕES INTERNAS
- ${character.internalContradictions.join('\n- ')}

--------------------------------------

VOZ NARRATIVA
${character.narrativeVoice}
  `;
  const blob = new Blob([content.trim()], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const CharacterCard: React.FC<{ character: Character }> = ({ character }) => (
  <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 animate-fade-in flex flex-col justify-between hover:border-indigo-500 transition-colors duration-300">
    <div className="space-y-4">
        <div className="flex justify-between items-start">
        <div>
            <h3 className="text-2xl font-bold text-white">{character.name}</h3>
            <p className="text-indigo-400 font-semibold">{character.version}</p>
        </div>
        </div>
        
        <div>
        <h4 className="font-semibold text-gray-300 mb-1">Aparência</h4>
        <p className="text-gray-400 text-sm">{character.appearance}</p>
        </div>
        
        <div>
        <h4 className="font-semibold text-gray-300 mb-1">Psicologia</h4>
        <p className="text-gray-400 text-sm">{character.psychology}</p>
        </div>

        <div>
        <h4 className="font-semibold text-gray-300 mb-1">Poderes</h4>
        <div className="flex flex-wrap gap-2">
            {character.powers.map((power, i) => (
            <span key={i} className="bg-gray-700 text-gray-300 text-xs font-medium px-2.5 py-1 rounded-full">{power}</span>
            ))}
        </div>
        </div>

        <div>
        <h4 className="font-semibold text-gray-300 mb-1">Contradições Internas</h4>
        <ul className="list-disc list-inside text-gray-400 text-sm space-y-1">
            {character.internalContradictions.map((contradiction, i) => (
                <li key={i}>{contradiction}</li>
            ))}
        </ul>
        </div>
    </div>

    <div className="flex justify-end gap-2 mt-6">
        <button onClick={() => downloadText(character, character.name)} className="px-3 py-1 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors">
            Baixar TXT
        </button>
        <button onClick={() => downloadJSON(character, character.name)} className="px-3 py-1 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors">
            Baixar JSON
        </button>
    </div>
  </div>
);


export const CharactersModule: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [userPrompt, setUserPrompt] = useState('');
  const [characters, setCharacters] = useState<Character[]>(() => {
    try {
        const saved = localStorage.getItem('juliette_characters');
        return saved ? JSON.parse(saved) : [];
    } catch (error) {
        console.error("Falha ao carregar personagens do LocalStorage:", error);
        return [];
    }
  });

  useEffect(() => {
    try {
        localStorage.setItem('juliette_characters', JSON.stringify(characters));
    } catch (error) {
        console.error("Falha ao salvar personagens no LocalStorage:", error);
    }
  }, [characters]);


  const handleGenerate = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await generateCharacter(userPrompt);
      if (result) {
        setCharacters(prev => [result, ...prev]);
        setUserPrompt('');
      }
    } catch (error) {
      console.error("Failed to generate character", error);
    } finally {
      setIsLoading(false);
    }
  }, [userPrompt]);

  return (
    <div className="space-y-6">
      <LocalStorageWarning />
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 space-y-4">
        <h3 className="text-xl font-semibold text-white">Fichas de Personagens</h3>
        <div className="space-y-2">
            <label htmlFor="character-prompt" className="block text-sm font-medium text-gray-300">
                Adicione um comentário ou ideia para guiar a criação:
            </label>
            <textarea
                id="character-prompt"
                rows={3}
                className="w-full bg-gray-900 border border-gray-600 rounded-md text-white p-3 focus:ring-indigo-500 focus:border-indigo-500 transition"
                placeholder="Ex: Uma Juliette que é uma artista reclusa com o poder de pintar o futuro..."
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
            />
        </div>
        <div className="flex justify-end">
            <Button onClick={handleGenerate} isLoading={isLoading}>
              Gerar Novo Personagem
            </Button>
        </div>
      </div>

      {isLoading && characters.length === 0 && <Loader text="Consultando o subconsciente..." />}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading && (
             <div className="flex flex-col justify-center items-center bg-gray-800 rounded-lg shadow-lg border border-dashed border-gray-600 min-h-[300px]">
                <Loader text="Gerando..." />
            </div>
        )}
        {characters.map((char, index) => (
          <CharacterCard key={index} character={char} />
        ))}
      </div>

    </div>
  );
};