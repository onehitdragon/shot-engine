import { AppBar } from './pages/main-page/components/app-bar/AppBar';
import { AssetManager } from './pages/main-page/components/asset-manager/AssetManager';
import { ContextMenu } from './pages/main-page/components/context-menu/ContextMenu';
import { AppConfirmDialog } from './pages/main-page/components/dialogs/AppConfirmDialog';
import { AppLoading } from './pages/main-page/components/loadings/AppLoading';
import { MainPage } from './pages/main-page/MainPage';

function App() {
    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden">
            <AppBar />
            <MainPage />
            <ContextMenu />
            <AssetManager />
            <AppLoading />
            <AppConfirmDialog />
        </div>
    );
}

export default App
