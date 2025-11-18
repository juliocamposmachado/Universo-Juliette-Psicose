// This file centralizes the global window augmentation for 'aistudio'.
// By isolating this declaration, we prevent TypeScript from processing it multiple times,
// which resolves "duplicate identifier" errors that can occur in complex project structures.
import type { AIStudio } from '../types';

declare global {
  interface Window {
    aistudio: AIStudio;
  }
}
