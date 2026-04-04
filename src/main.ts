import { Application, Assets, Rectangle, Texture, Sprite, Text } from "pixi.js";
import { syncEntitySprite, type Entity } from "./entities/entity";
import { createEnemy, updateEnemy } from "./entities/enemy";
import {
    createPlayer,
    damagePlayer,
    isDead,
    maxHealth,
    resetPlayer,
    updateVelocity,
    updatePosition,
    checkCollision,
    clampToWorldBorder,
    updateCollisions
} from "./entities/player";

import {
    tileSize,
    textureScale,
    textureCoordinates,
    createWorld,
    getBoundingBoxes,
    worldColumns,
    worldRows,
    worldWidth,
    worldHeight
} from "./world";

import tilesUrl from "../assets/textures/tiles.png" with { type: "file" };
import hurtUrl from "../assets/sounds/hurt.wav" with { type: "file" };
import deathUrl from "../assets/sounds/death.wav" with { type: "file" };

(async () => {
    const app = new Application();
    await app.init({ backgroundColor: "#78D", width: worldWidth, height: worldHeight });
    document.body.appendChild(app.canvas);
    await document.fonts.load('24px "PixelOperator"');

    const textureAtlas = await Assets.load<Texture>(tilesUrl);
    textureAtlas.source.scaleMode = "nearest"; // make it pixelated

    const grid = createWorld(worldColumns, worldRows);
    const boundingBoxes = getBoundingBoxes(grid);

    for (const [row, tilesInRow] of grid.entries()) {
        for (const [column, tileType] of tilesInRow.entries()) {
            const frame = textureCoordinates[tileType];

            if (!frame) {
                continue;
            }

            const sprite = new Sprite(
                new Texture({
                    source: textureAtlas.source,
                    frame: new Rectangle(frame.x * textureScale, frame.y * textureScale, textureScale, textureScale)
                })
            );

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

    const deadText = new Text({
        text: "You died!",
        style: {
            fill: 0xFFFFFF,
            fontFamily: "PixelOperator",
            fontWeight: 700,
            fontSize: 64
        }
    });

    deadText.anchor.set(0.5);

    const entities: Entity[] = [];

    // PLAYER //
    const player = createPlayer({
        x: 3 * tileSize,
        y: (worldRows - 5) * tileSize
    }, textureAtlas);

    entities.push(player);
    app.stage.addChild(player.sprite);

    // ENEMY //
    const enemy = createEnemy({
        x: worldWidth - 5 * tileSize,
        y: (worldRows - 5) * tileSize
    }, textureAtlas);

    entities.push(enemy);
    app.stage.addChild(enemy.sprite);

    // SOUND SHIT //
    const hurtSound = new Audio(hurtUrl);
    const deathSound = new Audio(deathUrl);

    const playSound = (audio: HTMLAudioElement) => {
        const instance = audio.cloneNode(true) as HTMLAudioElement;
        instance.currentTime = 0;
        void instance.play().catch(() => { });
    };

    let gameTime = 0;
    let nextDamageTime = 0;
    let gameOver = false;

    const triggerGameOver = () => {
        if (gameOver) {
            return;
        }

        gameOver = true;
        app.stage.removeChildren();
        deadText.x = worldWidth / 2;
        deadText.y = worldHeight / 2;
        app.stage.addChild(deadText);
    };

    // TICK LOOP //
    app.ticker.add((time) => {
        if (gameOver) {
            return;
        }

        const deltaTime = time.deltaTime / 60;
        const elapsedSeconds = time.deltaMS / 1000;
        updateEnemy(enemy, player, deltaTime);
        clampToWorldBorder(enemy, worldWidth);

        if (!isDead(player)) {
            updateVelocity(player, keys, deltaTime);
            updatePosition(player, deltaTime);
            clampToWorldBorder(player, worldWidth);
            updateCollisions(player, boundingBoxes);
        }

        if (!isDead(player) && checkCollision(player.position, player.size, enemy.position, enemy.size) && gameTime >= nextDamageTime) {
            const remainingHealth = damagePlayer(player, 1);
            nextDamageTime = gameTime + 1;

            if (remainingHealth === 0) {
                playSound(deathSound);
                triggerGameOver();
                return;
            } else {
                playSound(hurtSound);
            }
        }

        text.text = `Health: ${player.health} / ${maxHealth}`;

        // void
        if (!isDead(player) && player.position.y > worldHeight) {
            resetPlayer(player);
        }

        for (const entity of entities) {
            syncEntitySprite(entity);
        }

        gameTime += elapsedSeconds;
    });
})();
