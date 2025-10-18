import { BrowserWindow, dialog } from "electron";

async function showConfirmDialog(message: string) {
    const window = BrowserWindow.getFocusedWindow();
    if(!window) return false;
    const result = await dialog.showMessageBox(window, {
        message,
        type: 'question',
        buttons: ["Yes", "No"],
        defaultId: 1,
        cancelId: 1,
        title: 'Confirm'
    });
    return result.response === 0;
}
export { showConfirmDialog }