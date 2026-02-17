import { AppProvider } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ApiTrace from './components/ApiTrace';
import SettingsModal from './components/SettingsModal';
import MainContent from './components/MainContent';

function App() {
  return (
    <AppProvider>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <MainContent />
        </div>
        <ApiTrace />
        <SettingsModal />
      </div>
    </AppProvider>
  );
}

export default App;
