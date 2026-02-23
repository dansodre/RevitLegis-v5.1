import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, Copy, ZoomIn, ZoomOut, Sparkles, AlertCircle } from 'lucide-react';
import Header from './components/Header';
import Footer from './components/Footer';
import ConfigPanel from './components/ConfigPanel';
import DiffViewer from './components/DiffViewer';
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";

const { diffChars } = require('diff');

const App = () => {
  // Theme State
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme) return storedTheme;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  const [originalText, setOriginalText] = useState('');
  const [currentDiffTargetText, setCurrentDiffTargetText] = useState('');
  const [isTranscription, setIsTranscription] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copySuccessMessage, setCopySuccessMessage] = useState('');
  const [showComparison, setShowComparison] = useState(false);
  const [diffResultForDisplay, setDiffResultForDisplay] = useState([]);
  const [fontSize, setFontSize] = useState(1);

  const [userApiKeyInput, setUserApiKeyInput] = useState('');
  const [activeUserApiKey, setActiveUserApiKey] = useState('');
  const [apiKeyMessage, setApiKeyMessage] = useState('');

  // Estados para Multi-Provider (Gemini / OpenAI)
  const [aiProvider, setAiProvider] = useState('gemini'); // 'gemini' | 'openai'
  const [userOpenAiApiKeyInput, setUserOpenAiApiKeyInput] = useState('');
  const [activeOpenAiApiKey, setActiveOpenAiApiKey] = useState('');
  const [openAiModel, setOpenAiModel] = useState('gpt-4o-mini');

  const [reviewTime, setReviewTime] = useState(null);
  const [numAdditions, setNumAdditions] = useState(0);
  const [numDeletions, setNumDeletions] = useState(0);

  // Theme Logic
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);


  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    const storedGeminiKey = localStorage.getItem('userGeminiApiKey');
    const storedOpenAiKey = localStorage.getItem('userOpenAiApiKey');
    const storedProvider = localStorage.getItem('preferredAiProvider');

    if (storedGeminiKey) setActiveUserApiKey(storedGeminiKey);
    if (storedOpenAiKey) setActiveOpenAiApiKey(storedOpenAiKey);
    if (storedProvider && (storedProvider === 'gemini' || storedProvider === 'openai')) {
        setAiProvider(storedProvider);
    }

    if (storedGeminiKey || storedOpenAiKey) {
      setApiKeyMessage('Configurações carregadas.');
    } else {
      setApiKeyMessage('Configure uma API Key para começar.');
    }
  }, []);

  const handleSaveGeminiKey = () => {
    if (userApiKeyInput.trim()) {
      localStorage.setItem('userGeminiApiKey', userApiKeyInput.trim());
      setActiveUserApiKey(userApiKeyInput.trim());
      setApiKeyMessage('Chave Gemini salva!');
      setUserApiKeyInput('');
    } else {
      setApiKeyMessage('O campo da API Key não pode estar vazio.');
    }
  };

  const handleRemoveGeminiKey = () => {
    localStorage.removeItem('userGeminiApiKey');
    setActiveUserApiKey('');
    setApiKeyMessage('Chave Gemini removida.');
    setError('');
  };

  const handleSaveOpenAiKey = () => {
    if (userOpenAiApiKeyInput.trim()) {
      localStorage.setItem('userOpenAiApiKey', userOpenAiApiKeyInput.trim());
      setActiveOpenAiApiKey(userOpenAiApiKeyInput.trim());
      setApiKeyMessage('Chave OpenAI salva!');
      setUserOpenAiApiKeyInput('');
    } else {
      setApiKeyMessage('O campo da API Key não pode estar vazio.');
    }
  };

  const handleRemoveOpenAiKey = () => {
    localStorage.removeItem('userOpenAiApiKey');
    setActiveOpenAiApiKey('');
    setApiKeyMessage('Chave OpenAI removida.');
    setError('');
  };

  const changeProvider = (provider) => {
      setAiProvider(provider);
      localStorage.setItem('preferredAiProvider', provider);
      setError('');
      setApiKeyMessage('');
  }

  useEffect(() => {
    if (originalText || currentDiffTargetText) {
      try {
        const diffs = diffChars(originalText, currentDiffTargetText);
        setDiffResultForDisplay(diffs);
        
        let additions = 0;
        let deletions = 0;
        diffs.forEach(part => {
          if (part.added) {
            additions += part.count;
          } else if (part.removed) {
            deletions += part.count;
          }
        });
        setNumAdditions(additions);
        setNumDeletions(deletions);

      } catch (e) {
        console.error("Error using diffChars:", e);
        setDiffResultForDisplay([]);
        setNumAdditions(0);
        setNumDeletions(0);
      }
    } else {
      setDiffResultForDisplay([]);
      setNumAdditions(0);
      setNumDeletions(0);
    }
  }, [originalText, currentDiffTargetText]);


  const resetReviewState = () => {
    if (error) setError('');
    if (copySuccessMessage) setCopySuccessMessage('');
    setShowComparison(false);
    setCurrentDiffTargetText('');
    setReviewTime(null);
    setNumAdditions(0);
    setNumDeletions(0);
  }

  const handleTextChange = (e) => {
    setOriginalText(e.target.value);
    resetReviewState();
  };

  const generatePromptForRevision = useCallback((textToRevise) => {
    let styleGuidance = "Mantenha a formalidade típica de textos legislativos e administrativos.";
    if (isTranscription) {
      styleGuidance = "PRESERVE AO MÁXIMO a originalidade da fala, pois este texto é uma transcrição de discurso. Mantenha hesitações comuns (como 'ééé', 'ããã'), marcadores conversacionais (como 'né?', 'tá?', 'então') e o léxico do orador, corrigindo apenas erros gramaticais e ortográficos claros que comprometam a compreensão formal e a norma culta. Não suavize a linguagem falada para uma escrita excessivamente formal, a menos que seja um erro gramatical claro.";
    }

    return `
Você é um revisor de textos altamente competente e meticuloso, especialista em língua portuguesa do Brasil, com foco em documentos legislativos e textos para câmaras municipais, prefeituras, e assembleias legislativas.
Sua tarefa é revisar o seguinte texto de forma exaustiva, atentando a todos os detalhes.

**Critérios de Revisão Mandatórios:**

1.  **Revisão Gramatical e Ortográfica Rigorosa e Completa (Norma Culta Legislativa):**
    * Corrija todos os erros de ortografia (incluindo o Novo Acordo Ortográfico), pontuação (vírgulas, pontos, crases, etc.) e acentuação.
    * Ajuste a concordância verbal e nominal para garantir a correção absoluta.
    * Verifique e corrija minuciosamente a regência verbal e nominal, conforme o uso formal em textos legais.
    * Corrija a colocação pronominal (próclise, mesóclise, ênclise) conforme a norma culta e o estilo formal de documentos legislativos.
    * Aplique estritamente a norma culta da língua portuguesa em todos os aspetos, com atenção ao vocabulário e jargão técnico-jurídico, se presente e adequado.

2.  **Revisão de Estilo (Foco em Clareza, Precisão e Formalidade Legislativa – MÍNIMA intervenção no conteúdo):**
    * Melhore a fluidez do texto SEM ALTERAR o conteúdo, o significado original ou a intenção do autor.
    * Torne o texto mais claro, preciso, coeso e coerente através de ajustes sutis.
    * ${styleGuidance}
    * Evite alterar a estrutura das frases drasticamente, a menos que seja absolutamente essencial para a clareza ou correção gramatical.
    * Não adicione novas informações nem remova informações existentes. Apenas corrija e refine o que foi fornecido.
    * Se houver trechos ambíguos, tente torná-los mais precisos sem alterar o significado, mantendo a objetividade.
    * Substitua palavras ou expressões coloquiais inadequadas por termos formais equivalentes, exceto se for uma transcrição de discurso e a coloquialidade for característica da fala (nesse caso, manter, a menos que seja um erro gramatical).

3.  **Manutenção da Formatação Estrutural Original (Parágrafos e Quebras de Linha):**
    * **CRÍTICO:** Preserve a estrutura de parágrafos e as quebras de linha (caracteres '\\n') do texto original com a maior fidelidade possível.
    * **NÃO ALTERE** a divisão de parágrafos (não junte parágrafos que estavam separados, nem separe parágrafos que estavam juntos), a menos que seja uma correção gramatical absolutamente óbvia e inquestionável (ex: um diálogo mal formatado que precise de novas linhas para cada fala) ou se a ausência de uma quebra de parágrafo crie uma ambiguidade gramatical severa.
    * **MANTENHA** as quebras de linha intencionais dentro dos parágrafos (quebras de linha simples), a menos que prejudiquem claramente a leitura ou criem erros gramaticais.
    * O objetivo é que o texto revisado mantenha uma estrutura de parágrafos e linhas visualmente IDÊNTICA ou O MAIS PRÓXIMA POSSÍVEL à do original, alterando apenas o conteúdo textual para correções e melhorias de estilo mínimas. Evite reformatar blocos de texto.

**Formato da Resposta:**
Retorne APENAS o texto revisado. Não inclua NENHUM comentário, introdução, observação, cabeçalho ou rodapé antes ou depois do texto revisado.

**Texto Original para Revisão:**
---
${textToRevise}
---
`;
  }, [isTranscription]);
  
  const fetchRevisedTextFromAPI = useCallback(async () => {
    if (!originalText.trim()) {
      setError("O texto original não pode estar vazio."); return;
    }

    if (aiProvider === 'gemini' && !activeUserApiKey) {
      setError("API Key do Google Gemini não configurada.");
      setApiKeyMessage("API Key do Gemini necessária.");
      return;
    }
    if (aiProvider === 'openai' && !activeOpenAiApiKey) {
      setError("API Key da OpenAI não configurada.");
      setApiKeyMessage("API Key da OpenAI necessária.");
      return;
    }

    setIsLoading(true); setError(''); setShowComparison(false);
    if (copySuccessMessage) setCopySuccessMessage('');
    setReviewTime(null); setNumAdditions(0); setNumDeletions(0);

    const startTime = performance.now();
    const prompt = generatePromptForRevision(originalText);

    try {
      let resultText = '';

      if (aiProvider === 'gemini') {
        const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${activeUserApiKey}`;

        const response = await fetch(apiUrl, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: { message: response.statusText } })); 
          let specificError = `Erro da API Gemini: ${errorData?.error?.message || response.statusText}`;
          if (response.status === 400 && errorData?.error?.message?.toLowerCase().includes('api key not valid')) {
            specificError = "Chave Gemini inválida.";
          }
          throw new Error(specificError);
        }
        const result = await response.json();
        resultText = result.candidates?.[0]?.content?.parts?.[0]?.text;

      } else if (aiProvider === 'openai') {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${activeOpenAiApiKey}`
            },
            body: JSON.stringify({
                model: openAiModel,
                messages: [{ role: "user", content: prompt }],
                temperature: 0.3
            })
        });

        if (!response.ok) {
             const errorData = await response.json().catch(() => ({}));
             throw new Error(`Erro OpenAI: ${errorData?.error?.message || response.statusText}`);
        }
        const data = await response.json();
        resultText = data.choices?.[0]?.message?.content;
      }
      
      const endTime = performance.now();
      setReviewTime( ((endTime - startTime) / 1000).toFixed(2) );

      if (resultText) {
        setCurrentDiffTargetText(resultText);
        setShowComparison(true);
      } else {
        throw new Error("Resposta da API não contém texto.");
      }

    } catch (err) {
      console.error("Fetch API Error:", err);
      setError(`Falha na revisão: ${err.message}`);
      setCurrentDiffTargetText(originalText); 
    } finally {
      setIsLoading(false);
    }
  }, [originalText, generatePromptForRevision, copySuccessMessage, activeUserApiKey, activeOpenAiApiKey, aiProvider, openAiModel]);


  const handleCopyToClipboard = () => {
    if (!currentDiffTargetText) {
      setCopySuccessMessage('Nada para copiar.');
      setTimeout(() => setCopySuccessMessage(''), 2000);
      return;
    }
    const textarea = document.createElement('textarea');
    textarea.value = currentDiffTargetText;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      setCopySuccessMessage('Copiado!');
    } catch (err) {
      setCopySuccessMessage('Erro ao copiar.');
      console.error('Falha ao copiar texto: ', err);
    }
    document.body.removeChild(textarea);
    setTimeout(() => setCopySuccessMessage(''), 2000);
  };

  const handleDownloadTxt = () => {
    if (!currentDiffTargetText) return;
    const blob = new Blob([currentDiffTargetText], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const safeOriginalTextPrefix = originalText.substring(0,20).replace(/[^\w\s-]/g, '').replace(/\s+/g, '_');
    const downloadFileName = (safeOriginalTextPrefix || 'texto') + '_revisado.txt';
    link.download = downloadFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadDocx = () => {
    if (!currentDiffTargetText) return;

    const doc = new Document({
        sections: [{
            properties: {},
            children: [
                new Paragraph({
                    children: [
                        new TextRun({
                            text: currentDiffTargetText,
                            font: "Calibri",
                            size: 24, // 12pt
                        }),
                    ],
                }),
            ],
        }],
    });

    Packer.toBlob(doc).then((blob) => {
        const safeOriginalTextPrefix = originalText.substring(0, 20).replace(/[^\w\s-]/g, '').replace(/\s+/g, '_');
        saveAs(blob, `${safeOriginalTextPrefix || 'texto'}_revisado.docx`);
    });
  };

  const zoomIn = () => setFontSize(prev => Math.min(prev + 0.1, 2.5));
  const zoomOut = () => setFontSize(prev => Math.max(prev - 0.1, 0.7));
  const resetZoom = () => setFontSize(1);


  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 selection:bg-indigo-100 dark:selection:bg-indigo-900 selection:text-indigo-900 dark:selection:text-indigo-100 transition-colors duration-300`}>
      
      <Header theme={theme} toggleTheme={toggleTheme} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 space-y-6 md:space-y-8">
        
        <ConfigPanel 
            aiProvider={aiProvider}
            changeProvider={changeProvider}
            activeUserApiKey={activeUserApiKey}
            userApiKeyInput={userApiKeyInput}
            setUserApiKeyInput={setUserApiKeyInput}
            handleSaveGeminiKey={handleSaveGeminiKey}
            handleRemoveGeminiKey={handleRemoveGeminiKey}
            openAiModel={openAiModel}
            setOpenAiModel={setOpenAiModel}
            activeOpenAiApiKey={activeOpenAiApiKey}
            userOpenAiApiKeyInput={userOpenAiApiKeyInput}
            setUserOpenAiApiKeyInput={setUserOpenAiApiKeyInput}
            handleSaveOpenAiKey={handleSaveOpenAiKey}
            handleRemoveOpenAiKey={handleRemoveOpenAiKey}
            apiKeyMessage={apiKeyMessage}
        />
        
        {/* Área Principal de Trabalho */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-800">
            
            {/* Coluna de Entrada */}
            <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6">
              <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                     <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm">1</span>
                     <label htmlFor="originalText" className="text-lg font-semibold text-slate-800 dark:text-slate-100">Texto Original</label>
                  </div>
                  <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                      <button onClick={zoomOut} className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all"><ZoomOut size={16}/></button>
                      <button onClick={resetZoom} className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all font-mono text-xs w-8">{Math.round(fontSize*100)}%</button>
                      <button onClick={zoomIn} className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all"><ZoomIn size={16}/></button>
                  </div>
              </div>
              
              <div className="relative group">
                <textarea
                  id="originalText" value={originalText} onChange={handleTextChange}
                  placeholder="Cole aqui o texto legislativo, administrativo ou discurso para revisão..."
                  className="w-full h-[300px] lg:h-[500px] p-4 md:p-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-y leading-relaxed shadow-inner"
                  style={{ fontSize: `${fontSize}rem` }}
                  spellCheck="false"
                />
                <div className="absolute bottom-3 right-3 text-xs text-slate-400 dark:text-slate-500 font-medium bg-white/80 dark:bg-slate-900/80 px-2 py-1 rounded-md backdrop-blur-sm border border-slate-100 dark:border-slate-700">
                    {originalText.length} caracteres
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center cursor-pointer group">
                    <div className="relative">
                        <input type="checkbox" id="isTranscription" checked={isTranscription} onChange={(e) => setIsTranscription(e.target.checked)} className="sr-only peer"/>
                        <div className="w-10 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </div>
                    <span className="ml-3 text-sm font-medium text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Modo Transcrição de Discurso</span>
                </label>
              </div>

              <button onClick={fetchRevisedTextFromAPI} 
                disabled={isLoading || !originalText.trim() || (!activeUserApiKey && aiProvider === 'gemini') || (!activeOpenAiApiKey && aiProvider === 'openai')} 
                className="w-full relative overflow-hidden group flex items-center justify-center px-6 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:shadow-md disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 disabled:shadow-none disabled:translate-y-0 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isLoading ? (
                    <div className="flex items-center">
                        <Loader2 className="animate-spin mr-2 h-5 w-5" />
                        <span>Processando Revisão...</span>
                    </div>
                ) : (
                    <div className="flex items-center">
                        <Sparkles className="mr-2 h-5 w-5 text-indigo-200 group-hover:text-white transition-colors" />
                        <span>Revisar Texto com IA</span>
                    </div>
                )}
              </button>

              {error && ( 
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 text-red-700 dark:text-red-400 rounded-xl flex items-start animate-fadeIn">
                  <AlertCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0"/> <p className="text-sm font-medium">{error}</p>
                </div>
              )}
            </div>

            <DiffViewer 
                isLoading={isLoading}
                showComparison={showComparison}
                diffResultForDisplay={diffResultForDisplay}
                theme={theme}
                handleCopyToClipboard={handleCopyToClipboard}
                handleDownloadTxt={handleDownloadTxt}
                handleDownloadDocx={handleDownloadDocx}
                currentDiffTargetText={currentDiffTargetText}
                numAdditions={numAdditions}
                numDeletions={numDeletions}
                reviewTime={reviewTime}
                copySuccessMessage={copySuccessMessage}
                fontSize={fontSize}
            />
          </div>
        </div>

        
        {/* Seção de Comparação Lado a Lado (Opcional/Expansível) */}
        {showComparison && (
          <div className="mt-12 mb-12">
             <div className="flex items-center mb-6">
                <div className="h-px bg-slate-200 dark:bg-slate-800 flex-grow"></div>
                <h2 className="px-4 text-xl font-bold text-slate-700 dark:text-slate-200 tracking-tight">Comparativo Lado a Lado</h2>
                <div className="h-px bg-slate-200 dark:bg-slate-800 flex-grow"></div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Original</h3>
                    <div className="prose prose-sm dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 overflow-x-hidden whitespace-pre-wrap font-serif leading-relaxed">
                        {originalText}
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-indigo-100 dark:border-indigo-900/50 shadow-md ring-1 ring-indigo-50 dark:ring-indigo-900/20">
                    <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-4 border-b border-indigo-100 dark:border-indigo-900/50 pb-2 flex justify-between">
                        <span>Revisado</span>
                        <Copy size={14} className="cursor-pointer hover:text-indigo-800 dark:hover:text-indigo-300" onClick={handleCopyToClipboard}/>
                    </h3>
                    <div className="prose prose-sm dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 overflow-x-hidden whitespace-pre-wrap font-serif leading-relaxed">
                        {currentDiffTargetText}
                    </div>
                </div>
             </div>
          </div>
        )}

      </main>

      <Footer />

      <style jsx global>{`
        .animate-progressBar {
            animation: progressBar 2s infinite linear;
            background-size: 200% 100%;
            background-image: linear-gradient(to right, transparent 0%, #6366f1 50%, transparent 100%);
        }
        @keyframes progressBar {
            0% { background-position: 100% 0; }
            100% { background-position: -100% 0; }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1; 
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8; 
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569; 
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #64748b; 
        }
      `}</style>
    </div>
  );
};

export default App;
