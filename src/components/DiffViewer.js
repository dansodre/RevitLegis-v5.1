import React from 'react';
import { Loader2, Copy, Download, FileText, Clock } from 'lucide-react';

const DiffViewer = ({
  isLoading,
  showComparison,
  diffResultForDisplay,
  theme,
  handleCopyToClipboard,
  handleDownloadTxt,
  handleDownloadDocx,
  currentDiffTargetText,
  numAdditions,
  numDeletions,
  reviewTime,
  copySuccessMessage,
  fontSize
}) => {
  return (
    <div className="p-6 md:p-8 bg-slate-50/30 dark:bg-slate-800/20">
      <div className="h-full flex flex-col space-y-6">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm">2</span>
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Texto Revisado</h2>
            </div>
             <div className="flex space-x-2">
                <button 
                    onClick={handleCopyToClipboard} 
                    disabled={!currentDiffTargetText}
                    className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors disabled:opacity-50"
                    title="Copiar"
                >
                    <Copy size={20}/>
                </button>
                <button 
                    onClick={handleDownloadTxt} 
                    disabled={!currentDiffTargetText}
                    className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors disabled:opacity-50"
                    title="Baixar .txt"
                >
                    <Download size={20}/>
                </button>
                <button 
                    onClick={handleDownloadDocx} 
                    disabled={!currentDiffTargetText}
                    className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1 font-medium text-xs uppercase"
                    title="Baixar .docx (Word)"
                >
                    <FileText size={20}/>
                    <span className="hidden xl:inline">Word</span>
                </button>
              </div>
        </div>

        <div className="relative flex-grow min-h-[500px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden flex flex-col">
            {(isLoading || showComparison) ? (
                <>
                    <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800">
                        {isLoading && <div className="h-full bg-indigo-500 animate-progressBar"></div>}
                    </div>
                    
                    <div 
                        className="flex-grow p-8 overflow-y-auto custom-scrollbar leading-relaxed"
                        style={{ fontSize: `${fontSize}rem` }}
                    >
                        {isLoading && !showComparison ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                                <Loader2 className="h-12 w-12 mb-4 animate-spin text-indigo-500" />
                                <p className="font-medium text-slate-500 dark:text-slate-400">A Inteligência Artificial está analisando seu texto...</p>
                                <p className="text-sm mt-2">Isso pode levar alguns segundos.</p>
                            </div>
                        ) : (
                            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-200">
                                {diffResultForDisplay.map((part, index) => {
                                    const isChange = part.added || part.removed;
                                    const style = {
                                        backgroundColor: part.added 
                                            ? (theme === 'dark' ? 'rgba(22, 163, 74, 0.5)' : '#86efac') // Green-600/50% (dark) | Green-300 (light)
                                            : part.removed 
                                                ? (theme === 'dark' ? 'rgba(220, 38, 38, 0.5)' : '#fca5a5') // Red-600/50% (dark) | Red-300 (light)
                                                : 'transparent',
                                        
                                        textDecoration: part.removed ? 'line-through' : 'none',
                                        
                                        color: part.added
                                            ? (theme === 'dark' ? '#dcfce7' : '#14532d') // Green-100 (dark) | Green-900 (light)
                                            : part.removed
                                                ? (theme === 'dark' ? '#fee2e2' : '#7f1d1d') // Red-100 (dark) | Red-900 (light)
                                                : 'inherit',
                                        
                                        fontWeight: isChange ? '600' : 'normal',
                                        padding: isChange ? '2px 0' : '0',
                                        borderRadius: isChange ? '2px' : '0',
                                    };
                                    return <span key={index} style={style} className="whitespace-pre-wrap transition-colors duration-500">{part.value}</span>;
                                })}
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-800/30">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-full shadow-sm mb-4">
                        <FileText className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300">Aguardando Revisão</h3>
                    <p className="text-sm max-w-xs mt-2 mx-auto">
                        Cole o texto ao lado e inicie a revisão para ver as sugestões de melhoria aqui.
                    </p>
                </div>
            )}
        </div>

        {showComparison && (
            <div className="flex items-center justify-between text-sm bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center space-x-4">
                    <span className="flex items-center text-slate-600 dark:text-slate-400">
                        <span className="w-2 h-2 rounded-full bg-green-200 dark:bg-green-800 mr-2"></span>
                        <span className="font-medium text-green-700 dark:text-green-400">+{numAdditions}</span> <span className="ml-1 text-slate-400 dark:text-slate-500">adições</span>
                    </span>
                    <span className="flex items-center text-slate-600 dark:text-slate-400">
                        <span className="w-2 h-2 rounded-full bg-red-200 dark:bg-red-800 mr-2"></span>
                        <span className="font-medium text-red-700 dark:text-red-400">-{numDeletions}</span> <span className="ml-1 text-slate-400 dark:text-slate-500">remoções</span>
                    </span>
                </div>
                {reviewTime && (
                   <div className="flex items-center text-slate-400 dark:text-slate-500">
                      <Clock size={14} className="mr-1.5"/> <span>{reviewTime}s</span>
                   </div>
                )}
                {copySuccessMessage && <span className="text-indigo-600 dark:text-indigo-400 font-medium animate-fadeIn">{copySuccessMessage}</span>}
            </div>
        )}
      </div>
    </div>
  );
};

export default DiffViewer;
