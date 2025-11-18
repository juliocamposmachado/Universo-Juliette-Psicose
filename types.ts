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


// FIX: Centralized AIStudio interface and window augmentation to avoid redeclaration errors.
// This makes the type available globally.
export interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

// NOTE: The global window augmentation has been moved to src/types.ts
// to resolve duplicate identifier errors. All modules now rely on that file
// for global type safety regarding 'window.aistudio'.
