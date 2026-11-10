import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ConnectivityProvider } from './context/ConnectivityContext';
import { Header } from './components/layout/Header';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Pages
import { Home } from './pages/Home';
import { Scan } from './pages/Scan';
import { Treatments } from './pages/Treatments';
import { Shops } from './pages/Shops';
import { History } from './pages/History';
import { Consultations } from './pages/Consultations';
import { Admin } from './pages/Admin';
import { Profile } from './pages/Profile';
import { Login } from './pages/Login';

const queryClient = new QueryClient();

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ConnectivityProvider>
          <Router>
            <div className="min-h-screen flex flex-col bg-[#F8FAF5] font-sans antialiased text-slate-800">
              <Header />
              <Navbar />

              <main className="flex-1 pb-16 md:pb-8">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/scan" element={<Scan />} />
                  <Route path="/treatments" element={<Treatments />} />
                  <Route path="/shops" element={<Shops />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/consultations" element={<Consultations />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>

              <Footer />
            </div>
          </Router>
        </ConnectivityProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
