import React, { useState, useEffect } from 'react';

interface ApiKeyInputProps {
  initialKey: string;
  onKeyChange: (key: string) => void;
  moduleName: string;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ initialKey, onKeyChange, moduleName }) => {
  const [key, setKey] = useState(initialKey);
  const [isEditing, setIsEditing] = useState(!initialKey);
  const storageKey = `juliette_api_key_${moduleName}`;

  useEffect(() => {
    const savedKey = localStorage.getItem(storageKey);
    if (savedKey) {
      setKey(savedKey);
      onKeyChange(savedKey);
      setIsEditing(false);
    }
  }, [moduleName, onKeyChange, storageKey]);

  const handleSave = () => {
    localStorage.setItem(storageKey, key);
    onKeyChange(key);
    setIsEditing(false);
  };

  const handleClear = () => {
    localStorage.removeItem(storageKey);
    setKey('');
    onKeyChange('');
    setIsEditing(true);
  };

  if (!isEditing && key) {
    return (
      <div className="flex items-center justify-between p-2 bg-gray-700 rounded-md">
        <p className="text-sm text-green-400">Chave de API salva.</p>
        <button onClick={() => setIsEditing(true)} className="text-sm text-indigo-400 hover:underline">
          Alterar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-3 bg-gray-900/50 rounded-md border border-gray-700">
      <label htmlFor={`api-key-${moduleName}`} className="block text-sm font-medium text-gray-300">
        Sua Chave de API do Gemini:
      </label>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          id={`api-key-${moduleName}`}
          type="password"
          className="flex-grow bg-gray-700 border border-gray-600 rounded-md text-white p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
          placeholder="Cole sua chave de API aqui"
          value={key}
          onChange={(e) => setKey(e.target.value)}
        />
        <button
          onClick={handleSave}
          disabled={!key}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-500 transition-colors"
        >
          Salvar
        </button>
        {initialKey && (
             <button
                onClick={handleClear}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-600 rounded-md hover:bg-gray-500 transition-colors"
            >
                Limpar
            </button>
        )}
      </div>
    </div>
  );
};
