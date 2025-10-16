import { FolderOpenIcon as FolderEmptyIcon } from '@heroicons/react/24/outline'
import type { EmptyDirectoryProps } from './folder-manager';

export function EmptyDirectory(props: EmptyDirectoryProps){
    return (
        <div className='ml-0 flex-col'>
            <div className='flex items-center hover:opacity-50 hover:cursor-pointer transition-opacity'>
                <div className='size-4 text-white'/>
                <FolderEmptyIcon className='size-4 text-white'/>
                <span className='text-sm ml-2 text-white'>{props.name}</span>
            </div>
        </div>
    );
}