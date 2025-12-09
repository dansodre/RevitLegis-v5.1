import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-auto transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">&copy; {new Date().getFullYear()} RevitLegis. Todos os direitos reservados.</p>
        <div className="flex space-x-6 text-sm text-slate-400 dark:text-slate-500">
            <span>Desenvolvido por Danilo S.Sodré</span>
            <span>Termos de Uso</span>
        </div>
        </div>
    </footer>
  );
};

export default Footer;
