import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Scale, ShieldCheck, Search, BookOpen, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export default function LandingPage() {
  const { user, signIn, loading } = useAuth();

  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Scale className="w-8 h-8 text-amber-600" />
          <span className="text-xl font-extrabold text-slate-900 tracking-tight">Nyaya AI</span>
        </div>
        <button
          onClick={signIn}
          className="bg-slate-900 text-white px-6 py-2.5 rounded-full font-medium hover:bg-slate-800 transition-all shadow-sm"
        >
          Sign in
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 mt-12 md:mt-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center space-x-2 bg-amber-100 text-amber-800 px-4 py-1.5 rounded-full text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            <span>Bharatiya Nyaya Sanhita (BNS) Supported</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-slate-900 tracking-tight leading-tight mb-6">
            Your Personal <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-400 font-sans font-extrabold tracking-tight">
              Legal Companion
            </span>
          </h1>
          
          <p className="mt-4 text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto font-light leading-relaxed mb-10">
            Simplifying complex Indian legal systems into actionable insights. Get clarity on scenarios, laws, and procedures instantly.
          </p>

          <button
            onClick={signIn}
            className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-slate-900 rounded-full overflow-hidden transition-transform active:scale-95 shadow-xl hover:shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative flex items-center space-x-2">
              <svg className="w-6 h-6 bg-white rounded-full p-1 text-slate-900" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Continue with Google</span>
            </span>
          </button>
          
          <p className="mt-4 text-sm text-slate-500 font-medium">Faster onboarding. Higher security.</p>
        </motion.div>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto text-left px-4 pb-20">
          <FeatureCard 
            icon={<ShieldCheck className="w-6 h-6 text-emerald-600" />}
            title="Trusted Guidance"
            desc="Based on the latest Bharatiya Nyaya Sanhita (BNS) and updated Indian frameworks."
          />
          <FeatureCard 
            icon={<Search className="w-6 h-6 text-blue-600" />}
            title="Scenario Analysis"
            desc="Describe your situation and let AI identify key legal triggers and applicable sections."
          />
          <FeatureCard 
            icon={<BookOpen className="w-6 h-6 text-purple-600" />}
            title="Save & Learn"
            desc="Bookmark important laws and keep track of your search history for instant reuse."
          />
        </div>
      </main>
      
      <footer className="py-6 text-center text-slate-500 text-sm border-t border-slate-200">
        <p className="font-medium">Made with ❤️ by Shivank Shukla</p>
        <p className="mt-1 text-xs opacity-75">Informational use only. Not a substitute for a professional lawyer.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{desc}</p>
    </div>
  );
}
