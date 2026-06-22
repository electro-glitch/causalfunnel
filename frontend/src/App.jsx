import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import SessionsView from './components/SessionsView';
import HeatmapView from './components/HeatmapView';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<SessionsView />} />
          <Route path="/heatmap" element={<HeatmapView />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
