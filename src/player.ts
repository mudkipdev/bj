import { Graphics } from "pixi.js";
import type { Rectangle, Vec2 } from "./utility";
import { tileSize } from "./world";

export const maxSpeed = 200;
export const friction = 600;
export const jumpForce = 430;
export const gravity = 500;
export const maxHealth = 3;

export interface Player {
    sprite: Graphics;
    position: Vec2;
    previousPosition: Vec2;
    startPosition: Vec2;
    velocity: Vec2;
    size: Vec2;
    onGround: boolean;
    health: number;
}

export function createPlayer(spawnPosition: Vec2): Player {
    const sprite = new Graphics();
    const size = { x: tileSize, y: tileSize * 2 }; // width 1, height 2
    sprite.rect(0, 0, size.x, size.y).fill(0xFF4444);
    sprite.x = spawnPosition.x;
    sprite.y = spawnPosition.y;

    return {
        sprite,
        position: { ...spawnPosition },
        previousPosition: { ...spawnPosition },
        startPosition: { ...spawnPosition },
        velocity: { x: 0, y: 0 },
        size,
        onGround: false,
        health: maxHealth
    };
}

export function isDead(player: Player): boolean {
    return player.health <= 0;
}

export function resetPlayer(player: Player): void {
    player.position.x = player.startPosition.x;
    player.position.y = player.startPosition.y;
    player.velocity.x = 0;
    player.velocity.y = 0;
    player.onGround = false;
}

export function syncPlayerSprite(player: Player): void {
    player.sprite.x = player.position.x;
    player.sprite.y = player.position.y;
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

export function updatePosition(player: Player, deltaTime: number): void {
    player.velocity.y += gravity * deltaTime;
    player.previousPosition.x = player.position.x;
    player.previousPosition.y = player.position.y;
    player.position.x += player.velocity.x * deltaTime;
    player.position.y += player.velocity.y * deltaTime;
}

export function clampToWorldBorder(player: Player, width: number): void {
    if (player.position.x < 0) {
        player.position.x = 0;
    }

    if (player.position.x + player.size.x > width) {
        player.position.x = width - player.size.x;
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