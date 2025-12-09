import React from 'react';
import { Scale, Sun, Moon } from 'lucide-react';

const Header = ({ theme, toggleTheme }) => {
  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-md">
                    <Scale size={24} strokeWidth={2.5} />
                </div>
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400 tracking-tight leading-none">RevitLegis</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide uppercase mt-0.5 hidden xs:block">Assistente Legislativo Inteligente</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-sm text-slate-500 dark:text-slate-400 hidden sm:block">
                    v1.5
                </div>
                <button 
                    onClick={toggleTheme}
                    className="p-2 rounded-full text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-all duration-300"
                    title={theme === 'dark' ? "Mudar para Modo Claro" : "Mudar para Modo Escuro"}
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </div>
        </div>
    </header>
  );
};

export default Header;
