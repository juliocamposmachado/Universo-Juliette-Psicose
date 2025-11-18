import React from 'react';

export const LocalStorageWarning: React.FC = () => {
  return (
    <div className="bg-yellow-900/30 border border-yellow-700 text-yellow-300 px-4 py-3 rounded-lg relative mb-6" role="alert">
      <strong className="font-bold">Aviso: </strong>
      <span className="block sm:inline">Seus projetos são salvos localmente no seu navegador (LocalStorage). Limpar os dados do navegador resultará na perda de todo o seu trabalho.</span>
    </div>
  );
};
