export const GameMode = {
    PICKING: 'PICKING',
    INBOUND: 'INBOUND'
} as const;

export type GameModeType = typeof GameMode[keyof typeof GameMode];

export interface Slot {
    id: string; // e.g., "A-01-1"
    x: number;  // Tile X
    y: number;  // Tile Y
    zone: string;
    occupied: boolean;
    itemType?: string;
    quantity: number;
}

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

export interface RoundConfig {
    id: string;
    phases: GameModeType[];
    timeLimit: number;
}

export interface RoundState {
    config: RoundConfig;
    currentPhaseIndex: number;
    score: number;
    isFinished: boolean;
}
