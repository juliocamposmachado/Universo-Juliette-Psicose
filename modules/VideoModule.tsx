import React, { useState, useCallback, useEffect, useRef } from 'react';
import { generateVideoSegment } from '../services/geminiService';
import { Button } from '../components/Button';
import { Loader } from '../components/Loader';
import { LocalStorageWarning } from '../components/LocalStorageWarning';
import type { TimelineClip } from '../types';

// FIX: Removed local AIStudio interface and window augmentation.
// The type declaration is now centralized in `types.ts` to prevent redeclaration errors.

const ApiKeySelector: React.FC<{ onKeySelected: () => void }> = ({ onKeySelected }) => (
  <div className="flex flex-col items-center justify-center h-full bg-gray-800 rounded-lg p-8 text-center border-2 border-dashed border-gray-700">
    <h2 className="text-2xl font-bold text-white mb-4">Requer Chave de API para Vídeo</h2>
    <p className="text-gray-400 mb-6 max-w-md">
      A geração de vídeo com o modelo Veo requer que você selecione sua própria chave de API do Google AI Studio. O uso está sujeito aos termos e cobranças da sua conta.
    </p>
    <Button onClick={async () => {
      await window.aistudio.openSelectKey();
      onKeySelected();
    }}>
      Selecionar Chave de API
    </Button>
    <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="mt-4 text-sm text-indigo-400 hover:underline">
      Saiba mais sobre cobranças
    </a>
  </div>
);

const createVideoThumbnail = (videoSrc: string): Promise<string> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.src = videoSrc;
    video.crossOrigin = 'anonymous';
    video.currentTime = 1; // Pega o frame em 1s para evitar um frame preto inicial
    video.onloadeddata = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg'));
      video.remove();
      canvas.remove();
    };
    video.onerror = () => {
        resolve(""); // Retorna vazio em caso de erro
    }
  });
};

export const VideoModule: React.FC = () => {
  const [apiKeySelected, setApiKeySelected] = useState<boolean | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [activeClipSrc, setActiveClipSrc] = useState<string | null>(null);
  
  const [clips, setClips] = useState<TimelineClip[]>(() => {
    try {
        const saved = localStorage.getItem('juliette_video_clips');
        return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  
  const draggedItem = useRef<number | null>(null);
  const draggedOverItem = useRef<number | null>(null);

  useEffect(() => {
    window.aistudio.hasSelectedApiKey().then(setApiKeySelected);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('juliette_video_clips', JSON.stringify(clips));
    } catch (e) { console.error("Falha ao salvar clips no LocalStorage:", e); }
  }, [clips]);

  useEffect(() => {
    if (clips.length > 0 && !activeClipSrc) {
        setActiveClipSrc(clips[0].src);
    }
  }, [clips, activeClipSrc]);

  const handleGenerate = useCallback(async () => {
    if (!prompt) return;
    setIsLoading(true);
    setStatusMessage(''); // Limpa mensagens anteriores no início

    try {
      const result = await generateVideoSegment(prompt, referenceImage, setStatusMessage);
      
      const thumbnail = await createVideoThumbnail(result);
      const newClip: TimelineClip = {
        id: Date.now().toString(),
        src: result,
        prompt,
        thumbnail
      };
      setClips(prev => [...prev, newClip]);
      setActiveClipSrc(result);
      setPrompt('');
      setReferenceImage(null);
      
      // Limpa a mensagem de sucesso após alguns segundos
      setTimeout(() => setStatusMessage(prev => prev === 'Geração concluída!' ? '' : prev), 4000);

    } catch (error: any) {
        console.error("Falha na geração do vídeo", error);
        // A mensagem de erro já foi definida pelo serviço através de onStatusUpdate.
        // Apenas lidamos com a lógica específica da UI aqui.
        if (error.message === "API_KEY_NOT_FOUND") {
            setApiKeySelected(false);
        }
    } finally {
      setIsLoading(false);
      // A mensagem de status não é limpa aqui para que os erros persistam na tela.
    }
  }, [prompt, referenceImage]);
  
  const handleSort = () => {
    if (draggedItem.current === null || draggedOverItem.current === null) return;
    const clipsClone = [...clips];
    const dragged = clipsClone.splice(draggedItem.current, 1)[0];
    clipsClone.splice(draggedOverItem.current, 0, dragged);
    setClips(clipsClone);
    draggedItem.current = null;
    draggedOverItem.current = null;
  };

  if (apiKeySelected === null) {
    return <div className="flex items-center justify-center h-full"><Loader text="Verificando..." /></div>;
  }
  if (!apiKeySelected) {
    return <ApiKeySelector onKeySelected={() => setApiKeySelected(true)} />;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] space-y-4">
      <LocalStorageWarning />
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-gray-800 rounded-lg shadow-lg flex items-center justify-center p-2 border border-gray-700">
            {isLoading ? (
                <Loader text={statusMessage || "Gerando..."} />
            ) : activeClipSrc ? (
              <video key={activeClipSrc} controls autoPlay muted loop className="max-w-full max-h-full rounded-md">
                <source src={activeClipSrc} type="video/mp4" />
              </video>
            ) : (
                <div className="text-center text-gray-500">
                    <p>Seu filme aparecerá aqui.</p>
                    <p>Gere o primeiro clipe para começar.</p>
                </div>
            )}
        </div>
        <div className="bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700 flex flex-col space-y-4">
            <h3 className="text-xl font-semibold text-white">Gerador de Cenas</h3>
            <div className="space-y-2 flex-1 flex flex-col">
                <label htmlFor="video-prompt" className="block text-sm font-medium text-gray-300">
                    Descreva a cena:
                </label>
                <textarea
                    id="video-prompt"
                    rows={6}
                    className="w-full bg-gray-900 border border-gray-600 rounded-md text-white p-3 focus:ring-indigo-500 focus:border-indigo-500 transition flex-1"
                    placeholder="Ex: Close-up de Juliette em uma sacada, olhando para uma cidade cyberpunk chuvosa..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                />
            </div>
            {referenceImage && (
                <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-300">Usando como referência:</p>
                    <div className="relative w-24">
                        <img src={referenceImage} alt="Frame de Referência" className="rounded-md" />
                        <button onClick={() => setReferenceImage(null)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold">&times;</button>
                    </div>
                </div>
            )}
            <Button onClick={handleGenerate} isLoading={isLoading} disabled={!prompt}>
              Gerar Vídeo
            </Button>
            {statusMessage && !isLoading && (
              <p className={`mt-4 text-center text-sm font-medium ${statusMessage.startsWith('Erro') || statusMessage.startsWith('Falha') ? 'text-red-400' : 'text-green-400'}`}>
                {statusMessage}
              </p>
            )}
        </div>
      </div>
      <div className="h-48 bg-gray-800 rounded-lg shadow-lg p-2 border border-gray-700 overflow-x-auto scrollbar-thin">
        <div className="flex h-full items-center space-x-3">
          {clips.map((clip, index) => (
            <div
              key={clip.id}
              draggable
              onDragStart={() => draggedItem.current = index}
              onDragEnter={() => draggedOverItem.current = index}
              onDragEnd={handleSort}
              onDragOver={(e) => e.preventDefault()}
              className="relative flex-shrink-0 h-full aspect-video rounded-md cursor-pointer group border-2 border-transparent hover:border-indigo-500"
              onClick={() => setActiveClipSrc(clip.src)}
            >
              <img src={clip.thumbnail} alt={clip.prompt} className="w-full h-full object-cover rounded-md" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                <button onClick={(e) => { e.stopPropagation(); setReferenceImage(clip.thumbnail); }} className="text-xs bg-indigo-600 text-white px-2 py-1 rounded">
                    Usar como Referência
                </button>
              </div>
            </div>
          ))}
          {clips.length === 0 && !isLoading && (
             <div className="flex items-center justify-center w-full h-full text-gray-500">
                Sua timeline de clipes aparecerá aqui.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};