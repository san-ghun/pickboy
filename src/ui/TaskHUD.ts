import { BaseHUD } from './BaseHUD';
import type { GameScene } from '../scenes/GameScene';
import { GameMode } from '../types';

export class TaskHUD extends BaseHUD {
    private orderText: Phaser.GameObjects.Text;
    private sparkles: Phaser.GameObjects.Group;

    constructor(scene: GameScene) {
        super(scene);

        this.container.setPosition(810, 60);

        this.orderText = scene.add.text(0, 0, 'Pick List:\n- ', {
            color: '#00ff00',
            fontSize: '14px',
            wordWrap: { width: 204 }
        });

        this.container.add(this.orderText);
        this.sparkles = scene.add.group();
    }

    public update(): void {
        const warehouseManager = (this.scene as any).warehouseManager;
        const slottingManager = (this.scene as any).slottingManager;
        const mode = warehouseManager.getMode();

        if (mode === GameMode.PICKING) {
            const order = warehouseManager.getCurrentOrder();
            if (order) {
                let text = `Order: ${order.id}\nStatus: ${order.status}\n\nTasks (PICK):\n`;

                this.sparkles.clear(true, true);

                order.items.forEach((item: any) => {
                    const isPicked = item.picked >= item.quantity;
                    const check = isPicked ? 'X' : ' ';
                    text += `[${check}] ${item.itemType} (${item.slotId})\n`;

                    if (!isPicked) {
                        const slot = slottingManager.getSlotById(item.slotId);
                        if (slot) {
                            this.createSparkle(slot.x * 32 + 16, slot.y * 32 + 16);
                        }
                    }
                });
                this.orderText.setText(text);
                this.orderText.setColor('#00ff00');
            }
        } else {
            const tasks = warehouseManager.getInboundTasks();
            let text = `Inbound Tasks (PUT AWAY):\n`;

            this.sparkles.clear(true, true);

            let anyToReceive = false;
            tasks.forEach((task: any) => {
                const check = task.isCompleted ? 'X' : (task.isReceived ? '✓' : ' ');
                text += `[${check}] ${task.itemType} -> ${task.targetSlotId}\n`;

                if (!task.isCompleted) {
                    if (!task.isReceived) {
                        anyToReceive = true;
                    } else {
                        const slot = slottingManager.getSlotById(task.targetSlotId);
                        if (slot) {
                            this.createSparkle(slot.x * 32 + 16, slot.y * 32 + 16);
                        }
                    }
                }
            });

            if (anyToReceive) {
                const receivingPos = (this.scene as any).receivingZonePos;
                this.createSparkle(
                    (receivingPos.x + receivingPos.width / 2) * 32,
                    (receivingPos.y + receivingPos.height / 2) * 32
                );
            }

            this.orderText.setText(text);
            this.orderText.setColor('#3498db');
        }
    }

    private createSparkle(x: number, y: number) {
        const sparkle = this.scene.add.star(x, y, 5, 4, 8, 0xffff00);
        this.sparkles.add(sparkle);

        this.scene.tweens.add({
            targets: sparkle,
            alpha: 0,
            scale: 1.5,
            duration: 800,
            yoyo: true,
            repeat: -1
        });
    }

    public clearSparkles(): void {
        this.sparkles.clear(true, true);
    }
}
