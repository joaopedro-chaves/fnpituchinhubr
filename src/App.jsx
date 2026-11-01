import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CatalogPage } from './pages/CatalogPage.jsx';
import { CodesPage } from './components/CodesPage.jsx';

/**
 * Rotas do app. Usamos HashRouter (`#/` e `#/codes`) porque o site é
 * estático no GitHub Pages: não há servidor para reescrever URLs, e o
 * link de compartilhamento (`?c=...`) continua na query string real.
 */
export default function App() {
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<CatalogPage />} />
                <Route path="/codes" element={<CodesPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </HashRouter>
    );
}
