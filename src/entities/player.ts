import { Graphics } from "pixi.js";
import type { Entity } from "./entity";
import type { Rectangle, Vec2 } from "../utility";
import { tileSize } from "../world";

export const maxSpeed = 200;
export const friction = 600;
export const jumpForce = 430;
export const gravity = 500;
export const maxHealth = 3;

export interface Player extends Entity {
    spawnPosition: Vec2;
    onGround: boolean;
    health: number;
}

export function createPlayer(spawnPosition: Vec2): Player {
    const sprite = new Graphics();
    const size = { x: tileSize, y: tileSize * 2 }; // width 1, height 2
    sprite.rect(0, 0, size.x, size.y).fill(0x4488FF);
    sprite.x = spawnPosition.x;
    sprite.y = spawnPosition.y;

    return {
        sprite,
        position: { ...spawnPosition },
        previousPosition: { ...spawnPosition },
        velocity: { x: 0, y: 0 },
        size,
        spawnPosition: { ...spawnPosition },
        onGround: false,
        health: maxHealth
    };
}

export function isDead(player: Player): boolean {
    return player.health <= 0;
}

export function resetPlayer(player: Player): void {
    player.position.x = player.spawnPosition.x;
    player.position.y = player.spawnPosition.y;
    player.velocity.x = 0;
    player.velocity.y = 0;
    player.onGround = false;
}

export function updateVelocity(
    player: Player,
    keys: {
        left: boolean;
        right: boolean;
        space: boolean;
    },
    deltaTime: number
): void {
    if (keys.left) {
        player.velocity.x = -maxSpeed;
    } else if (keys.right) {
        player.velocity.x = maxSpeed;
    } else {
        if (Math.abs(player.velocity.x) > 0) {
            player.velocity.x += (player.velocity.x > 0 ? -1 : 1) * friction * deltaTime;

            if (Math.abs(player.velocity.x) < 10) {
                player.velocity.x = 0;
            }
        }
    }

    if (keys.space && player.onGround) {
        player.velocity.y = -jumpForce;
        player.onGround = false;
    }
}

export function updatePosition(entity: Entity, deltaTime: number): void {
    entity.velocity.y += gravity * deltaTime;
    entity.previousPosition.x = entity.position.x;
    entity.previousPosition.y = entity.position.y;
    entity.position.x += entity.velocity.x * deltaTime;
    entity.position.y += entity.velocity.y * deltaTime;
}

export function clampToWorldBorder(entity: Entity, width: number): void {
    if (entity.position.x < 0) {
        entity.position.x = 0;
    }

    if (entity.position.x + entity.size.x > width) {
        entity.position.x = width - entity.size.x;
    }
}

export function checkCollision(position1: Vec2, size1: Vec2, position2: Vec2, size2: Vec2): boolean {
    return (
        position1.x < position2.x + size2.x &&
        position1.x + size1.x > position2.x &&
        position1.y < position2.y + size2.y &&
        position1.y + size1.y > position2.y
    );
}

export function updateCollisions(player: Player, surfaces: Rectangle[]): void {
    player.onGround = false;

    for (const surface of surfaces) {
        if (checkCollision(
            player.position,
            player.size,
            surface.position,
            surface.size
        )) {
            const wasAbove = player.previousPosition.y + player.size.y <= surface.position.y;
            const wasBelow = player.previousPosition.y >= surface.position.y + surface.size.y;
            const isMovingDown = player.velocity.y >= 0;
            const isMovingUp = player.velocity.y < 0;

            if (wasAbove && isMovingDown) {
                player.onGround = true;
                player.position.y = surface.position.y - player.size.y;
                player.velocity.y = 0;
            } else if (wasBelow && isMovingUp) {
                player.position.y = surface.position.y + surface.size.y;
                player.velocity.y = 0;
            } else {
                if (player.previousPosition.x + player.size.x <= surface.position.x) {
                    player.position.x = surface.position.x - player.size.x;
                } else if (player.previousPosition.x >= surface.position.x + surface.size.x) {
                    player.position.x = surface.position.x + surface.size.x;
                }
            }
        }
    }
}
