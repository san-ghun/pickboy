import { BaseHUD } from './BaseHUD';
import type { GameScene } from '../scenes/GameScene';

export class StatusHUD extends BaseHUD {
    private locationText: Phaser.GameObjects.Text;
    private timerText: Phaser.GameObjects.Text;
    private scoreText: Phaser.GameObjects.Text;

    constructor(scene: GameScene) {
        super(scene);

        this.locationText = scene.add.text(810, 10, 'Location: -', {
            color: '#ffffff',
            fontSize: '14px',
            wordWrap: { width: 204 }
        });

        this.timerText = scene.add.text(810, 500, 'Time: 00:00', {
            fontSize: '18px',
            color: '#ff0000',
            fontStyle: 'bold'
        });

        this.scoreText = scene.add.text(810, 530, 'Score: 0', {
            fontSize: '18px',
            color: '#ffffff'
        });

        this.container.add([this.locationText, this.timerText, this.scoreText]);
        // Note: container is at (0,0), so we use absolute positions for children if needed
        // but here it's easier to just put them in the container and adjust.
        // Actually, let's keep it simple.
    }

    public update(): void {
        const warehouseManager = (this.scene as any).warehouseManager;
        const timeLeft = (this.scene as any).timeLeft;

        // Timer
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        this.timerText.setText(`Time: ${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);

        // Score
        const state = warehouseManager.getRoundState();
        if (state) {
            this.scoreText.setText(`Score: ${state.score}`);
        }
    }

    public setLocation(text: string): void {
        this.locationText.setText(text);
    }
}
