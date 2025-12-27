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

    constructor() {
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
        this.currentOrder = {
            id: `ORD-${Math.floor(Math.random() * 1000)}`,
            items: [
                { id: '1', itemType: 'Red Box', quantity: 1, picked: 0, slotId: 'A-01-1' },
                { id: '2', itemType: 'Blue Box', quantity: 1, picked: 0, slotId: 'B-01-3' }
            ],
            status: 'PENDING'
        };
        this.currentInboundTasks = [];
    }

    private generateInboundTasks() {
        this.currentInboundTasks = [
            { itemType: 'Green Box', targetSlotId: 'A-01-5', isReceived: false, isCompleted: false },
            { itemType: 'Yellow Box', targetSlotId: 'B-01-6', isReceived: false, isCompleted: false }
        ];
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
            task.isCompleted = true;
            // Remove from inventory
            const index = this.inventory.indexOf(task.itemType);
            if (index > -1) {
                this.inventory.splice(index, 1);
            }
            return true;
        }
        return false;
    }

    pickItem(slotId: string): boolean {
        if (!this.currentOrder || !this.canPickItem()) return false;

        const itemToPick = this.currentOrder.items.find(item => item.slotId === slotId && item.picked < item.quantity);

        if (itemToPick) {
            itemToPick.picked++;
            this.inventory.push(itemToPick.itemType);

            // Check if all items in order are picked
            const allPicked = this.currentOrder.items.every(item => item.picked === item.quantity);
            if (allPicked) {
                this.currentOrder.status = 'PACKING';
            }
            return true;
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
