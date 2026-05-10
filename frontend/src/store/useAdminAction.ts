import { create } from 'zustand';

interface ActionOptions {
    execute: () => Promise<void>;
    optimistic?: () => void;
    revert?: () => void;
    successMessage?: string;
    errorMessage?: string;
}

interface ConfirmDialogState {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    variant?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
    onCancel: () => void;
}

interface UndoQueueItem {
    id: string;
    title: string;
    message: string;
    options: ActionOptions;
    variant: 'danger' | 'warning' | 'info';
    confirmLabel: string;
    timeoutId: NodeJS.Timeout;
    onUndo: () => void;
}

interface AdminActionStore {
    confirmDialog: ConfirmDialogState | null;
    undoQueue: UndoQueueItem[];
    redoQueue: Omit<UndoQueueItem, 'timeoutId' | 'onUndo'>[];
    
    // Core function to trigger an action with safety checks
    requestAction: (
        dialogTitle: string,
        dialogMessage: string,
        options: ActionOptions,
        dialogVariant?: 'danger' | 'warning' | 'info',
        confirmLabel?: string
    ) => void;

    // Internal methods
    closeDialog: () => void;
    addUndoItem: (item: UndoQueueItem) => void;
    removeUndoItem: (id: string) => void;
    triggerUndo: (id?: string) => void;
    triggerRedo: () => void;
}

export const useAdminAction = create<AdminActionStore>((set, get) => ({
    confirmDialog: null,
    undoQueue: [],
    redoQueue: [],

    requestAction: (title, message, options, variant = 'warning', confirmLabel = 'Confirm') => {
        set({
            confirmDialog: {
                isOpen: true,
                title,
                message,
                variant,
                confirmLabel,
                onCancel: () => set({ confirmDialog: null }),
                onConfirm: () => {
                    set({ confirmDialog: null });
                    
                    // Clear redo queue on new action
                    set({ redoQueue: [] });
                    
                    // 1. Optimistic Update
                    if (options.optimistic) {
                        options.optimistic();
                    }

                    const actionId = Math.random().toString(36).substring(7);

                    // 2. Queue the execution (10 second delay)
                    const timeoutId = setTimeout(async () => {
                        get().removeUndoItem(actionId);
                        try {
                            await options.execute();
                            if (options.successMessage) {
                                window.dispatchEvent(new CustomEvent('global-toast', { detail: { message: options.successMessage, type: 'success' } }));
                            }
                        } catch (error: any) {
                            if (options.revert) options.revert();
                            if (options.errorMessage) {
                                window.dispatchEvent(new CustomEvent('global-toast', { detail: { message: options.errorMessage || error.message, type: 'error' } }));
                            }
                        }
                    }, 10000);

                    // 3. Add to Undo Queue
                    get().addUndoItem({
                        id: actionId,
                        title,
                        message: options.successMessage || 'Action completed',
                        options,
                        variant,
                        confirmLabel,
                        timeoutId,
                        onUndo: () => {
                            clearTimeout(timeoutId);
                            if (options.revert) options.revert();
                            
                            // Move to redo queue
                            set((state) => {
                                const item = state.undoQueue.find(i => i.id === actionId);
                                if (!item) return state;
                                
                                const redoItem = {
                                    id: item.id,
                                    title: item.title,
                                    message: item.message,
                                    options: item.options,
                                    variant: item.variant,
                                    confirmLabel: item.confirmLabel
                                };
                                
                                return {
                                    undoQueue: state.undoQueue.filter(i => i.id !== actionId),
                                    redoQueue: [...state.redoQueue, redoItem]
                                };
                            });
                            
                            window.dispatchEvent(new CustomEvent('global-toast', { detail: { message: 'Action undone.', type: 'info' } }));
                        }
                    });
                }
            }
        });
    },

    closeDialog: () => set({ confirmDialog: null }),
    
    addUndoItem: (item) => set((state) => ({ undoQueue: [...state.undoQueue, item] })),
    
    removeUndoItem: (id) => set((state) => ({ undoQueue: state.undoQueue.filter(i => i.id !== id) })),
    
    triggerUndo: (id) => {
        const queue = get().undoQueue;
        if (queue.length === 0) return;
        
        // Undo specific ID or the most recent one
        const item = id ? queue.find(i => i.id === id) : queue[queue.length - 1];
        if (item) {
            item.onUndo();
        }
    },
    
    triggerRedo: () => {
        const queue = get().redoQueue;
        if (queue.length === 0) return;
        
        // Get most recently undone item
        const itemToRedo = queue[queue.length - 1];
        
        // Remove it from redo queue
        set((state) => ({ redoQueue: state.redoQueue.filter(i => i.id !== itemToRedo.id) }));
        
        // Re-request the action using internal confirm override (we bypass the dialog since user pressed Ctrl+Y)
        // Wait, requestAction opens a dialog. We want to skip the dialog for Redo!
        
        // Re-execute optimistic
        if (itemToRedo.options.optimistic) {
            itemToRedo.options.optimistic();
        }
        
        const timeoutId = setTimeout(async () => {
            get().removeUndoItem(itemToRedo.id);
            try {
                await itemToRedo.options.execute();
                if (itemToRedo.options.successMessage) {
                    window.dispatchEvent(new CustomEvent('global-toast', { detail: { message: itemToRedo.options.successMessage, type: 'success' } }));
                }
            } catch (error: any) {
                if (itemToRedo.options.revert) itemToRedo.options.revert();
            }
        }, 10000);
        
        get().addUndoItem({
            ...itemToRedo,
            timeoutId,
            onUndo: () => {
                clearTimeout(timeoutId);
                if (itemToRedo.options.revert) itemToRedo.options.revert();
                set((state) => ({
                    undoQueue: state.undoQueue.filter(i => i.id !== itemToRedo.id),
                    redoQueue: [...state.redoQueue, itemToRedo]
                }));
                window.dispatchEvent(new CustomEvent('global-toast', { detail: { message: 'Action undone.', type: 'info' } }));
            }
        });
        
        window.dispatchEvent(new CustomEvent('global-toast', { detail: { message: 'Action redone.', type: 'success' } }));
    }
}));
