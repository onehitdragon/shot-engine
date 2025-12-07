import { AppBar } from './pages/main-page/components/app-bar/AppBar';
import { ContextMenu } from './pages/main-page/components/context-menu/ContextMenu';
import { MainPage } from './pages/main-page/MainPage';

function App() {
    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden">
            <AppBar />
            <MainPage />
            <ContextMenu />
        </div>
    );
}

export default App
