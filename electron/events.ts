// This is a simple event emitter to simulate Electron's IPC (Inter-Process Communication)
// The "main" process will use this to send events to the "renderer" process (the React app).

type Listener = (event: string, ...args: any[]) => void;

class EventEmitter {
    private listeners: Listener[] = [];

    subscribe(listener: Listener): () => void {
        this.listeners.push(listener);
        // Return an unsubscribe function
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    emit(event: string, ...args: any[]) {
        this.listeners.forEach(listener => {
            try {
                listener(event, ...args);
            } catch (e) {
                console.error(`Error in event listener for ${event}:`, e);
            }
        });
    }
}

// This simulates the ipcMain module in Electron's main process.
export const ipcMain = new EventEmitter();
