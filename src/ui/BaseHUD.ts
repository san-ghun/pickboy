import type { GameScene } from '../scenes/GameScene';

export abstract class BaseHUD {
    protected scene: GameScene;
    protected container: Phaser.GameObjects.Container;

    constructor(scene: GameScene) {
        this.scene = scene;
        this.container = scene.add.container(0, 0);
        this.container.setScrollFactor(0);
        this.container.setDepth(100);
    }

    public abstract update(): void;

    public setVisible(visible: boolean): void {
        this.container.setVisible(visible);
    }

    public destroy(): void {
        this.container.destroy();
    }
}
