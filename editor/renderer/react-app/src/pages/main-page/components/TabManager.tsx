import { useState } from "react";

type TabManagerProps = {
    tabs: {
        ActivedButton: React.ElementType,
        DectivedButton: React.ElementType<{click: () => void}>,
        Tab: React.ElementType
    }[]
}
export function TabManager(props: TabManagerProps){
    const { tabs } = props;
    const [activedTabIndex, setActivedTabIndex] = useState(0);
    const activedTab = activedTabIndex < 0 || activedTabIndex >= tabs.length ? null : tabs[activedTabIndex];

    return (
        <div className="flex-1 flex flex-col bg-gray-800 p-0.5">
            <div className='flex'>
                {
                    tabs.map(
                        (tab, idx) => tab === activedTab ?
                        <tab.ActivedButton key={idx} /> : 
                        <tab.DectivedButton key={idx} click={() => { setActivedTabIndex(idx) }}/>
                    )
                }
            </div>
            {
                activedTab
                &&
                <div className='bg-gray-500 h-full w-full rounded-b-sm flex'>
                    {
                        <activedTab.Tab />
                    }
                </div>
            }
        </div>
    );
}