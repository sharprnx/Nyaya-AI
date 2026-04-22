import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Scale, Home, Search, Bookmark, LogOut, Menu, X, Shield } from 'lucide-react';
import { useState } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', to: '/dashboard', icon: Home },
    { name: 'Scenario Analyzer', to: '/analyzer', icon: Search },
    { name: 'Section Explorer', to: '/explorer', icon: Scale },
    { name: 'Bookmarks', to: '/bookmarks', icon: Bookmark },
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-50">
        <div className="p-6 flex items-center space-x-3">
          <Scale className="w-8 h-8 text-amber-500" />
          <span className="text-xl font-bold tracking-tight">Nyaya AI</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-6">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive ? 'bg-amber-500/10 text-amber-500' : 'hover:bg-white/5 text-slate-300 hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center space-x-3 px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-300">
              {user?.displayName?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.displayName}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logOut}
            className="w-full mt-2 flex items-center space-x-3 px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-slate-900 text-slate-50">
          <div className="flex items-center space-x-2">
            <Scale className="w-6 h-6 text-amber-500" />
            <span className="text-lg font-bold tracking-tight">Nyaya AI</span>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </header>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute inset-0 z-40 bg-slate-900 text-slate-50 pt-20 px-4">
             <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-4 rounded-xl transition-colors ${
                      isActive ? 'bg-amber-500/10 text-amber-500' : 'text-slate-300'
                    }`
                  }
                >
                  <item.icon className="w-6 h-6" />
                  <span className="font-semibold text-lg">{item.name}</span>
                </NavLink>
              ))}
              <button
                onClick={() => { logOut(); setMobileMenuOpen(false); }}
                className="flex items-center space-x-3 px-4 py-4 text-slate-400"
              >
                <LogOut className="w-6 h-6" />
                <span className="font-semibold text-lg">Sign out</span>
              </button>
            </nav>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50">
          <div className="max-w-5xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
