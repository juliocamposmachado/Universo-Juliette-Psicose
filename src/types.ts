// FIX: Removed duplicated type definitions and re-exporting from the single source of truth at the root level.
// This resolves TypeScript errors related to duplicate identifiers like 'AIStudio' and augmentations of 'Window'.
export * from '../types';
