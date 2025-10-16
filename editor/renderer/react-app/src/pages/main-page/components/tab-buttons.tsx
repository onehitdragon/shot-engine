export function ActivedTabButton({ Icon, label }: { Icon: React.ElementType, label: string }){
    return (
        <button className='flex items-center text-white bg-gray-500 py-1 px-3 rounded-t-sm'>
            <Icon className='size-4 mr-1'/>
            <span className='text-sm'>{label}</span>
        </button>
    );
}
export function DectivedTabButton(
    { Icon, label, click }: { Icon: React.ElementType, label: string, click: () => void }
){
    return (
        <button className='flex items-center text-white hover:opacity-70 py-1 px-3 rounded-t-sm
            hover:cursor-pointer transition-all' onClick={click}>
            <Icon className='size-4 mr-1'/>
            <span className='text-sm'>{label}</span>
        </button>
    );
}
