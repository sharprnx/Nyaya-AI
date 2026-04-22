import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { Search, Clock, ChevronRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const [recentSearches, setRecentSearches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecentData() {
      if (!user) return;
      try {
        const searchesRef = collection(db, 'users', user.uid, 'searches');
        const q = query(searchesRef, orderBy('createdAt', 'desc'), limit(3));
        const snapshot = await getDocs(q);
        
        const searches = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setRecentSearches(searches);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecentData();
  }, [user]);

  const facts = [
    "Did you know? Under BNS 2023, Community Service is introduced as a punishment for certain petty offenses.",
    "Did you know? E-FIRs can now be registered for certain crimes under the new BNSS framework.",
    "Fact: The legal age of criminal responsibility in India is generally 7 years, but can be 12 depending on maturity."
  ];
  const randomFact = facts[Math.floor(Math.random() * facts.length)];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Good to see you, {user?.displayName?.split(' ')[0]}</h1>
        <p className="text-slate-500 mt-1 font-medium">Your personal legal dashboard.</p>
      </header>

      <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-md">
        <div className="flex items-start space-x-3">
          <BookOpen className="w-6 h-6 shrink-0 opacity-80" />
          <div>
            <h3 className="font-bold text-lg mb-1">Legal Fact of the Day</h3>
            <p className="text-amber-50 leading-relaxed text-sm md:text-base">
              {randomFact}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/analyzer" className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all hover:border-amber-300 flex flex-col items-start text-left">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl mb-4 group-hover:scale-110 transition-transform">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Scenario Analyzer</h3>
          <p className="text-slate-500 text-sm leading-relaxed max-w-sm mb-4">
            Describe a situation and let AI highlight key legal triggers and applicable sections under Indian law.
          </p>
          <div className="mt-auto flex items-center space-x-2 text-amber-600 font-semibold group-hover:translate-x-1 transition-transform">
            <span>Start Analysis</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </Link>
        
        <Link to="/explorer" className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all hover:border-emerald-300 flex flex-col items-start text-left">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl mb-4 group-hover:scale-110 transition-transform">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Section Explorer</h3>
          <p className="text-slate-500 text-sm leading-relaxed max-w-sm mb-4">
            Understand the exact meaning, elements, and punishments of any legal section (BNS, IPC, IT Act, etc.).
          </p>
          <div className="mt-auto flex items-center space-x-2 text-emerald-600 font-semibold group-hover:translate-x-1 transition-transform">
            <span>Explore Law</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </Link>

        <Link to="/bookmarks" className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all hover:border-purple-300 flex flex-col items-start text-left">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl mb-4 group-hover:scale-110 transition-transform">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">My Legal Library</h3>
          <p className="text-slate-500 text-sm leading-relaxed max-w-sm mb-4">
            Access your bookmarked laws, specific sections, and saved case references for quick offline-like access.
          </p>
          <div className="mt-auto flex items-center space-x-2 text-purple-600 font-semibold group-hover:translate-x-1 transition-transform">
            <span>View Library</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </Link>
      </div>

      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-8">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <Clock className="w-5 h-5 text-slate-400" />
            <span>Recent Activity</span>
          </h2>
        </div>
        
        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading...</div>
          ) : recentSearches.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No recent searches found. <Link to="/analyzer" className="text-amber-600 font-medium hover:underline">Start an analysis</Link> to see history here.
            </div>
          ) : (
            recentSearches.map(search => (
              <div key={search.id} className="p-6 hover:bg-slate-50 transition-colors">
                <p className="font-medium text-slate-900 line-clamp-1">"{search.query}"</p>
                <p className="text-sm text-slate-500 mt-1 line-clamp-2">{search.responseSummary}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
