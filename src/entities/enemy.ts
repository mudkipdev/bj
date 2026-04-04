import { createEntitySprite, type Entity } from "./entity";
import type { Vec2 } from "../utility";
import { tileSize } from "../world";
import type { Texture } from "pixi.js";

const speed = 110;

export interface Enemy extends Entity {
    spawnPosition: Vec2;
}

export function createEnemy(spawnPosition: Vec2, atlas: Texture): Enemy {
    const size = { x: tileSize * 2, y: tileSize * 2 };
    const sprite = createEntitySprite(atlas, 0, 2, size);
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
