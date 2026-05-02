import { useAppDispatch, useAppSelector } from "../../../../global-state/hooks";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/solid";
import { hideDialog } from "../../../../global-state/slices/app-confirm-dialog-slice";

export function AppConfirmDialog(){
    const showing = useAppSelector(state => state.appConfirmDialog.showing);
    const content = useAppSelector(state => state.appConfirmDialog.content);
    const yesCallback = useAppSelector(state => state.appConfirmDialog.yesCallback);
    const dispatch = useAppDispatch()
    const yesHandle = () => {
        yesCallback?.();
        dispatch(hideDialog());
    }
    const noHandle = () => {
        dispatch(hideDialog());
    }

    return (
        showing &&
        <div className="absolute w-full h-full bg-black/30 flex items-center justify-center">
            <div className="overflow-hidden w-96 flex flex-col">
                <div className="flex justify-between items-center bg-slate-500 rounded-t-md px-2 py-1">
                    <span className="text-white text-base">{content}</span>
                    <QuestionMarkCircleIcon className="size-5 text-white"/>
                </div>
                <div className="flex flex-row-reverse gap-1 p-2 bg-slate-600 rounded-b-md">
                    <button className="px-2 py-1 rounded bg-green-500 text-white text-sm cursor-pointer
                        hover:opacity-80 transition" onClick={yesHandle} autoFocus>
                        Yes
                    </button>
                    <button className="px-2 py-1 rounded bg-red-500 text-white text-sm cursor-pointer
                        hover:opacity-80 transition" onClick={noHandle}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}