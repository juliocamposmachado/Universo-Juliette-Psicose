
export interface Character {
  name: string;
  version: string;
  appearance: string;
  personality: string;
  psychology: string;
  powers: string[];
  internalContradictions: string[];
  narrativeVoice: string;
}

export interface GeneratedArt {
  prompt: string;
  imageUrl: string;
}

export interface NarrativeContent {
  title: string;
  type: 'Book Chapter' | 'Screenplay' | 'Comic Script' | 'Short Story';
  content: string;
}

// --- NOVOS TIPOS PARA O MÓDULO DE NARRATIVA INTERATIVO ---

export interface ChatMessage {
    sender: 'user' | 'ai';
    text: string;
    sketches?: string[]; // URLs de imagens para os esboços
    isLoadingSketches?: boolean;
}

export interface NarrativeProject {
    id: string;
    title: string;
    type: 'HQ' | 'Roteiro' | 'Conto';
    description: string;
    chatHistory: ChatMessage[];
}

// --- NOVO TIPO PARA O MÓDULO DE VÍDEO ---
export interface TimelineClip {
    id: string;
    src: string; // Blob URL for the video
    prompt: string;
    thumbnail: string; // Data URL for the thumbnail
}

// --- NOVO TIPO PARA O MÓDULO DE SOM ---
export interface GeneratedSound {
    id: string;
    prompt: string;
    audioBase64: string; // Raw data for persistence
    audioUrl?: string;     // Temporary, playable Blob URL
}

// --- NOVOS TIPOS PARA O MÓDULO DE ORGANIZAÇÃO ---
export type FileType = 'folder' | 'note' | 'image' | 'video' | 'audio';

export interface FileSystemItem {
  id: string;
  parentId: string | null; // null significa raiz
  name: string;
  type: FileType;
  content?: string; // Para notas (texto) ou Base64 para mídias
  createdAt: number;
}

export interface AIStudio {
  hasSelectedApiKey(): Promise<boolean>;
  openSelectKey(): Promise<void>;
}

// --- NOVO TIPO PARA O MÓDULO TRANSFORMADOR ---
export interface TransformerSettings {
  preset: string;
  styleStrength: number; // 0-100
  detailLevel: 'low' | 'medium' | 'high' | 'extreme';
  denoise: number; // 0-100
  faceAware: boolean;
  promptModifier: string;
}
