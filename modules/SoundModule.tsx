import React, { useState, useCallback, useEffect } from 'react';
import { generateSound } from '../services/geminiService';
import { Button } from '../components/Button';
import { ApiKeyInput } from '../components/ApiKeyInput';
import { LocalStorageWarning } from '../components/LocalStorageWarning';
import { Loader } from '../components/Loader';
import type { GeneratedSound } from '../types';

const soundStyles = ["rock", "electronic", "pop", "jazz", "classical", "hip hop", "pop rock", "indie", "ambient", "cinematic", "dark wave", "industrial"];

type SoundDuration = '15s' | '30s' | '1 min' | '2 min' | '2 min+';
const DURATION_OPTIONS: SoundDuration[] = ['15s', '30s', '1 min', '2 min', '2 min+'];

// Função para converter áudio PCM bruto (base64) para um Blob URL de WAV
function createWavBlobUrl(base64Audio: string): string {
    const binaryString = atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    const sampleRate = 24000; // Sample rate do modelo TTS do Gemini
    const numChannels = 1;
    const bitsPerSample = 16;
    const dataSize = bytes.length;

    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    function writeString(view: DataView, offset: number, string: string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true);
    view.setUint16(32, numChannels * (bitsPerSample / 8), true);
    view.setUint16(34, bitsPerSample, true);
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);
    
    const pcmData = new Uint8Array(buffer, 44);
    pcmData.set(bytes);
    
    const blob = new Blob([view], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
}


export const SoundModule: React.FC = () => {
    const [apiKey, setApiKey] = useState(() => localStorage.getItem('juliette_api_key_sound') || '');
    const [prompt, setPrompt] = useState('');
    const [duration, setDuration] = useState<SoundDuration>('15s');
    const [isLoading, setIsLoading] = useState(false);
    const [sounds, setSounds] = useState<GeneratedSound[]>(() => {
        try {
            const saved = localStorage.getItem('juliette_sound_clips');
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });

    useEffect(() => {
        localStorage.setItem('juliette_sound_clips', JSON.stringify(sounds.map(({audioUrl, ...rest}) => rest)));
    }, [sounds]);

    useEffect(() => {
        // Gera URLs reproduzíveis para os sons carregados do localStorage
        const soundsWithUrls = sounds.map(sound => {
            if (sound.audioBase64 && !sound.audioUrl) {
                try {
                    return { ...sound, audioUrl: createWavBlobUrl(sound.audioBase64) };
                } catch (e) {
                    console.error("Failed to create blob url for sound", sound.id, e);
                    return sound; // Retorna o som original em caso de erro
                }
            }
            return sound;
        });
        // Apenas atualiza o estado se houver alguma mudança para evitar loop
        if (sounds.some(s => !s.audioUrl && s.audioBase64)) {
            setSounds(soundsWithUrls);
        }
    }, [sounds]);

    const handleGenerate = useCallback(async () => {
        if (!prompt || !apiKey) return;
        setIsLoading(true);
        try {
            const resultBase64 = await generateSound(apiKey, prompt, duration);
            if (resultBase64) {
                const audioUrl = createWavBlobUrl(resultBase64);
                const newSound: GeneratedSound = {
                    id: Date.now().toString(),
                    prompt,
                    audioBase64: resultBase64,
                    audioUrl: audioUrl,
                };
                setSounds(prev => [newSound, ...prev]);
                setPrompt('');
            }
        } catch (error) {
            console.error("Failed to generate sound", error);
        } finally {
            setIsLoading(false);
        }
    }, [prompt, apiKey, duration]);

    const addStyleToPrompt = (style: string) => {
        setPrompt(prev => prev ? `${prev}, ${style}` : style);
    };

    return (
        <div className="space-y-6">
            <LocalStorageWarning />
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 space-y-4">
                <h3 className="text-xl font-semibold text-white mb-2">Gerador de Produção Sonora</h3>
                <ApiKeyInput initialKey={apiKey} onKeyChange={setApiKey} moduleName="sound" />
                
                <div className="space-y-2">
                    <label htmlFor="sound-prompt" className="text-lg font-medium text-white">
                       Descreva sua Música
                    </label>
                    <textarea
                        id="sound-prompt"
                        rows={4}
                        className="w-full bg-gray-900 border border-gray-600 rounded-md text-white p-3 focus:ring-indigo-500 focus:border-indigo-500 transition disabled:opacity-50"
                        placeholder="Ex: Um hino reluzente sobre entrar no trabalho como se fosse o dono do lugar (você está atrasado), disco dos anos 70"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        disabled={!apiKey || isLoading}
                    />
                </div>
                
                <div className="space-y-2">
                    <label className="text-lg font-medium text-white">Duração da Música</label>
                    <div className="flex flex-wrap gap-2">
                        {DURATION_OPTIONS.map(opt => (
                            <button
                                key={opt}
                                onClick={() => setDuration(opt)}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors disabled:opacity-50 ${
                                    duration === opt
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                                disabled={!apiKey || isLoading}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {soundStyles.map(style => (
                        <button 
                            key={style}
                            onClick={() => addStyleToPrompt(style)}
                            className="px-3 py-1 text-sm font-medium bg-gray-700 text-gray-300 rounded-full hover:bg-indigo-600 hover:text-white transition-colors disabled:opacity-50"
                            disabled={!apiKey || isLoading}
                        >
                            {style}
                        </button>
                    ))}
                </div>

                <div className="flex justify-end">
                    <Button onClick={handleGenerate} isLoading={isLoading} disabled={!prompt || !apiKey}>
                      Gerar Áudio
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                {isLoading && sounds.length === 0 && <Loader text="Compondo a trilha sonora..." />}
                
                {sounds.map(sound => (
                    <div key={sound.id} className="bg-gray-800 p-4 rounded-lg shadow-md animate-fade-in border border-gray-700">
                        <p className="text-gray-400 mb-3 text-sm">{sound.prompt}</p>
                        {sound.audioUrl && (
                            <audio controls src={sound.audioUrl} className="w-full">
                                Seu navegador não suporta o elemento de áudio.
                            </audio>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};