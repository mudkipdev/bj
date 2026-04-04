import { Rectangle, Sprite, Texture } from "pixi.js";
import type { Vec2 } from "../utility";
import { textureScale } from "../world";

export interface Entity {
    sprite: Sprite;
    position: Vec2;
    previousPosition: Vec2;
    velocity: Vec2;
    size: Vec2;
    facing: "left" | "right";
}

export function createEntitySprite(atlas: Texture, x: number, y: number, size: Vec2): Sprite {
    const texture = new Texture({
        source: atlas.source,
        frame: new Rectangle(x * textureScale, y * textureScale, textureScale, textureScale),
    });

    const sprite = new Sprite(texture);
    sprite.width = size.x;
    sprite.height = size.y;
    return sprite;
}

export function syncEntitySprite(entity: Entity): void {
    const scaleX = Math.abs(entity.sprite.scale.x) || 1;
    entity.sprite.scale.x = entity.facing === "left" ? -scaleX : scaleX;

    entity.sprite.x = entity.facing === "left"
        ? entity.position.x + entity.size.x
        : entity.position.x;

    entity.sprite.y = entity.position.y;
}
