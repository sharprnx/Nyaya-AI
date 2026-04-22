import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { GoogleGenAI } from '@google/genai';
import { Send, Loader2, BookmarkPlus, Check, Scale } from 'lucide-react';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function SectionExplorer() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const exploreSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResult(null);
    setSaved(false);

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: `You are an expert Indian Legal Assistant AI.
        Explain the exact meaning and implications of the following legal section/code under Indian Law (e.g., Bharatiya Nyaya Sanhita (BNS), IPC, CrPC, IT Act, etc.).
        
        Focus on clarity and simple language suitable for a common person, yet accurate.
        
        Structure your response clearly using Markdown:
        1. **Official Title / Name of the Section**: What is the section called?
        2. **Core Meaning**: Simply explain what the section means.
        3. **Key Elements/Ingredients**: What conditions must be met for this section to apply?
        4. **Punishment / Implications**: What are the consequences under this section?
        5. **Example Scenario**: A brief relatable example where this section applies.
        
        Section/Code to explain: "${query}"`,
      });

      const aiText = response.text || "No insights could be generated.";
      setResult(aiText);

      // Save to recent searches
      if (user) {
        await addDoc(collection(db, 'users', user.uid, 'searches'), {
          query: `Section Search: ${query.substring(0, 400)}`, // Max 500 chars as per our security rules
          responseSummary: aiText.substring(0, 200) + '...',
          createdAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error("Error exploring section:", error);
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
        description: "Section / Code Explanation",
        content: result.substring(0, 20000), // Cap size
        category: "Section Explorer",
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
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Section Explorer</h1>
        <p className="text-slate-500 mt-1 font-medium">Search the meaning of any specific legal section across Indian laws (BNS, IPC, etc.).</p>
      </header>

      <div className="flex-1 flex flex-col space-y-6">
        {/* Input Area */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 shrink-0">
          <form onSubmit={exploreSection} className="relative">
            <input
              type="text"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 pr-16 text-slate-900 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-slate-400"
              placeholder="e.g., Section 352 BNS, 420 IPC, 66A IT Act"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
            />
            <div className="absolute top-1/2 -translate-y-1/2 right-3">
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white p-2.5 rounded-lg transition-colors flex items-center justify-center shadow-sm"
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
                  <Scale className="w-5 h-5 text-emerald-600" />
                  <span>Section Explanation</span>
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
              <div className="p-6 overflow-y-auto flex-1 prose prose-slate max-w-none text-sm md:text-base selection:bg-emerald-100 prose-headings:text-slate-800 prose-a:text-emerald-600">
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
              <Scale className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-lg font-medium text-slate-500">Waitng for section/code</p>
              <p className="text-sm mt-2 max-w-xs">Enter a specific law or section number above to understand its meaning.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
