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

// FIX: Removed duplicated global declaration for AIStudio and Window to resolve TypeScript errors.
// The single source of truth for these global types is in the root `types.ts` file.
