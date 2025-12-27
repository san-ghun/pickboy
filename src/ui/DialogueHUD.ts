import { BaseHUD } from './BaseHUD';
import type { GameScene } from '../scenes/GameScene';

export class DialogueHUD extends BaseHUD {
    private dialogueText: Phaser.GameObjects.Text;
    private dialogueBg: Phaser.GameObjects.Rectangle;
    private hideTimer?: Phaser.Time.TimerEvent;

    constructor(scene: GameScene) {
        super(scene);

        const width = 600;
        const height = 100;
        const x = (800 - width) / 2;
        const y = 600 - height - 20;

        this.container.setPosition(x, y);

        this.dialogueBg = scene.add.rectangle(0, 0, width, height, 0xffffff).setOrigin(0);
        this.dialogueBg.setStrokeStyle(4, 0x000000);

        this.dialogueText = scene.add.text(20, 20, '', {
            color: '#000000',
            fontSize: '18px',
            wordWrap: { width: width - 40 }
        });

        this.container.add([this.dialogueBg, this.dialogueText]);
        this.container.setVisible(false);
    }

    public update(): void {
        // Dialogue doesn't need per-frame updates
    }

    public show(message: string, autoHide: boolean = true): void {
        if (this.hideTimer) {
            this.hideTimer.destroy();
            this.hideTimer = undefined;
        }

        this.dialogueText.setText(message);
        this.container.setVisible(true);
        this.container.setDepth(200);

        if (autoHide) {
            this.hideTimer = this.scene.time.delayedCall(3000, () => {
                const state = (this.scene as any).warehouseManager?.getRoundState();
                const timeLeft = (this.scene as any).timeLeft;

                if (!state?.isFinished && timeLeft > 0) {
                    this.container.setVisible(false);
                }
            });
        }
    }

    public hide(): void {
        this.container.setVisible(false);
    }
}
