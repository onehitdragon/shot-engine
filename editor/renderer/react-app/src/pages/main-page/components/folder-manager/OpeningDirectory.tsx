import { ChevronRightIcon, FolderOpenIcon } from "@heroicons/react/24/solid";
import type { OpeningDirectoryProps } from "./folder-manager";

export function OpeningDirectory(props: OpeningDirectoryProps){
    return (
        <div className='ml-0 flex-col'>
            <div className='flex items-center hover:opacity-50 hover:cursor-pointer transition-opacity'>
                <ChevronRightIcon className='size-4 text-white animate-rotateOnce'/>
                <FolderOpenIcon className='size-4 text-white'/>
                <span className='text-sm ml-2 text-white'>{props.name}</span>
            </div>
            <ul className='flex flex-col'>
                {/* directories */}
            </ul>
        </div>
    );
}