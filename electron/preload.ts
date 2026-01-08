// This file simulates an Electron preload script.
// It creates a bridge between the "main process" (backend logic) and the "renderer process" (React UI).
// All backend functionality is exposed securely through the `window.electron` object.

import * as mainProcess from './main';
import { ipcMain } from './events';

const api = {
    getInitialData: mainProcess.getInitialData,
    auth: mainProcess.authService,
    complaint: mainProcess.complaintService,
    customer: mainProcess.customerService,
    product: mainProcess.productService,
    branch: mainProcess.branchService,
    followUpTask: mainProcess.followUpTaskService,
    dailyInquiry: mainProcess.dailyInquiryService,
    dailyFeedbackTask: mainProcess.dailyFeedbackTaskService,
    user: mainProcess.userService,
    activityLog: mainProcess.activityLogService,
    settings: mainProcess.settingsService,

    /**
     * Listens for events sent from the main process.
     * @param callback The function to call when an event is received.
     * @returns An unsubscribe function.
     */
    onUpdate: (callback: (event: string, payload: any) => void): (() => void) => {
        const subscription = (event: string, ...args: any[]) => {
            callback(event, args[0]); // Assuming a single payload for simplicity
        };
        return ipcMain.subscribe(subscription);
    }
};

// Expose the API to the renderer process
window.electron = api;

// Notify the renderer process that the API is ready
document.dispatchEvent(new Event('electronApiReady'));

// This export is only for TypeScript type inference.
// It allows us to get the type of the API object in other files.
export type ElectronApi = typeof api;