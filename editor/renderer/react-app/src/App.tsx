import { AppBar } from './pages/main-page/components/app-bar/AppBar';
import { MainPage } from './pages/main-page/MainPage';

function App() {
    return (
        <div className="flex flex-col h-screen w-screen">
            <AppBar />
            <MainPage />
        </div>
    );
}

export default App
