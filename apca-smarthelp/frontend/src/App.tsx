import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { I18nProvider } from './i18n';
import { AboutPage } from './pages/About';
import { AskPage } from './pages/Ask';
import { HelpViewerPage } from './pages/HelpViewer';
import { ImportWizardPage } from './pages/ImportWizard';
import { KnowledgePackagePage } from './pages/KnowledgePackage';
import { LibraryPage } from './pages/Library';
import { SearchResultsPage } from './pages/SearchResults';
import { SettingsPage } from './pages/Settings';

export default function App() {
  return (
    <I18nProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<LibraryPage />} />
            <Route path="import" element={<ImportWizardPage />} />
            <Route path="viewer" element={<HelpViewerPage />} />
            <Route path="search" element={<SearchResultsPage />} />
            <Route path="ask" element={<AskPage />} />
            <Route path="packages" element={<KnowledgePackagePage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </I18nProvider>
  );
}
