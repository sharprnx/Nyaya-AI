import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, query, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { BookOpen, FolderOpen, Trash2, ExternalLink } from 'lucide-react';

interface BookmarkData {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  createdAt: any;
}

export default function Bookmarks() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<BookmarkData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBookmarks() {
      if (!user) return;
      try {
        const refs = collection(db, 'users', user.uid, 'bookmarks');
        const q = query(refs, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as BookmarkData[];
        
        setBookmarks(data);
      } catch (error) {
        console.error("Error fetching bookmarks:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBookmarks();
  }, [user]);

  const deleteBookmark = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || !confirm("Are you sure you want to delete this bookmark?")) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'bookmarks', id));
      setBookmarks(prev => prev.filter(b => b.id !== id));
      if (selectedId === id) setSelectedId(null);
    } catch (error) {
       console.error("Error deleting bookmark:", error);
    }
  };

  const selectedBookmark = bookmarks.find(b => b.id === selectedId);

  return (
    <div className="flex h-[calc(100vh-8rem)] space-x-6 animate-in fade-in duration-500">
      
      {/* Left List Pane */}
      <div className="w-full md:w-1/3 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 shrink-0">
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-amber-500" />
            <span>My Library</span>
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {loading ? (
            <div className="p-6 text-center text-slate-500">Loading...</div>
          ) : bookmarks.length === 0 ? (
            <div className="p-8 text-center text-slate-400 flex flex-col items-center">
               <FolderOpen className="w-10 h-10 mb-2 opacity-50" />
               <p>No saved bookmarks.</p>
            </div>
          ) : (
            bookmarks.map(b => (
              <div 
                key={b.id}
                onClick={() => setSelectedId(b.id)}
                className={`p-4 cursor-pointer transition-colors relative group ${selectedId === b.id ? 'bg-amber-50 border-l-4 border-amber-500' : 'hover:bg-slate-50 border-l-4 border-transparent'}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-900 line-clamp-1">{b.title}</h4>
                    <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider text-amber-600 bg-amber-100 px-2 py-0.5 rounded-sm">
                      {b.category}
                    </span>
                  </div>
                  <button 
                    onClick={(e) => deleteBookmark(b.id, e)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-1 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Content Pane */}
      <div className="hidden md:flex flex-1 flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {selectedBookmark ? (
          <>
            <div className="p-6 border-b border-slate-100 shrink-0 bg-slate-50">
               <h2 className="text-2xl font-extrabold text-slate-900 mb-2">{selectedBookmark.title}</h2>
               <div className="flex items-center space-x-3 text-sm text-slate-500">
                  <span className="font-medium px-2.5 py-1 bg-white border border-slate-200 rounded-md">
                     {selectedBookmark.category}
                  </span>
                  <span>{selectedBookmark.description}</span>
               </div>
            </div>
            <div className="p-6 overflow-y-auto flex-1 font-sans text-slate-700 leading-relaxed whitespace-pre-wrap">
              {selectedBookmark.content.split('\n').map((line, i) => {
                  if (line.startsWith('#')) return <h3 key={i} className="font-bold text-lg text-slate-900 mt-4 mb-2">{line.replace(/#/g, '')}</h3>;
                  if (line.startsWith('**') || line.match(/^[0-9]+\.\s\*\*/)) {
                    return <h4 key={i} className="font-bold text-slate-800 mt-4 mb-1">{line.replace(/\*\*/g, '')}</h4>;
                  }
                  if (line.trim().startsWith('-')) return <li key={i} className="ml-4">{line.replace('-', '').trim()}</li>;
                  return <p key={i} className="mb-2">{line.replace(/\*\*/g, '')}</p>
                })}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-50/50">
             <BookOpen className="w-16 h-16 mb-4 opacity-10" />
             <p className="text-xl font-medium text-slate-500">Select a bookmark to read</p>
          </div>
        )}
      </div>

    </div>
  );
}
