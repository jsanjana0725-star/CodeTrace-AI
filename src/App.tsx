import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from '@/context/AppContext';
import { LandingPage } from '@/pages/LandingPage';
import { LoadingPage } from '@/pages/LoadingPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { AskAIPage } from '@/pages/AskAIPage';
import { ReportPage } from '@/pages/ReportPage';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/loading" element={<LoadingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/ask" element={<AskAIPage />} />
          <Route path="/report" element={<ReportPage />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
