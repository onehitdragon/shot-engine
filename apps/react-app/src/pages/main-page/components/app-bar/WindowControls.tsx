import { XMarkIcon, MinusIcon } from '@heroicons/react/24/solid';
import { Square2StackIcon } from '@heroicons/react/24/outline';

export function WindowControls(){
    return (
        <ul className='flex-1 flex flex-row-reverse'>
            <button className='hover:bg-red-500 px-3 transition duration-200'
                onClick={() => { window.api.close() }}>
                <XMarkIcon className='size-5 text-white'/>
            </button>
            <button className='hover:bg-gray-500 px-3.5 transition duration-200'
                onClick={() => { window.api.maximize() }}>
                <Square2StackIcon className='size-4 text-white rotate-90'/>
            </button>
            <button className='hover:bg-gray-500 px-3 transition duration-200'
                onClick={() => { window.api.minimize() }}>
                <MinusIcon className='size-5 text-white'/>
            </button>
        </ul>
    );
}
