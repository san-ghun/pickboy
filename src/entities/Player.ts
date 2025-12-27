import type { GameScene } from '../scenes/GameScene';

export class Player extends Phaser.Physics.Arcade.Sprite {
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private inventoryFollowers: Phaser.GameObjects.Arc[] = [];
    private speed = 160;

    constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, 'player_placeholder');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        this.setOrigin(0, 0);

        if (scene.input.keyboard) {
            this.cursors = scene.input.keyboard.createCursorKeys();
        } else {
            // Fallback empty cursors
            this.cursors = {} as any;
        }
    }

    public update(): void {
        const warehouseManager = (this.scene as any).warehouseManager;
        const state = warehouseManager.getRoundState();
        const timeLeft = (this.scene as any).timeLeft;

        if (state?.isFinished || timeLeft <= 0 || !(this.scene as any).gameStarted) {
            this.setVelocity(0);
            return;
        }

        this.setVelocity(0);

        if (this.cursors.left?.isDown) {
            this.setVelocityX(-this.speed);
        } else if (this.cursors.right?.isDown) {
            this.setVelocityX(this.speed);
        }

        if (this.cursors.up?.isDown) {
            this.setVelocityY(-this.speed);
        } else if (this.cursors.down?.isDown) {
            this.setVelocityY(this.speed);
        }

        this.updateFollowers();
    }

    public resetPosition(x: number, y: number): void {
        this.setPosition(x, y);
        this.clearFollowers();
    }

    public clearFollowers(): void {
        this.inventoryFollowers.forEach(f => f.destroy());
        this.inventoryFollowers = [];
    }

    public createFollower(): void {
        const follower = this.scene.add.arc(this.x, this.y, 8, 0, 360, false, 0x00ff00);
        this.inventoryFollowers.push(follower);
    }

    public removeFollower(): void {
        const follower = this.inventoryFollowers.pop();
        if (follower) {
            follower.destroy();
        }
    }

    private updateFollowers(): void {
        let prevX = this.x + 16;
        let prevY = this.y + 16;

        this.inventoryFollowers.forEach((follower) => {
            const targetX = prevX;
            const targetY = prevY;

            // Simple smoothing
            follower.x += (targetX - 24 - follower.x) * 0.2;
            follower.y += (targetY - follower.y) * 0.2;

            prevX = follower.x;
            prevY = follower.y;
        });
    }
}
