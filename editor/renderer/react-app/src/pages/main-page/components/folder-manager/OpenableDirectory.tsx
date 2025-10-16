import { ChevronRightIcon, FolderIcon } from "@heroicons/react/24/solid";
import type { OpenaleDirectoryProps } from "./folder-manager";

export function OpenableDirectory(props: OpenaleDirectoryProps){
    return (
        <div className='ml-0 flex-col'>
            <div className='flex items-center hover:opacity-50 hover:cursor-pointer transition-opacity'>
                <ChevronRightIcon className='size-4 text-white'/>
                <FolderIcon className='size-4 text-white'/>
                <span className='text-sm ml-2 text-white'>{props.name}</span>
            </div>
        </div>
    );
}