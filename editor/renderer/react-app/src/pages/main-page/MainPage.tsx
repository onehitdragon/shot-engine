import { FolderManager } from './components/folder-manager/FolderManager';
import { ActivedTabButton, DectivedTabButton } from './components/tab-buttons';
import { TabManager } from './components/TabManager';
import { CommandLineIcon, InformationCircleIcon, Bars4Icon, Square3Stack3DIcon,
    BookOpenIcon
} from '@heroicons/react/24/solid';

const objectTabs: React.ComponentProps<typeof TabManager>["tabs"] = [
    {
        ActivedButton: () => <ActivedTabButton Icon={Bars4Icon} label='Hierarchy'/>,
        DectivedButton: ({ click }) => <DectivedTabButton Icon={Bars4Icon} label='Hierarchy' click={click}/>,
        Tab: () => <div></div>
    }
];
const sceneTabs: React.ComponentProps<typeof TabManager>["tabs"] = [
    {
        ActivedButton: () => <ActivedTabButton Icon={Square3Stack3DIcon} label='Scene'/>,
        DectivedButton: ({ click }) => <DectivedTabButton Icon={Square3Stack3DIcon} label='Scene' click={click}/>,
        Tab: () => <div></div>
    }
];
const propertyTabs: React.ComponentProps<typeof TabManager>["tabs"] = [
    {
        ActivedButton: () => <ActivedTabButton Icon={InformationCircleIcon} label='Property'/>,
        DectivedButton: ({ click }) => <DectivedTabButton Icon={InformationCircleIcon} label='Property' click={click}/>,
        Tab: () => <div></div>
    }
];
const projectTabs: React.ComponentProps<typeof TabManager>["tabs"] = [
    {
        ActivedButton: () => <ActivedTabButton Icon={BookOpenIcon} label='Project'/>,
        DectivedButton: ({ click }) => <DectivedTabButton Icon={BookOpenIcon} label='Project' click={click}/>,
        Tab: () => <ProjectTab />
    },
    {
        ActivedButton: () => <ActivedTabButton Icon={CommandLineIcon} label='Console'/>,
        DectivedButton: ({ click }) => <DectivedTabButton Icon={CommandLineIcon} label='Console' click={click}/>,
        Tab: () => <div></div>
    }
];
export function MainPage(){
    return (
        <div className="flex-1 flex">
            <div className="flex-2 flex flex-col">
                <div className="flex-2 flex">
                    <div className='flex-2 flex'>
                        <TabManager tabs={objectTabs}/>
                    </div>
                    <div className='flex-4 flex'>
                        <TabManager tabs={sceneTabs}/>
                    </div>
                </div>
                <TabManager tabs={projectTabs}/>
            </div>
            <div className="flex-1 flex">
                <TabManager tabs={propertyTabs}/>
            </div>
        </div>
    );
}
function ProjectTab(){
    return (
        <FolderManager />
    );
}

