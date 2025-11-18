import React, { useState, useCallback, useRef, useEffect } from 'react';
import { generateNarrative, generateArt } from '../services/geminiService';
import { Button } from '../components/Button';
import { Loader } from '../components/Loader';
import { LocalStorageWarning } from '../components/LocalStorageWarning';
import type { NarrativeProject, ChatMessage } from '../types';

// Função de utilidade para download do histórico
const downloadChatHistory = (project: NarrativeProject) => {
    const filename = `${project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    let content = `Projeto: ${project.title}\n`;
    content += `Tipo: ${project.type}\n`;
    content += `Descrição: ${project.description}\n`;
    content += '------------------------------------------\n\n';

    project.chatHistory.forEach(msg => {
        const prefix = msg.sender === 'user' ? 'Você' : 'IA';
        content += `[${prefix}]:\n${msg.text}\n\n`;
        if (msg.sketches && msg.sketches.length > 0) {
            content += `(Esboço visual gerado)\n\n`;
        }
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};


// Componente para o Card do Projeto
const ProjectCard: React.FC<{ project: NarrativeProject; onSelect: () => void }> = ({ project, onSelect }) => (
  <div 
    className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 hover:border-indigo-500 transition-all duration-300 cursor-pointer group"
    onClick={onSelect}
  >
    <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
    <span className="inline-block bg-indigo-500/20 text-indigo-300 text-sm font-medium px-3 py-1 rounded-full mb-4">
      {project.type}
    </span>
    <p className="text-gray-400 text-sm line-clamp-2">{project.description}</p>
  </div>
);

// Componente para a tela de Chat/Edição
const NarrativeEditor: React.FC<{ project: NarrativeProject; onBack: () => void; onUpdateProject: (updatedProject: NarrativeProject) => void; }> = ({ project, onBack, onUpdateProject }) => {
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [project.chatHistory]);

  const handleSendMessage = useCallback(async () => {
    if (!userInput.trim()) return;

    const userMessage: ChatMessage = { sender: 'user', text: userInput };
    let updatedHistory = [...project.chatHistory, userMessage];
    onUpdateProject({ ...project, chatHistory: updatedHistory });
    setUserInput('');
    setIsLoading(true);

    try {
      const scriptPrompt = `
        Contexto da HQ: ${project.title} - ${project.description}.
        Histórico da conversa: ${JSON.stringify(project.chatHistory.slice(-4))}
        Instrução do usuário: "${userInput}"
        
        Continue a história. Gere o roteiro para o próximo painel ou cena da HQ, seguindo o estilo do 'Universo Juliette Psicose'. 
        Seja descritivo e cinematográfico.
        Depois do roteiro, adicione uma quebra "---" e então escreva um prompt curto e direto para uma IA de imagem gerar um esboço para esta cena.
      `;
      const narrativeResult = await generateNarrative(scriptPrompt, 'Comic Script');
      
      const [script, imagePrompt] = narrativeResult.split('---');

      const aiMessage: ChatMessage = { sender: 'ai', text: script.trim(), isLoadingSketches: !!imagePrompt };
      updatedHistory = [...updatedHistory, aiMessage];
      onUpdateProject({ ...project, chatHistory: updatedHistory });
      
      if (imagePrompt && imagePrompt.trim()) {
        const sketchUrl = await generateArt(imagePrompt.trim());
        const finalAiMessage = { ...aiMessage, sketches: [sketchUrl], isLoadingSketches: false };
        const finalHistory = [...updatedHistory.slice(0, -1), finalAiMessage];
        onUpdateProject({ ...project, chatHistory: finalHistory });
      }

    } catch (error) {
      console.error("Falha na geração interativa:", error);
      const errorMessage: ChatMessage = { sender: 'ai', text: 'Desculpe, ocorreu um erro ao processar sua solicitação.' };
      onUpdateProject({ ...project, chatHistory: [...updatedHistory, errorMessage] });
    } finally {
      setIsLoading(false);
    }
  }, [userInput, project, onUpdateProject]);

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] bg-gray-800 rounded-lg shadow-lg border border-gray-700">
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center">
            <button onClick={onBack} className="mr-4 text-gray-400 hover:text-white transition-colors">&larr; Voltar</button>
            <h2 className="text-xl font-semibold text-white">{project.title}</h2>
        </div>
        <button 
            onClick={() => downloadChatHistory(project)}
            className="px-4 py-2 text-sm font-medium text-gray-200 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
        >
            Baixar Histórico
        </button>
      </div>
      <div className="flex-1 p-4 overflow-y-auto scrollbar-thin">
        <div className="space-y-4">
          {project.chatHistory.map((msg, index) => (
            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xl p-4 rounded-lg ${msg.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                <p className="whitespace-pre-wrap">{msg.text}</p>
                {msg.isLoadingSketches && <div className="mt-2"><Loader text="Desenhando esboço..." /></div>}
                {msg.sketches && (
                  <div className="mt-4 grid grid-cols-1 gap-2">
                    {msg.sketches.map((url, i) => (
                      url ? <img key={i} src={url} alt="Esboço gerado" className="rounded-lg w-full" /> : null
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
      </div>
      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-4">
          <input
            type="text"
            className="flex-grow bg-gray-900 border border-gray-600 rounded-md text-white p-3 focus:ring-indigo-500 focus:border-indigo-500 transition"
            placeholder="Descreva a próxima cena ou ação..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
            disabled={isLoading}
          />
          <Button onClick={handleSendMessage} isLoading={isLoading}>
            Enviar
          </Button>
        </div>
      </div>
    </div>
  );
};


export const NarrativeModule: React.FC = () => {
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [activeProject, setActiveProject] = useState<NarrativeProject | null>(null);
  
  const [projects, setProjects] = useState<NarrativeProject[]>(() => {
    try {
        const saved = localStorage.getItem('juliette_narrative_projects');
        return saved ? JSON.parse(saved) : [];
    } catch (error) {
        console.error("Falha ao carregar projetos do LocalStorage:", error);
        return [];
    }
  });

  useEffect(() => {
    try {
        localStorage.setItem('juliette_narrative_projects', JSON.stringify(projects));
    } catch (error) {
        console.error("Falha ao salvar projetos no LocalStorage:", error);
    }
  }, [projects]);


  const handleCreateNew = () => {
    const newProject: NarrativeProject = {
      id: Date.now().toString(),
      title: 'Nova HQ Sem Título',
      type: 'HQ',
      description: 'Uma nova aventura no Universo Juliette Psicose.',
      chatHistory: [
        {
          sender: 'ai',
          text: 'Olá, Julio! Bem-vindo ao estúdio de criação. Qual é a ideia central para esta nova HQ? Descreva o conceito, o tom ou a cena inicial.'
        }
      ]
    };
    setProjects(prev => [newProject, ...prev]);
    setActiveProject(newProject);
    setView('editor');
  };

  const handleSelectProject = (project: NarrativeProject) => {
    setActiveProject(project);
    setView('editor');
  };
  
  const handleUpdateProject = (updatedProject: NarrativeProject) => {
    setActiveProject(updatedProject);
    setProjects(prevProjects => prevProjects.map(p => p.id === updatedProject.id ? updatedProject : p));
  };


  if (view === 'editor' && activeProject) {
    return <NarrativeEditor project={activeProject} onBack={() => setView('list')} onUpdateProject={handleUpdateProject} />;
  }

  return (
    <div className="space-y-6">
      <LocalStorageWarning />
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Meus Projetos Narrativos</h2>
        <Button onClick={handleCreateNew}>Criar Nova HQ</Button>
      </div>
      
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(p => (
            <ProjectCard key={p.id} project={p} onSelect={() => handleSelectProject(p)} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-800 rounded-lg border-2 border-dashed border-gray-700">
           <h3 className="text-xl font-semibold text-white mb-2">Nenhum projeto narrativo ainda.</h3>
           <p className="text-gray-400 mb-4">Clique em "Criar Nova HQ" para começar sua primeira história.</p>
        </div>
      )}
    </div>
  );
};
