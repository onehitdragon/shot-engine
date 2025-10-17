import { useMemo } from 'react';
import logoUrl from '../../../../assets/dragon_logo.svg';
import { useAppDispatch } from '../../../../global-state/hooks';
import { FileMenu } from './file-menu';
import { WindowControls } from './WindowControls';
import { loadProjectFolder } from '../../../../global-state/slices/project-slice';

export function AppBar(){
    const dispatch = useAppDispatch();
    const fileMenuItems = useMemo(() => {
        const fileMenuItems: React.ComponentProps<typeof FileMenu>["items"] = [
            {
                label: "File",
                options: [
                    {
                        optionLabel: "Open Folder",
                        shortcutLabel: "Ctrl + O",
                        click: async () => {
                            const path = await window.api.folder.open();
                            if(path) dispatch(loadProjectFolder({ folderPath: path }));
                        }
                    },
                    {
                        optionLabel: "Close Folder",
                        shortcutLabel: "Ctrl + K",
                        click: () => {}
                    },
                    {
                        optionLabel: "Exit",
                        shortcutLabel: "",
                        click: () => {}
                    }
                ]
            },
            {
                label: "Edit",
                options: [
                    {
                        optionLabel: "Undo",
                        shortcutLabel: "Ctrl + Z",
                        click: () => {}
                    },
                    {
                        optionLabel: "Redo",
                        shortcutLabel: "Ctrl + Y",
                        click: () => {}
                    }
                ]
            },
            {
                label: "Help",
                options: [
                    {
                        optionLabel: "Website",
                        shortcutLabel: "",
                        click: () => {}
                    },
                    {
                        optionLabel: "Learn more",
                        shortcutLabel: "",
                        click: () => {}
                    },
                    {
                        optionLabel: "About",
                        shortcutLabel: "",
                        click: () => {}
                    }
                ]
            }
        ];
        return fileMenuItems;
    }, []);

    return (
        <div className='bg-gray-800 h-8 flex'>
            <div className='flex-1 flex items-center'>
                <img src={logoUrl} className='size-6 mx-2.5'/>
                <FileMenu items={fileMenuItems}/>
            </div>
            <ul className='flex-1 flex items-center justify-center'>
                <div className='flex-1 py-1 flex justify-center rounded-md
                    bg-gray-700 border border-gray-600'>
                    <span className='text-white text-xs'>Project name</span>
                </div>
            </ul>
            <WindowControls />
        </div>
    );
}
