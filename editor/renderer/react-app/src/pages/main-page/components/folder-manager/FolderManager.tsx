import { ArrowPathIcon } from "@heroicons/react/24/solid";
import { useAppSelector } from "../../../../global-state/hooks";

export function FolderManager(){
    const loaded = useAppSelector(state => state.project.loaded);
    
    return (
        <div className='flex-1 flex'>
            <div className='flex-2 flex flex-col'>
                {/* button bar */}
                <div className='flex shadow-lg/10 shadow-black'>
                    <ul className='flex-1 flex'>
                        <button className='p-2 hover:cursor-pointer hover:opacity-50 transition-opacity'>
                            <ArrowPathIcon className='size-4 text-white'/>
                        </button>
                    </ul>
                    <ul className='flex-1 flex justify-end'>
                        <button className='p-2 hover:cursor-pointer hover:opacity-50 transition-opacity'>
                            <ArrowPathIcon className='size-4 text-white'/>
                        </button>
                    </ul>
                </div>
                {/* folder */}
                <div className='px-1 py-2 flex flex-col'>
                    {loaded + ""}
                </div>
            </div>
            <div className='flex-4 bg-gray-400'></div>
        </div>
    );
}