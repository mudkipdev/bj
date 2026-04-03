import { Application, Assets, Rectangle, Texture, Sprite } from "pixi.js";
import {
    createPlayer,
    resetPlayer,
    syncPlayerSprite,
    updateVelocity,
    updatePosition,
    clampToWorldBorder,
    updateCollisions
} from "./player";

import { tileSize, textureScale, TileType, createWorld, getBoundingBoxes } from "./world";
import tilesUrl from "../assets/textures/tiles.png" with { type: "file" };

(async () => {
    const app = new Application();
    await app.init({ resizeTo: window });
    document.body.appendChild(app.canvas);

    const width = app.screen.width;
    const height = app.screen.height;

    const textureAtlas = await Assets.load<Texture>(tilesUrl);
    textureAtlas.source.scaleMode = "nearest"; // make it pixelated

    const tileTextures: Texture[] = Array.from({ length: Object.keys(TileType).length / 2 }, (_, index) =>
        new Texture({
            source: textureAtlas.source,
            frame: new Rectangle(index * textureScale, 0, textureScale, textureScale),
        })
    );

    const columns = Math.ceil(width / tileSize);
    const rows = Math.ceil(height / tileSize);
    const grid = createWorld(columns, rows);
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

    const spawnPosition = { x: 3 * tileSize, y: 22 * tileSize };
    const player = createPlayer(spawnPosition);
    app.stage.addChild(player.sprite);

    app.ticker.add((time) => {
        const deltaTime = time.deltaTime / 60;
        updateVelocity(player, keys, deltaTime);
        updatePosition(player, deltaTime);
        clampToWorldBorder(player, width);
        updateCollisions(player, boundingBoxes);

        // void
        if (player.position.y > height) {
            resetPlayer(player);
        }

        syncPlayerSprite(player);
    });
})();