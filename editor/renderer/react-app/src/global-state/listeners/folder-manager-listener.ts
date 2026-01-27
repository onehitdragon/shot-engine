import { syncImageMetaFiles } from "../../pages/main-page/helpers/folder-manager/folder-manager-helper";
import { startAppListening } from "../listenerMiddleware";
import { updateLoading } from "../slices/app-loading-slice";
import { updateDirectory } from "../slices/folder-manager-slice";
import { updateImports } from "../slices/image-import-slice";

startAppListening({
    actionCreator: updateDirectory,
    effect: async (action, api) => {
        const loading = api.getState().appLoading.loading;
        if(loading) return;
        api.dispatch(updateLoading({ loading: true }));
        console.log("call");

        try{
            const { directory } = action.payload;
            const images = await syncImageMetaFiles(directory, api.dispatch);
            api.dispatch(updateImports({
                imports: {
                    images
                }
            }));
        }
        catch(err){
            throw err;
        }
        finally{
            api.dispatch(updateLoading({ loading: false }));
            console.log("end call");
        }
    }
});
