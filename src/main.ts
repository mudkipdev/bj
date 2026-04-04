import { Application, Assets, Rectangle, Texture, Sprite, Text } from "pixi.js";
import { syncEntitySprite, type Entity } from "./entity";
import {
    createPlayer,
    maxHealth,
    resetPlayer,
    updateVelocity,
    updatePosition,
    clampToWorldBorder,
    updateCollisions
} from "./player";

import {
    tileSize,
    textureScale,
    TileType,
    createWorld,
    getBoundingBoxes,
    worldColumns,
    worldRows,
    worldWidth,
    worldHeight
} from "./world";
import tilesUrl from "../assets/textures/tiles.png" with { type: "file" };

(async () => {
    const app = new Application();
    await app.init({ width: worldWidth, height: worldHeight });
    document.body.appendChild(app.canvas);
    await document.fonts.load('24px "PixelOperator"');

    const textureAtlas = await Assets.load<Texture>(tilesUrl);
    textureAtlas.source.scaleMode = "nearest"; // make it pixelated

    const tileTextures: Texture[] = Array.from({ length: Object.keys(TileType).length / 2 }, (_, index) =>
        new Texture({
            source: textureAtlas.source,
            frame: new Rectangle(index * textureScale, 0, textureScale, textureScale),
        })
    );

    const grid = createWorld(worldColumns, worldRows);
    const boundingBoxes = getBoundingBoxes(grid);

    for (const [row, tilesInRow] of grid.entries()) {
        for (const [column, tileType] of tilesInRow.entries()) {
            const sprite = new Sprite(tileTextures[tileType]);
            sprite.x = column * tileSize;
            sprite.y = row * tileSize;
            sprite.width = tileSize;
            sprite.height = tileSize;
            app.stage.addChild(sprite);
        }
    }

    const keys = {
        left: false,
        right: false,
        space: false
    };

    window.addEventListener("keydown", event => {
        if (event.key === "ArrowLeft") keys.left = true;
        if (event.key === "ArrowRight") keys.right = true;
        if (event.key === "ArrowUp") keys.space = true;
    });

    window.addEventListener("keyup", event => {
        if (event.key === "ArrowLeft") keys.left = false;
        if (event.key === "ArrowRight") keys.right = false;
        if (event.key === "ArrowUp") keys.space = false;
    });

    window.addEventListener("blur", () => {
        keys.left = false;
        keys.right = false;
        keys.space = false;
    });

    const text = new Text({
        text: `Health: ${maxHealth} / ${maxHealth}`, style: {
            fill: 0xFFFFFF,
            fontFamily: "PixelOperator",
            fontWeight: 700,
            fontSize: 64
        }
    });

    text.x = 24;
    text.y = 12;
    app.stage.addChild(text);

    const entities: Entity[] = [];
    const spawnPosition = { x: 3 * tileSize, y: (worldRows - 5) * tileSize };
    const player = createPlayer(spawnPosition);
    entities.push(player);
    app.stage.addChild(player.sprite);

    app.ticker.add((time) => {
        const deltaTime = time.deltaTime / 60;
        updateVelocity(player, keys, deltaTime);
        updatePosition(player, deltaTime);
        clampToWorldBorder(player, worldWidth);
        updateCollisions(player, boundingBoxes);
        text.text = `Health: ${player.health} / ${maxHealth}`;

        // void
        if (player.position.y > worldHeight) {
            resetPlayer(player);
        }

        for (const entity of entities) {
            syncEntitySprite(entity);
        }
    });
})();
