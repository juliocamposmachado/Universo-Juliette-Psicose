
import React, { useState, useEffect, useRef } from 'react';
import { LocalStorageWarning } from '../components/LocalStorageWarning';
import { Button } from '../components/Button';
import type { FileSystemItem, FileType } from '../types';

// Ícones SVG para os tipos de arquivo
const Icons = {
  folder: (
    <svg className="w-12 h-12 text-yellow-500 mb-2" fill="currentColor" viewBox="0 0 20 20">
      <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
    </svg>
  ),
  note: (
    <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  image: (
    <svg className="w-12 h-12 text-purple-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  video: (
    <svg className="w-12 h-12 text-red-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  audio: (
    <svg className="w-12 h-12 text-green-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 6l12-3" />
    </svg>
  ),
};

export const OrganizationModule: React.FC = () => {
  // State do Sistema de Arquivos
  const [items, setItems] = useState<FileSystemItem[]>(() => {
    try {
      const saved = localStorage.getItem('juliette_organization_items');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // Navegação
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<{id: string | null, name: string}[]>([{ id: null, name: 'Raiz' }]);

  // UI States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemType, setNewItemType] = useState<FileType>('folder');
  
  // Visualizador/Editor
  const [selectedItem, setSelectedItem] = useState<FileSystemItem | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorContent, setEditorContent] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Persistência
  useEffect(() => {
    localStorage.setItem('juliette_organization_items', JSON.stringify(items));
  }, [items]);

  // Helpers
  const currentItems = items.filter(item => item.parentId === currentFolderId);

  const handleNavigate = (folder: FileSystemItem) => {
    if (folder.type !== 'folder') return;
    setCurrentFolderId(folder.id);
    setBreadcrumbs(prev => [...prev, { id: folder.id, name: folder.name }]);
  };

  const handleNavigateUp = (index: number) => {
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);
    setCurrentFolderId(newBreadcrumbs[newBreadcrumbs.length - 1].id);
  };

  const handleCreateItem = () => {
    if (!newItemName.trim()) return;

    const newItem: FileSystemItem = {
      id: Date.now().toString(),
      parentId: currentFolderId,
      name: newItemName,
      type: newItemType,
      content: newItemType === 'note' ? '' : undefined,
      createdAt: Date.now()
    };

    setItems(prev => [...prev, newItem]);
    setNewItemName('');
    setIsCreateModalOpen(false);
    
    // Se for nota, já abre para editar
    if (newItemType === 'note') {
        handleOpenItem(newItem);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limite simples de 5MB para não estourar o LocalStorage
    if (file.size > 5 * 1024 * 1024) {
        alert("Arquivo muito grande! O limite para armazenamento local é 5MB.");
        return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
        let type: FileType = 'note'; // fallback
        if (file.type.startsWith('image/')) type = 'image';
        else if (file.type.startsWith('audio/')) type = 'audio';
        else if (file.type.startsWith('video/')) type = 'video';

        const newItem: FileSystemItem = {
            id: Date.now().toString(),
            parentId: currentFolderId,
            name: file.name,
            type: type,
            content: reader.result as string,
            createdAt: Date.now()
        };
        setItems(prev => [...prev, newItem]);
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este item? Se for uma pasta, o conteúdo será perdido.")) {
        // Remover item e seus filhos recursivamente (simples)
        // Para simplificar, removemos apenas o item e itens que tem ele como pai direto
        setItems(prev => prev.filter(i => i.id !== id && i.parentId !== id));
        if (selectedItem?.id === id) setIsEditorOpen(false);
    }
  };

  const handleOpenItem = (item: FileSystemItem) => {
      if (item.type === 'folder') {
          handleNavigate(item);
      } else {
          setSelectedItem(item);
          setEditorContent(item.content || '');
          setIsEditorOpen(true);
      }
  };

  const handleSaveContent = () => {
      if (!selectedItem) return;
      setItems(prev => prev.map(item => 
          item.id === selectedItem.id ? { ...item, content: editorContent } : item
      ));
      setIsEditorOpen(false);
      setSelectedItem(null);
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      <LocalStorageWarning />
      
      {/* Header e Breadcrumbs */}
      <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700 flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center space-x-2 text-sm text-gray-400 overflow-x-auto">
            {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.id || 'root'}>
                    <button 
                        onClick={() => handleNavigateUp(index)}
                        className="hover:text-white font-medium transition-colors"
                    >
                        {crumb.name}
                    </button>
                    {index < breadcrumbs.length - 1 && <span>/</span>}
                </React.Fragment>
            ))}
        </div>
        
        <div className="flex gap-2">
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileUpload} 
                accept="image/*,audio/*,video/*"
            />
            <Button onClick={() => fileInputRef.current?.click()} className="text-sm py-2 bg-gray-700 hover:bg-gray-600">
                Upload Arquivo
            </Button>
            <Button onClick={() => { setNewItemType('note'); setIsCreateModalOpen(true); }} className="text-sm py-2 bg-indigo-600 hover:bg-indigo-500">
                + Nota
            </Button>
            <Button onClick={() => { setNewItemType('folder'); setIsCreateModalOpen(true); }} className="text-sm py-2 bg-yellow-600 hover:bg-yellow-500">
                + Pasta
            </Button>
        </div>
      </div>

      {/* Grid de Arquivos */}
      <div className="flex-1 bg-gray-900/50 rounded-lg p-4 overflow-y-auto min-h-[400px]">
        {currentItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <p>Pasta vazia.</p>
                <p className="text-sm">Crie uma pasta, uma nota ou faça upload de um arquivo.</p>
            </div>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {currentItems.map(item => (
                    <div 
                        key={item.id} 
                        className="group relative flex flex-col items-center p-4 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-700 hover:border-indigo-500 transition-all cursor-pointer"
                        onClick={() => handleOpenItem(item)}
                    >
                        {Icons[item.type]}
                        <span className="text-sm text-center text-gray-300 truncate w-full">{item.name}</span>
                        
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id); }}
                            className="absolute top-2 right-2 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Excluir"
                        >
                            &times;
                        </button>
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* Modal de Criação */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700 w-full max-w-md">
                <h3 className="text-xl font-bold text-white mb-4">Criar Nova {newItemType === 'folder' ? 'Pasta' : 'Nota'}</h3>
                <input 
                    autoFocus
                    type="text" 
                    className="w-full bg-gray-900 border border-gray-600 rounded-md text-white p-3 mb-4 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder={`Nome da ${newItemType === 'folder' ? 'pasta' : 'nota'}...`}
                    value={newItemName}
                    onChange={e => setNewItemName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleCreateItem()}
                />
                <div className="flex justify-end gap-2">
                    <button onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-gray-300 hover:text-white">Cancelar</button>
                    <Button onClick={handleCreateItem}>Criar</Button>
                </div>
            </div>
        </div>
      )}

      {/* Modal Editor/Visualizador */}
      {isEditorOpen && selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-gray-800 rounded-lg shadow-2xl border border-gray-700 w-full max-w-4xl h-[80vh] flex flex-col">
                  <div className="flex justify-between items-center p-4 border-b border-gray-700">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          {Icons[selectedItem.type]}
                          {selectedItem.name}
                      </h3>
                      <button onClick={() => setIsEditorOpen(false)} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                  </div>
                  
                  <div className="flex-1 overflow-auto p-4 bg-gray-900">
                      {selectedItem.type === 'note' ? (
                          <textarea 
                              className="w-full h-full bg-transparent text-gray-200 resize-none focus:outline-none font-mono"
                              value={editorContent}
                              onChange={e => setEditorContent(e.target.value)}
                              placeholder="Escreva suas ideias aqui..."
                          />
                      ) : selectedItem.type === 'image' ? (
                          <div className="flex justify-center">
                              <img src={selectedItem.content} alt={selectedItem.name} className="max-w-full h-auto rounded shadow-lg" />
                          </div>
                      ) : selectedItem.type === 'audio' ? (
                           <div className="flex flex-col items-center justify-center h-full">
                               <audio controls src={selectedItem.content} className="w-full max-w-md" />
                           </div>
                      ) : selectedItem.type === 'video' ? (
                          <div className="flex justify-center h-full">
                              <video controls src={selectedItem.content} className="max-w-full max-h-full rounded shadow-lg" />
                          </div>
                      ) : null}
                  </div>

                  <div className="p-4 border-t border-gray-700 flex justify-end gap-2">
                      {selectedItem.type === 'note' ? (
                          <Button onClick={handleSaveContent}>Salvar Nota</Button>
                      ) : (
                          <button onClick={() => setIsEditorOpen(false)} className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600">Fechar</button>
                      )}
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};
