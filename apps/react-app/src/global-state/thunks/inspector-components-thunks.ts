import { createAsyncThunk, isAnyOf } from "@reduxjs/toolkit";
import type { Component } from "@shot-engine/types";
import { v4 as uuidv4 } from "uuid";
import type { AppDispatch, RootState } from "../store";
import { showInspector } from "../slices/inspector-slice";
import { cloneDeep } from "lodash";
import { selectComponents } from "../slices/inspector-components-slice";
import type { AppStartListening } from "../listenerMiddleware";

export const componentsInpectedThunk = createAsyncThunk
<
    {
        componentOuts: Component[]
    },
    {
        id: string,
        components: Component[],
        allowModify: boolean
    },
    {
        dispatch: AppDispatch,
        state: RootState
    }
>
(
    "inspectorComponents/componentsInpected",
    async ({ components }, { dispatch, rejectWithValue }) => {
        try{
            const componentOuts = components.map(c => cloneDeep(c));
            componentOuts.forEach(c => {
                c.id = uuidv4();
            });
            dispatch(showInspector({ inspector: {
                type: "components"
            } }));
            return {
                componentOuts
            }
        }
        catch(err){
            await window.api.showError(String(err));
            return rejectWithValue(err);
        }
    }
);
export const componentsChangedThunk = createAsyncThunk
<
    {
        id: string,
        components: Component[]
    },
    void,
    {
        dispatch: AppDispatch,
        state: RootState
    }
>
(
    "inspectorComponents/componentsChanged",
    async (_, { getState, rejectWithValue }) => {
        try{
            return {
                id: getState().inspectorComponents.id,
                components: selectComponents(getState())
            }
        }
        catch(err){
            await window.api.showError(String(err));
            return rejectWithValue(err);
        }
    }
);
export const componentUpdatedThunk = createAsyncThunk
<
    void,
    {
        component: Component
    },
    {
        dispatch: AppDispatch,
        state: RootState
    }
>
(
    "inspectorComponents/componentUpdated",
    async ({ }, { getState, rejectWithValue }) => {
        try{
            if(!getState().inspectorComponents.allowModify) throw "cant modify";
        }
        catch(err){
            await window.api.showError(String(err));
            return rejectWithValue(err);
        }
    }
);
export const componentAddedThunk = createAsyncThunk
<
    {
        componentOut: Component
    },
    {
        component: Component,
        unique?: boolean
    },
    {
        dispatch: AppDispatch,
        state: RootState
    }
>
(
    "inspectorComponents/componentAdded",
    async ({ component, unique }, { getState, rejectWithValue }) => {
        try{
            if(!getState().inspectorComponents.allowModify) throw "cant modify";
            if(unique){
                if(selectComponents(getState()).some(c => c.type === component.type)){
                    throw `component with type ${component.type} existed`;
                }
            }
            const componentOut = cloneDeep(component);
            componentOut.id = uuidv4();

            return {
                componentOut
            }
        }
        catch(err){
            await window.api.showError(String(err));
            return rejectWithValue(err);
        }
    }
);
const COMPONENT_TYPE_CANT_DELETE = new Set<Component["type"]>(["Transform", "Mesh"]);
export const componentRemovedThunk = createAsyncThunk
<
    void,
    {
        component: Component
    },
    {
        dispatch: AppDispatch,
        state: RootState
    }
>
(
    "inspectorComponents/componentRemoved",
    async ({ component }, { getState, rejectWithValue }) => {
        try{
            if(!getState().inspectorComponents.allowModify) throw "cant modify";
            if(COMPONENT_TYPE_CANT_DELETE.has(component.type)) throw "cant delete this component";
        }
        catch(err){
            await window.api.showError(String(err));
            return rejectWithValue(err);
        }
    }
);
export function inspectorComponentsListener(startListening: AppStartListening){
    startListening({
        matcher: isAnyOf(componentAddedThunk.fulfilled, componentUpdatedThunk.fulfilled,
            componentRemovedThunk.fulfilled
        ),
        effect: (_, { dispatch }) => {
            dispatch(componentsChangedThunk());
        }
    })
}
