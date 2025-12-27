import { SlottingManager } from './SlottingManager';
import type { Slot } from './SlottingManager';

export const GameMode = {
    PICKING: 'PICKING',
    INBOUND: 'INBOUND'
} as const;

export type GameModeType = typeof GameMode[keyof typeof GameMode];

export interface OrderItem {
    id: string;
    itemType: string;
    quantity: number;
    picked: number;
    slotId: string;
}

export interface Order {
    id: string;
    items: OrderItem[];
    status: 'PENDING' | 'PICKING' | 'PACKING' | 'SHIPPED';
}

export interface InboundTask {
    itemType: string;
    targetSlotId: string;
    isReceived: boolean;
    isCompleted: boolean;
}

export class WarehouseManager {
    private currentOrder: Order | null = null;
    private currentInboundTasks: InboundTask[] = [];
    private inventory: string[] = [];
    private readonly maxInventory = 3;
    private mode: GameModeType = GameMode.PICKING;
    private slottingManager: SlottingManager;

    constructor(slottingManager: SlottingManager) {
        this.slottingManager = slottingManager;
        this.generateNewOrder();
    }

    getMode(): GameModeType {
        return this.mode;
    }

    switchMode(mode: GameModeType) {
        this.mode = mode;
        if (mode === GameMode.INBOUND) {
            this.generateInboundTasks();
        } else {
            this.generateNewOrder();
        }
    }

    private generateNewOrder() {
        const allSlots = this.slottingManager.getAllSlots().filter((s: Slot) => s.quantity > 0);
        if (allSlots.length === 0) {
            // Fallback if no stock exists (though SlottingManager should have initialized some)
            this.currentOrder = null;
            return;
        }

        // Picking 1-2 random slots that have items
        const numItems = Math.min(allSlots.length, Math.floor(Math.random() * 2) + 1);
        const selectedSlots: Slot[] = [];
        const slotsCopy = [...allSlots];

        for (let i = 0; i < numItems; i++) {
            const randomIndex = Math.floor(Math.random() * slotsCopy.length);
            selectedSlots.push(slotsCopy.splice(randomIndex, 1)[0]);
        }

        this.currentOrder = {
            id: `ORD-${Math.floor(Math.random() * 1000)}`,
            items: selectedSlots.map((slot: Slot, index: number) => ({
                id: (index + 1).toString(),
                itemType: slot.itemType!,
                quantity: 1, // Start with single item picking for simplicity
                picked: 0,
                slotId: slot.id
            })),
            status: 'PENDING'
        };
        this.currentInboundTasks = [];
    }

    private generateInboundTasks() {
        const allSlots = this.slottingManager.getAllSlots();
        // Inbound can go to empty slots or slots with space (assume max 15 per slot)
        const availableSlots = allSlots.filter((s: Slot) => s.quantity < 15);

        if (availableSlots.length === 0) {
            this.currentInboundTasks = [];
            return;
        }

        const numTasks = Math.floor(Math.random() * 2) + 1;
        const selectedSlots: Slot[] = [];
        const slotsCopy = [...availableSlots];

        for (let i = 0; i < numTasks; i++) {
            const randomIndex = Math.floor(Math.random() * slotsCopy.length);
            selectedSlots.push(slotsCopy.splice(randomIndex, 1)[0]);
        }

        const itemTypes = ['Red Box', 'Blue Box', 'Green Box', 'Yellow Box'];
        this.currentInboundTasks = selectedSlots.map((slot: Slot) => ({
            itemType: slot.itemType || itemTypes[Math.floor(Math.random() * itemTypes.length)],
            targetSlotId: slot.id,
            isReceived: false,
            isCompleted: false
        }));
        this.currentOrder = null;
    }

    getCurrentOrder(): Order | null {
        return this.currentOrder;
    }

    getInboundTasks(): InboundTask[] {
        return this.currentInboundTasks;
    }

    getInventory(): string[] {
        return this.inventory;
    }

    canPickItem(): boolean {
        return this.inventory.length < this.maxInventory;
    }

    receiveItemFromDock(): InboundTask | null {
        if (this.mode !== GameMode.INBOUND || !this.canPickItem()) return null;

        const nextTask = this.currentInboundTasks.find(t => !t.isReceived);
        if (nextTask) {
            nextTask.isReceived = true;
            this.inventory.push(nextTask.itemType);
            return nextTask;
        }
        return null;
    }

    putAwayItem(slotId: string): boolean {
        if (this.mode !== GameMode.INBOUND) return false;

        const task = this.currentInboundTasks.find(t => t.targetSlotId === slotId && t.isReceived && !t.isCompleted);
        if (task && this.inventory.includes(task.itemType)) {
            if (this.slottingManager.addStock(slotId, task.itemType, 1)) {
                task.isCompleted = true;
                // Remove from inventory
                const index = this.inventory.indexOf(task.itemType);
                if (index > -1) {
                    this.inventory.splice(index, 1);
                }
                return true;
            }
        }
        return false;
    }

    pickItem(slotId: string): boolean {
        if (!this.currentOrder || !this.canPickItem()) return false;

        const itemToPick = this.currentOrder.items.find(item => item.slotId === slotId && item.picked < item.quantity);

        if (itemToPick) {
            if (this.slottingManager.removeStock(slotId, 1)) {
                itemToPick.picked++;
                this.inventory.push(itemToPick.itemType);

                // Check if all items in order are picked
                const allPicked = this.currentOrder.items.every(item => item.picked === item.quantity);
                if (allPicked) {
                    this.currentOrder.status = 'PACKING';
                }
                return true;
            }
        }
        return false;
    }

    clearInventory() {
        this.inventory = [];
    }

    completeOrder(): boolean {
        if (this.currentOrder && this.currentOrder.status === 'PACKING') {
            this.currentOrder.status = 'SHIPPED';
            this.clearInventory();
            return true;
        }
        return false;
    }

    allInboundCompleted(): boolean {
        return this.currentInboundTasks.length > 0 && this.currentInboundTasks.every(t => t.isCompleted);
    }
}
