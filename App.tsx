
import React, { useState, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { SplashScreen } from './components/SplashScreen';
import { MODULES, ModuleKey } from './constants';

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [activeModule, setActiveModule] = useState<ModuleKey>('dashboard');

  const ActiveModuleComponent = MODULES[activeModule]?.component;

  const handleSelectModule = useCallback((module: ModuleKey) => {
    setActiveModule(module);
  }, []);

  const handleEnter = useCallback(() => {
    setShowSplash(false);
  }, []);

  if (showSplash) {
    return <SplashScreen onEnter={handleEnter} />;
  }

  return (
    <div className="flex h-screen bg-gray-900 text-gray-200 animate-fade-in">
      <Sidebar activeModule={activeModule} onSelectModule={handleSelectModule} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={MODULES[activeModule]?.name || 'Dashboard'} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-gray-900 scrollbar-thin">
          {ActiveModuleComponent ? <ActiveModuleComponent /> : <div>Select a module</div>}
        </main>
      </div>
    </div>
  );
};

export default App;