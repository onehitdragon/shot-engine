import { AppBar } from './pages/main-page/components/app-bar/AppBar';
import { MainPage } from './pages/main-page/MainPage';

function App() {
    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden">
            <AppBar />
            <MainPage />
        </div>
    );
}
// function App() {
//     return (
//         <div className="flex flex-col h-screen w-screen">
//             {/* area 1 */}
//             <div className='flex-1 flex flex-col'>
//                 <div className='flex-1 flex flex-col overflow-hidden'>
//                     <ul className="flex-1 flex flex-col border border-gray-600 overflow-y-scroll">
//                         {Array(30).fill(<li>a</li>)}
//                     </ul>
//                     <ul className="flex-1 flex flex-col border border-gray-600 overflow-y-scroll">
//                         {Array(30).fill(<li>b</li>)}
//                     </ul>
//                 </div>
//             </div>
//             {/* area 2 */}
//             <div className="flex-1 border border-red-500">
//                 Area 2
//             </div>
//         </div>
//     );
// }

export default App
