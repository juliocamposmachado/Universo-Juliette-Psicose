import React, { useState, useCallback, useRef } from 'react';
import { transformImage } from '../services/geminiService';
import { Button } from '../components/Button';
import { Loader } from '../components/Loader';
import { LocalStorageWarning } from '../components/LocalStorageWarning';
import { ApiKeyInput } from '../components/ApiKeyInput';
import type { TransformerSettings } from '../types';

const PRESETS = [
  { id: 'realistic', label: 'Realista', style: 'Hyper-realistic, cinematic lighting, 8k' },
  { id: 'comic', label: 'HQ / Gibi', style: 'Comic book style, bold lines, vibrant colors, graphic novel aesthetic' },
  { id: 'painting', label: 'Pintura Digital', style: 'Digital painting, brush strokes, artistic texture, oil painting style' },
  { id: 'cyberpunk', label: 'Cyberpunk', style: 'Cyberpunk, neon lights, rainy atmosphere, high tech low life, futuristic' },
  { id: 'watercolor', label: 'Aquarela', style: 'Watercolor painting, soft edges, artistic, dreamy, pastel colors' },
  { id: 'horror', label: 'Horror Psicológico', style: 'Dark surrealism, psychological horror, eerie atmosphere, shadow play, intense' },
  { id: 'sketch', label: 'Sketch', style: 'Pencil sketch, rough lines, charcoal, artistic draft' },
  { id: 'noir', label: 'Noir', style: 'Film noir, black and white, high contrast, dramatic shadows, mystery' },
];

export const TransformerModule: React.FC = () => {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('juliette_api_key_transformer') || '');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [transformedImage, setTransformedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Configurações
  const [settings, setSettings] = useState<TransformerSettings>({
    preset: 'realistic',
    styleStrength: 60,
    detailLevel: 'high',
    denoise: 25,
    faceAware: true,
    promptModifier: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result as string);
        setTransformedImage(null); // Reset previous result
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTransform = useCallback(async () => {
    if (!originalImage || !apiKey) return;
    
    setIsLoading(true);
    try {
      // Encontrar o estilo do preset selecionado
      const selectedPreset = PRESETS.find(p => p.id === settings.preset);
      const effectiveSettings = {
          ...settings,
          preset: selectedPreset ? selectedPreset.style : settings.preset
      };

      const result = await transformImage(apiKey, originalImage, effectiveSettings);
      
      if (result.startsWith('data:image')) {
          setTransformedImage(result);
      } else {
          alert(result); // Show error
      }
    } catch (error) {
      console.error("Transformation failed", error);
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, originalImage, settings]);

  const handleDownload = () => {
      if (transformedImage) {
          const a = document.createElement('a');
          a.href = transformedImage;
          a.download = `juliette_transform_${Date.now()}.jpg`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
      }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <LocalStorageWarning />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Coluna Esquerda - Controles */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 space-y-6 overflow-y-auto scrollbar-thin">
            <h3 className="text-xl font-bold text-white">Transformador</h3>
            
            <ApiKeyInput initialKey={apiKey} onKeyChange={setApiKey} moduleName="transformer" />

            {/* Upload Area */}
            <div 
                className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-indigo-500 transition cursor-pointer bg-gray-900/50"
                onClick={() => fileInputRef.current?.click()}
            >
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    className="hidden" 
                    accept="image/*" 
                />
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mt-2 text-sm text-gray-300">Clique para carregar uma foto</p>
            </div>

            {/* Settings */}
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Preset de Estilo</label>
                    <div className="grid grid-cols-2 gap-2">
                        {PRESETS.map(preset => (
                            <button
                                key={preset.id}
                                onClick={() => setSettings({...settings, preset: preset.id})}
                                className={`px-3 py-2 text-xs font-medium rounded-md transition-all border ${
                                    settings.preset === preset.id
                                    ? 'bg-indigo-600 border-indigo-500 text-white'
                                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                                }`}
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Intensidade do Estilo: {settings.styleStrength}%</label>
                    <input 
                        type="range" min="0" max="100" 
                        value={settings.styleStrength}
                        onChange={e => setSettings({...settings, styleStrength: parseInt(e.target.value)})}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                </div>

                <div>
                     <label className="block text-sm font-medium text-gray-300 mb-1">Prompt Modificador (Opcional)</label>
                     <textarea 
                        rows={2}
                        className="w-full bg-gray-900 border border-gray-600 rounded-md text-white p-2 text-sm focus:ring-indigo-500"
                        placeholder="Ex: Adicione chuva, mude o cabelo para roxo..."
                        value={settings.promptModifier}
                        onChange={e => setSettings({...settings, promptModifier: e.target.value})}
                     />
                </div>

                <div className="flex items-center">
                    <input 
                        type="checkbox" 
                        id="faceAware"
                        checked={settings.faceAware}
                        onChange={e => setSettings({...settings, faceAware: e.target.checked})}
                        className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="faceAware" className="ml-2 text-sm font-medium text-gray-300">Preservar Identidade Facial</label>
                </div>
            </div>

            <Button 
                onClick={handleTransform} 
                isLoading={isLoading} 
                disabled={!originalImage || !apiKey}
                className="w-full"
            >
                Transformar Imagem
            </Button>
        </div>

        {/* Coluna Direita - Canvas / Resultado */}
        <div className="lg:col-span-2 bg-gray-900 rounded-lg border border-gray-700 flex items-center justify-center relative overflow-hidden">
            {!originalImage ? (
                <div className="text-gray-500 text-center">
                    <p>Nenhuma imagem carregada.</p>
                    <p className="text-sm">Carregue uma foto para começar a transformação.</p>
                </div>
            ) : (
                <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
                    <div className="flex gap-4 mb-4 w-full justify-center">
                        <div className="flex flex-col items-center">
                            <span className="text-sm text-gray-400 mb-2">Original</span>
                            <img src={originalImage} alt="Original" className="max-h-[60vh] max-w-[45%] object-contain rounded shadow-lg border border-gray-700" />
                        </div>
                        
                        {transformedImage && (
                            <div className="flex flex-col items-center">
                                <span className="text-sm text-indigo-400 mb-2 font-bold">Resultado</span>
                                <img src={transformedImage} alt="Transformada" className="max-h-[60vh] max-w-[45%] object-contain rounded shadow-lg border-2 border-indigo-500" />
                            </div>
                        )}
                    </div>
                    
                    {isLoading && (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10 backdrop-blur-sm">
                            <Loader text="A IA está repintando a realidade..." />
                        </div>
                    )}

                    {transformedImage && (
                         <div className="mt-4 flex gap-4">
                             <button 
                                onClick={() => window.open(transformedImage, '_blank')}
                                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
                             >
                                 Abrir em Nova Aba
                             </button>
                             <Button onClick={handleDownload}>
                                 Baixar Resultado
                             </Button>
                         </div>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
