import { SlottingManager } from '../managers/SlottingManager';
import { WarehouseManager } from '../managers/WarehouseManager';
import { GameMode } from '../types';
import { Player } from '../entities/Player';
import { DialogueHUD } from '../ui/DialogueHUD';
import { TaskHUD } from '../ui/TaskHUD';
import { StatusHUD } from '../ui/StatusHUD';

export class GameScene extends Phaser.Scene {
    private player!: Player;
    private interactKey!: Phaser.Input.Keyboard.Key;
    public slottingManager: SlottingManager;
    public warehouseManager: WarehouseManager;

    // HUDs
    private dialogueHUD!: DialogueHUD;
    private taskHUD!: TaskHUD;
    private statusHUD!: StatusHUD;

    private rackLabels: Map<string, Phaser.GameObjects.Text> = new Map();
    public timeLeft: number = 0;
    private timerEvent?: Phaser.Time.TimerEvent;
    public gameStarted: boolean = false;
    private startOverlay?: Phaser.GameObjects.Container;

    private readonly tileSize = 32;
    private readonly shippingZonePos = { x: 21, y: 0, width: 4, height: 4 };
    public readonly receivingZonePos = { x: 0, y: 15, width: 4, height: 3 };

    constructor() {
        super('GameScene');
        this.slottingManager = new SlottingManager();
        this.warehouseManager = new WarehouseManager(this.slottingManager);
    }

    preload() {
        const graphics = this.add.graphics();
        graphics.fillStyle(0xff0000);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('player_placeholder', 32, 32);
        graphics.destroy();
    }

    create() {
        this.setupBackground();
        this.setupZones();
        this.setupRacks();
        this.setupPlayer();
        this.setupHUDs();
        this.setupInput();

        this.dialogueHUD.show("Welcome to the Warehouse! \nFollow the Pick List on the right.");
        this.createStartOverlay();
    }

    private setupBackground() {
        const gridGraphics = this.add.graphics();
        gridGraphics.lineStyle(1, 0x34495e, 0.5);
        for (let x = 0; x < 800; x += this.tileSize) {
            gridGraphics.moveTo(x, 0);
            gridGraphics.lineTo(x, 600);
        }
        for (let y = 0; y < 600; y += this.tileSize) {
            gridGraphics.moveTo(0, y);
            gridGraphics.lineTo(800, y);
        }
        gridGraphics.strokePath();

        const sidebar = this.add.rectangle(800, 0, 224, 600, 0x2c3e50).setOrigin(0);
        sidebar.setStrokeStyle(2, 0x34495e);
    }

    private setupZones() {
        // Shipping Zone
        const shippingZone = this.add.rectangle(
            this.shippingZonePos.x * this.tileSize,
            this.shippingZonePos.y * this.tileSize,
            this.shippingZonePos.width * this.tileSize,
            this.shippingZonePos.height * this.tileSize,
            0x3498db, 0.4
        ).setOrigin(0);
        shippingZone.setStrokeStyle(2, 0x2980b9);
        this.add.text(shippingZone.x + 10, shippingZone.y + 10, "SHIPPING ZONE", { fontSize: '12px', color: '#fff' });

        // Receiving Zone
        const receivingZone = this.add.rectangle(
            this.receivingZonePos.x * this.tileSize,
            this.receivingZonePos.y * this.tileSize,
            this.receivingZonePos.width * this.tileSize,
            this.receivingZonePos.height * this.tileSize,
            0x2ecc71, 0.4
        ).setOrigin(0);
        receivingZone.setStrokeStyle(2, 0x27ae60);
        this.add.text(receivingZone.x + 10, receivingZone.y + 10, "RECEIVING DOCK", { fontSize: '12px', color: '#fff' });
    }

    private setupRacks() {
        const rackGraphics = this.add.graphics();
        rackGraphics.fillStyle(0x7f8c8d);
        this.slottingManager.getAllSlots().forEach(slot => {
            rackGraphics.fillRect(slot.x * this.tileSize, slot.y * this.tileSize, this.tileSize, this.tileSize);
            const text = this.add.text(slot.x * this.tileSize, slot.y * this.tileSize, '', { fontSize: '8px', color: '#000' });
            this.rackLabels.set(slot.id, text);
        });
        this.updateRackVisuals();
    }

    private setupPlayer() {
        this.player = new Player(this, 400, 300);
    }

    private setupHUDs() {
        this.dialogueHUD = new DialogueHUD(this);
        this.taskHUD = new TaskHUD(this);
        this.statusHUD = new StatusHUD(this);
    }

    private setupInput() {
        if (this.input.keyboard) {
            this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        }
    }

    private createStartOverlay() {
        const bg = this.add.rectangle(400, 300, 400, 200, 0x000000, 0.8).setOrigin(0.5);
        const text = this.add.text(400, 300, 'WAREHOUSE SIM\n\nPRESS SPACE TO START', {
            fontSize: '28px',
            color: '#fff',
            align: 'center'
        }).setOrigin(0.5);

        this.startOverlay = this.add.container(0, 0, [bg, text]).setDepth(500);

        this.interactKey.once('down', () => {
            this.startOverlay?.destroy();
            this.gameStarted = true;
            this.startNewRound();
        });
    }

    private startNewRound() {
        this.warehouseManager.startRound();
        const state = this.warehouseManager.getRoundState();
        if (state) {
            this.timeLeft = state.config.timeLimit;

            if (this.timerEvent) this.timerEvent.destroy();
            this.timerEvent = this.time.addEvent({
                delay: 1000,
                callback: this.onTimerTick,
                callbackScope: this,
                loop: true
            });
        }
        this.player.resetPosition(400, 300);
        this.taskHUD.update();
        this.updateRackVisuals();
    }

    private onTimerTick() {
        if (this.timeLeft > 0) {
            this.timeLeft--;
            this.statusHUD.update();
        } else {
            this.endRound();
        }
    }

    private endRound() {
        if (this.timerEvent) this.timerEvent.destroy();
        this.player.setVelocity(0);

        const state = this.warehouseManager.getRoundState();
        if (state) {
            const timeBonus = state.isFinished ? this.warehouseManager.calculateTimeBonus(this.timeLeft) : 0;
            const totalScore = state.score + timeBonus;

            const message = state.isFinished ?
                `Round Complete!\nBase Score: ${state.score}\nTime Bonus: ${timeBonus}\nTotal: ${totalScore}` :
                `Time Up!\nFinal Score: ${state.score}`;

            this.showRoundSummary(message);
        }
    }

    private showRoundSummary(message: string) {
        this.dialogueHUD.show(message, false);

        const choiceText = this.add.text(400, 300, 'PRESS [R] TO REPLAY\nPRESS [N] FOR NEW ROUND', {
            fontSize: '24px',
            color: '#fff',
            backgroundColor: '#000',
            padding: { x: 20, y: 15 },
            align: 'center'
        }).setOrigin(0.5).setDepth(300);

        const restartKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        const nextKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.N);

        restartKey?.once('down', () => {
            choiceText.destroy();
            this.dialogueHUD.hide();
            this.warehouseManager.restartRound();
            this.resumeGameAfterChoice();
        });

        nextKey?.once('down', () => {
            choiceText.destroy();
            this.dialogueHUD.hide();
            this.startNewRound();
        });
    }

    private resumeGameAfterChoice() {
        const state = this.warehouseManager.getRoundState();
        if (state) {
            this.timeLeft = state.config.timeLimit;
            this.statusHUD.update();
            this.taskHUD.update();
            this.updateRackVisuals();
            this.player.resetPosition(400, 300);

            if (this.timerEvent) this.timerEvent.destroy();
            this.timerEvent = this.time.addEvent({
                delay: 1000,
                callback: this.onTimerTick,
                callbackScope: this,
                loop: true
            });
        }
    }

    update() {
        if (!this.player || !this.gameStarted) return;

        const state = this.warehouseManager.getRoundState();
        if (state?.isFinished || this.timeLeft <= 0) {
            this.player.setVelocity(0);
            return;
        }

        this.player.update();
        this.handleInteractions();
        this.statusHUD.update();
        this.taskHUD.update();

        if (state?.isFinished) {
            this.endRound();
        }
    }

    private handleInteractions() {
        const tileX = Math.floor(this.player.x / this.tileSize);
        const tileY = Math.floor(this.player.y / this.tileSize);
        const slot = this.slottingManager.getSlotAt(tileX, tileY);

        if (slot) {
            this.statusHUD.setLocation(`Location: ${slot.id} (${slot.zone} Zone)`);

            if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
                this.handleSlotInteraction(slot);
            }
        } else {
            this.statusHUD.setLocation(`Location: x:${tileX} y:${tileY}`);

            const isInShipping = (
                tileX >= this.shippingZonePos.x &&
                tileX < this.shippingZonePos.x + this.shippingZonePos.width &&
                tileY >= this.shippingZonePos.y &&
                tileY < this.shippingZonePos.y + this.shippingZonePos.height
            );

            const isInReceiving = (
                tileX >= this.receivingZonePos.x &&
                tileX < this.receivingZonePos.x + this.receivingZonePos.width &&
                tileY >= this.receivingZonePos.y &&
                tileY < this.receivingZonePos.y + this.receivingZonePos.height
            );

            if (isInShipping) {
                this.statusHUD.setLocation("Location: SHIPPING ZONE");
                if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
                    this.handleShippingInteraction();
                }
            } else if (isInReceiving) {
                this.statusHUD.setLocation("Location: RECEIVING DOCK");
                if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
                    this.handleReceivingInteraction();
                }
            }
        }
    }

    private handleSlotInteraction(slot: any) {
        const mode = this.warehouseManager.getMode();
        if (mode === GameMode.PICKING) {
            if (this.warehouseManager.pickItem(slot.id)) {
                this.player.createFollower();
                this.cameras.main.flash(200, 100, 255, 100);
                this.dialogueHUD.show(`Picked up from ${slot.id}!`);

                const order = this.warehouseManager.getCurrentOrder();
                if (order?.status === 'PACKING') {
                    this.dialogueHUD.show("All items picked! \nGo to the Shipping Area (Top Right).");
                }
                this.updateRackVisuals();
            }
        } else {
            if (this.warehouseManager.putAwayItem(slot.id)) {
                this.player.removeFollower();
                this.cameras.main.flash(200, 100, 255, 100);
                this.dialogueHUD.show(`Placed item in ${slot.id}!`);

                if (this.warehouseManager.allInboundCompleted()) {
                    this.dialogueHUD.show("All inbound tasks complete! \nSwitching to Picking mode...");
                    this.time.delayedCall(2000, () => {
                        this.warehouseManager.switchMode(GameMode.PICKING);
                        this.updateRackVisuals();
                    });
                }
                this.updateRackVisuals();
            }
        }
    }

    private handleShippingInteraction() {
        if (this.warehouseManager.getMode() === GameMode.PICKING) {
            if (this.warehouseManager.completeOrder()) {
                this.dialogueHUD.show("Order Shipped! \nSwitching to Inbound mode...");
                this.player.clearFollowers();
                this.cameras.main.shake(500, 0.01);

                this.time.delayedCall(2000, () => {
                    this.warehouseManager.switchMode(GameMode.INBOUND);
                });
            } else {
                const order = this.warehouseManager.getCurrentOrder();
                if (order?.status === 'PENDING' || order?.status === 'PICKING') {
                    this.dialogueHUD.show("Order is incomplete! \nPick all items first.");
                }
            }
        }
    }

    private handleReceivingInteraction() {
        if (this.warehouseManager.getMode() === GameMode.INBOUND) {
            const task = this.warehouseManager.receiveItemFromDock();
            if (task) {
                this.player.createFollower();
                this.cameras.main.flash(200, 255, 255, 100);
                this.dialogueHUD.show(`Received ${task.itemType}! \nTake it to ${task.targetSlotId}.`);
            }
        }
    }

    private updateRackVisuals() {
        this.slottingManager.getAllSlots().forEach(slot => {
            const text = this.rackLabels.get(slot.id);
            if (text) {
                const itemTypeAbbr = slot.itemType ? slot.itemType[0] : '';
                text.setText(`${slot.id}\n${itemTypeAbbr}(${slot.quantity})`);
            }
        });
    }
}
