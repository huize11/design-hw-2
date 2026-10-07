import { HashRouter, Route, Routes } from 'react-router-dom';
import { StoreProvider } from './lib/store';
import { ToastProvider } from './components/Toast';
import { Home } from './pages/Home';
import { Projects } from './pages/Projects';
import { ProjectView } from './pages/ProjectView';

export default function App() {
  return (
    <HashRouter>
      <StoreProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/p/:id" element={<ProjectView />} />
            <Route path="*" element={<Projects />} />
          </Routes>
        </ToastProvider>
      </StoreProvider>
    </HashRouter>
  );
}
