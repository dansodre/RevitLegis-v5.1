import React from 'react';
import { KeyRound, CheckCircle, AlertCircle } from 'lucide-react';

const ConfigPanel = ({
  aiProvider,
  changeProvider,
  activeUserApiKey,
  userApiKeyInput,
  setUserApiKeyInput,
  handleSaveGeminiKey,
  handleRemoveGeminiKey,
  openAiModel,
  setOpenAiModel,
  activeOpenAiApiKey,
  userOpenAiApiKeyInput,
  setUserOpenAiApiKeyInput,
  handleSaveOpenAiKey,
  handleRemoveOpenAiKey,
  apiKeyMessage
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors duration-300">
      <div className="bg-slate-50/50 dark:bg-slate-800/50 px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center">
            <KeyRound size={20} className="text-indigo-600 dark:text-indigo-400 mr-2.5" />
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Configuração da IA</h2>
        </div>
        
        <div className="flex p-1 bg-slate-200/60 dark:bg-slate-700/60 rounded-lg self-start md:self-auto">
            <button 
                onClick={() => changeProvider('gemini')}
                className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all duration-200 ${aiProvider === 'gemini' ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-600/50'}`}
            >
                Google Gemini
            </button>
            <button 
                onClick={() => changeProvider('openai')}
                className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all duration-200 ${aiProvider === 'openai' ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-600/50'}`}
            >
                OpenAI
            </button>
        </div>
      </div>

      <div className="p-6">
        {aiProvider === 'gemini' ? (
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {activeUserApiKey ? (
                    <div className="flex-grow flex items-center justify-between px-4 py-3 bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl transition-all">
                       <div className="flex items-center">
                          <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-1 rounded-full mr-3">
                            <CheckCircle size={16} strokeWidth={3} />
                          </div>
                          <div>
                              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">API Key Configurada</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">Google Gemini está pronto para uso.</p>
                          </div>
                       </div>
                       <button onClick={handleRemoveGeminiKey} className="text-sm text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 font-medium px-3 py-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">Alterar</button>
                    </div>
                  ) : (
                      <>
                          <input
                          type="password"
                          value={userApiKeyInput}
                          onChange={(e) => setUserApiKeyInput(e.target.value)}
                          placeholder="Cole sua API Key do Google AI Studio aqui..."
                          className="flex-grow px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                          />
                          <button onClick={handleSaveGeminiKey} className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm hover:shadow-md">
                            Salvar
                          </button>
                      </>
                  )}
                </div>
                {!activeUserApiKey && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                        Não tem uma chave? <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline">Obter chave gratuita</a>
                    </p>
                )}
            </div>
        ) : (
            <div className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Modelo:</label>
                    <select 
                      value={openAiModel} 
                      onChange={(e) => setOpenAiModel(e.target.value)}
                      className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none shadow-sm cursor-pointer hover:border-indigo-300 transition-colors"
                    >
                        <option value="gpt-4o-mini">GPT-4o Mini (Recomendado)</option>
                        <option value="gpt-4o">GPT-4o (Mais Preciso)</option>
                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    </select>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {activeOpenAiApiKey ? (
                    <div className="flex-grow flex items-center justify-between px-4 py-3 bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl transition-all">
                       <div className="flex items-center">
                          <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-1 rounded-full mr-3">
                            <CheckCircle size={16} strokeWidth={3} />
                          </div>
                          <div>
                              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">API Key Configurada</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">OpenAI ({openAiModel}) pronto para uso.</p>
                          </div>
                       </div>
                       <button onClick={handleRemoveOpenAiKey} className="text-sm text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 font-medium px-3 py-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">Alterar</button>
                    </div>
                  ) : (
                      <>
                          <input
                          type="password"
                          value={userOpenAiApiKeyInput}
                          onChange={(e) => setUserOpenAiApiKeyInput(e.target.value)}
                          placeholder="sk-..."
                          className="flex-grow px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                          />
                          <button onClick={handleSaveOpenAiKey} className="px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 active:bg-green-800 transition-colors shadow-sm hover:shadow-md">
                            Salvar
                          </button>
                      </>
                  )}
                </div>
                 {!activeOpenAiApiKey && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                        <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline">Gerar chave OpenAI</a>
                    </p>
                )}
            </div>
        )}

        {apiKeyMessage && (
          <div className={`mt-4 text-sm font-medium flex items-center animate-fadeIn ${
              apiKeyMessage.includes('salva') || apiKeyMessage.includes('carregada') ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
            }`}
          >
              {apiKeyMessage.includes('salva') || apiKeyMessage.includes('carregada') ? <CheckCircle size={16} className="mr-2"/> : <AlertCircle size={16} className="mr-2"/>}
              {apiKeyMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfigPanel;
