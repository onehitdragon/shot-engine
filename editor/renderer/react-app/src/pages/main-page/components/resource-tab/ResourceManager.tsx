import { useAppSelector } from "../../../../global-state/hooks";
import { selectResources } from "../../../../global-state/slices/resource-manager-slice";
import { WebglResourceManager } from "../../helpers/resource-manager-helper/WebglResourceManager";

export function ResourceManager(){
    const resources = useAppSelector(state => selectResources(state));
    return <div className='flex-1 flex overflow-hidden'>
        <div className="flex flex-col flex-1 overflow-auto scrollbar-thin p-1">
            <p className="select-none text-white text-xl font-bold">Resource</p>
            <ul className="flex flex-col gap-3">
                {
                    resources.map(resource => {
                        return (
                            <li key={resource.guid} className="flex flex-col">
                                <p className="select-none text-white">
                                    guid: {resource.guid}
                                </p>
                                <p className="select-none text-white">
                                    fileName: {resource.fileName}
                                </p>
                                <p className="select-none text-white">
                                    usedCount: {resource.usedCount}
                                </p>
                            </li>
                        );
                    })
                }
            </ul>
            <h2 className="select-none text-white text-xl font-bold">Webgl Resource</h2>
            <ul className="flex-1 flex flex-col gap-3">
                <li className="flex flex-col">
                    <p className="select-none text-white">
                        meshCount: {WebglResourceManager.getInstance().info().meshCount}
                    </p>
                    <p className="select-none text-white">
                        textureCount: {WebglResourceManager.getInstance().info().textureCount}
                    </p>
                </li>
            </ul>
        </div>
    </div>;
}