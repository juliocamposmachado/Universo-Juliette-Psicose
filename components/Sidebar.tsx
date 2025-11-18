
import React from 'react';
import { MODULES, ModuleKey } from '../constants';

interface SidebarProps {
  activeModule: ModuleKey;
  onSelectModule: (module: ModuleKey) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeModule, onSelectModule }) => {
  return (
    <div className="w-16 md:w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
      <div className="flex items-center justify-center md:justify-start md:px-6 h-20 border-b border-gray-700">
        <div className="text-2xl font-bold text-white">
          <span className="md:hidden">JP</span>
          <span className="hidden md:inline">Juliette Psicose</span>
        </div>
      </div>
      <nav className="flex-1 px-2 md:px-4 py-4 space-y-2">
        {(Object.keys(MODULES) as ModuleKey[]).map((key) => {
          const module = MODULES[key];
          const isActive = activeModule === key;
          return (
            <button
              key={key}
              onClick={() => onSelectModule(key)}
              className={`flex items-center w-full justify-center md:justify-start p-3 text-sm font-medium rounded-lg group transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {module.icon}
              <span className="hidden md:inline">{module.name}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
