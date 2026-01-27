import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef } from "react";
import { useAppSelector } from "../../../../global-state/hooks";

export function AppLoading(){
    const loading = useAppSelector(state => state.appLoading.loading);
    const logs = useAppSelector(state => state.appLoading.logs);
    const containerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const el = containerRef.current;
        if(!el) return;
        el.scrollTop = el.scrollHeight;
    }, [logs]);
    
    return (
        loading &&
        <div className="absolute w-full h-full bg-black/30 flex items-center justify-center">
            <div className="overflow-hidden h-72 w-96 flex flex-col">
                <div className="flex justify-between items-center bg-slate-500 rounded-t-md px-2 py-1">
                    <span className="text-white text-base">Loading...</span>
                    <ArrowPathIcon className="size-5 animate-spin text-white"/>
                </div>
                <div ref={containerRef} className="flex flex-1 flex-col px-2 py-1 bg-slate-600 rounded-b-md
                    overflow-auto scrollbar-thin">
                    {
                        logs.map(
                            (log, index) =>
                            <span key={index} className="text-slate-200 text-sm">{log}</span>
                        )
                    }
                </div>
            </div>
        </div>
    );
}