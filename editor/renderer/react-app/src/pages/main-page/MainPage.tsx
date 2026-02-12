import { InspectorTab } from './components/inspector-tab/InspectorTab';
import { ProjectTab } from './components/project-tab/ProjectTab';
import { ResourceManagerTab } from './components/resource-tab/ResourceManagerTab';
import { SceneManagerTab } from './components/scene-manager-tab/SceneManagerTab';
import { SceneTab } from './components/scene-tab/SceneTab';
import { ActivedTabButton, DectivedTabButton } from './components/tab-buttons';
import { TabManager } from './components/TabManager';
import { CommandLineIcon, InformationCircleIcon, Bars4Icon, Square3Stack3DIcon,
    BookOpenIcon,
    BeakerIcon
} from '@heroicons/react/24/solid';

const sceneManagerTabs: React.ComponentProps<typeof TabManager>["tabs"] = [
    {
        ActivedButton: () => <ActivedTabButton Icon={Bars4Icon} label='Hierarchy'/>,
        DectivedButton: ({ click }) => <DectivedTabButton Icon={Bars4Icon} label='Hierarchy' click={click}/>,
        Tab: () => <SceneManagerTab />
    }
];
const sceneTabs: React.ComponentProps<typeof TabManager>["tabs"] = [
    {
        ActivedButton: () => <ActivedTabButton Icon={Square3Stack3DIcon} label='Scene'/>,
        DectivedButton: ({ click }) => <DectivedTabButton Icon={Square3Stack3DIcon} label='Scene' click={click}/>,
        Tab: () => <SceneTab />
    }
];
const inspectorTabs: React.ComponentProps<typeof TabManager>["tabs"] = [
    {
        ActivedButton: () => <ActivedTabButton Icon={InformationCircleIcon} label='Inspector'/>,
        DectivedButton: ({ click }) => <DectivedTabButton Icon={InformationCircleIcon} label='Inspector' click={click}/>,
        Tab: () => <InspectorTab />
    }
];
const projectTabs: React.ComponentProps<typeof TabManager>["tabs"] = [
    {
        ActivedButton: () => <ActivedTabButton Icon={BookOpenIcon} label='Project'/>,
        DectivedButton: ({ click }) => <DectivedTabButton Icon={BookOpenIcon} label='Project' click={click}/>,
        Tab: () => <ProjectTab />
    },
    {
        ActivedButton: () => <ActivedTabButton Icon={BeakerIcon} label='Resource'/>,
        DectivedButton: ({ click }) => <DectivedTabButton Icon={BeakerIcon} label='Resource' click={click}/>,
        Tab: () => <ResourceManagerTab />
    },
    {
        ActivedButton: () => <ActivedTabButton Icon={CommandLineIcon} label='Console'/>,
        DectivedButton: ({ click }) => <DectivedTabButton Icon={CommandLineIcon} label='Console' click={click}/>,
        Tab: () => <div></div>
    },
];
export function MainPage(){
    return (
        <div className="flex-1 flex overflow-hidden">
            <div className="flex-2 flex flex-col overflow-hidden">
                <div className="flex-1 flex overflow-hidden">
                    <div className='flex-2 flex overflow-hidden'>
                        <TabManager tabs={sceneManagerTabs}/>
                    </div>
                    <div className='flex-4 flex overflow-hidden'>
                        <TabManager tabs={sceneTabs}/>
                    </div>
                </div>
                <TabManager tabs={projectTabs}/>
            </div>
            <div className="flex-1 flex overflow-hidden">
                <TabManager tabs={inspectorTabs}/>
            </div>
        </div>
    );
}
