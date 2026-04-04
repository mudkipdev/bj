import { Graphics } from "pixi.js";
import type { Entity } from "./entity";
import type { Vec2 } from "../utility";
import { tileSize } from "../world";

const speed = 110;

export interface Enemy extends Entity {
    spawnPosition: Vec2;
}

export function createEnemy(spawnPosition: Vec2): Enemy {
    const sprite = new Graphics();
    const size = { x: tileSize, y: tileSize * 2 };
    sprite.rect(0, 0, size.x, size.y).fill(0xFF4444);
    sprite.x = spawnPosition.x;
    sprite.y = spawnPosition.y;

    return {
        sprite,
        position: { ...spawnPosition },
        previousPosition: { ...spawnPosition },
        velocity: { x: 0, y: 0 },
        size,
        spawnPosition: { ...spawnPosition }
    };
}

export function updateEnemy(enemy: Enemy, target: Entity, deltaTime: number): void {
    const deltaX = target.position.x - enemy.position.x;

    enemy.previousPosition.x = enemy.position.x;
    enemy.previousPosition.y = enemy.position.y;

    if (Math.abs(deltaX) > 2) {
        enemy.velocity.x = Math.sign(deltaX) * speed;
        enemy.position.x += enemy.velocity.x * deltaTime;
    } else {
        enemy.velocity.x = 0;
    }
}
