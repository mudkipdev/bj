import { Graphics } from "pixi.js";
import type { Vec2 } from "./utility";

export interface Entity {
    sprite: Graphics;
    position: Vec2;
    previousPosition: Vec2;
    velocity: Vec2;
    size: Vec2;
}

export function syncEntitySprite(entity: Entity): void {
    entity.sprite.x = entity.position.x;
    entity.sprite.y = entity.position.y;
}
