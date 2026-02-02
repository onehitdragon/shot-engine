import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import { useAppSelector } from "../../../../global-state/hooks";

export function AppLoading(){
    const loading = useAppSelector(state => state.appLoading.loading);
    const [timeTake, setTimeTake] = useState(0);
    const logs = useAppSelector(state => state.appLoading.logs);
    const containerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if(!loading) return;
        const cancel = setInterval(() => {
            setTimeTake(t => t + 1);
        }, 1000);
        return () => {
            setTimeTake(0);
            clearInterval(cancel);
        };
    }, [loading]);
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
                    <span className="text-white text-base">{timeTake}s</span>
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