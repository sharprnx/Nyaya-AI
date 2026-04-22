import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { GoogleGenAI } from '@google/genai';
import { Send, Loader2, BookmarkPlus, Check, AlertCircle, Search } from 'lucide-react';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function ScenarioAnalyzer() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const analyzeScenario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResult(null);
    setSaved(false);

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: `You are an expert Indian Legal Advisor AI. 
        Analyze the following scenario strictly based on the Bharatiya Nyaya Sanhita (BNS) and other relevant updated Indian laws.
        Do not provide definitive legal counsel. Focus on guidance and clarity.
        
        Structure your response clearly using Markdown:
        1. **Key Legal Triggers**: What are the main legal issues in this scenario?
        2. **Applicable Sections (BNS & Others)**: List the specific sections.
        3. **Structured Interpretation**: Simply explain how the law applies.
        4. **Suggested Next Steps**: General guidance on what one should typically do.
        
        Scenario: "${query}"`,
      });

      const aiText = response.text || "No insights could be generated.";
      setResult(aiText);

      // Save to recent searches
      if (user) {
        await addDoc(collection(db, 'users', user.uid, 'searches'), {
          query: query.substring(0, 500), // Max 500 chars as per our security rules
          responseSummary: aiText.substring(0, 200) + '...',
          createdAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error("Error analyzing scenario:", error);
      setResult("**Error**: Could not connect to the AI engine. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const saveBookmark = async () => {
    if (!user || !result || saved) return;
    
    try {
      await addDoc(collection(db, 'users', user.uid, 'bookmarks'), {
        title: query.substring(0, 50) + "...",
        description: "Scenario Analysis Result",
        content: result.substring(0, 20000), // Cap size
        category: "BNS Scenario",
        createdAt: serverTimestamp()
      });
      setSaved(true);
    } catch (error) {
      console.error("Error saving bookmark:", error);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-in fade-in duration-500">
      <header className="mb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Scenario Analyzer</h1>
        <p className="text-slate-500 mt-1 font-medium">Describe your situation to get AI-powered legal guidance.</p>
      </header>

      <div className="flex-1 flex flex-col space-y-6">
        {/* Input Area */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 shrink-0">
          <form onSubmit={analyzeScenario} className="relative">
            <textarea
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none h-32"
              placeholder="E.g., I was involved in a minor traffic collision where the other driver was at fault but is refusing to pay. What are my rights?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
            ></textarea>
            <div className="absolute bottom-3 right-3">
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white p-2.5 rounded-lg transition-colors flex items-center justify-center shadow-sm"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
          </form>
        </div>

        {/* Results Area */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          {result ? (
            <>
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
                <span className="font-bold text-slate-700 flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  <span>AI Insights</span>
                </span>
                <button
                  onClick={saveBookmark}
                  disabled={saved}
                  className="flex items-center space-x-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-600 transition-colors disabled:opacity-50"
                >
                  {saved ? <Check className="w-4 h-4 text-emerald-500" /> : <BookmarkPlus className="w-4 h-4" />}
                  <span>{saved ? 'Saved' : 'Save as Bookmark'}</span>
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1 prose prose-slate max-w-none text-sm md:text-base selection:bg-amber-100 prose-headings:text-slate-800 prose-a:text-amber-600">
                 {/* For simplicity we'll just format the markdown response basicallly without a huge library, using line breaks and styling structure. In a full production app we'd use react-markdown */}
                 <div className="whitespace-pre-wrap font-sans leading-relaxed text-slate-700">
                    {result.split('\n').map((line, i) => {
                      if (line.startsWith('#')) return <h3 key={i} className="font-bold text-lg text-slate-900 mt-4 mb-2">{line.replace(/#/g, '')}</h3>;
                      if (line.startsWith('**') || line.match(/^[0-9]+\.\s\*\*/)) {
                        return <h4 key={i} className="font-bold text-slate-800 mt-4 mb-1">{line.replace(/\*\*/g, '')}</h4>;
                      }
                      if (line.trim().startsWith('-')) return <li key={i} className="ml-4">{line.replace('-', '').trim()}</li>;
                      return <p key={i} className="mb-2">{line.replace(/\*\*/g, '')}</p>
                    })}
                 </div>
              </div>
            </>
          ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
              <Search className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-lg font-medium text-slate-500">Awaiting your scenario</p>
              <p className="text-sm mt-2 max-w-xs">Type your situation above and press send to get a structured legal analysis.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
