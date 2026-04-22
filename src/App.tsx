import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import ScenarioAnalyzer from './pages/ScenarioAnalyzer';
import SectionExplorer from './pages/SectionExplorer';
import Bookmarks from './pages/Bookmarks';
import Layout from './components/Layout';

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-800">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/" />;
  }
  
  return <Layout>{children}</Layout>;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/analyzer" element={<ProtectedRoute><ScenarioAnalyzer /></ProtectedRoute>} />
          <Route path="/explorer" element={<ProtectedRoute><SectionExplorer /></ProtectedRoute>} />
          <Route path="/bookmarks" element={<ProtectedRoute><Bookmarks /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
