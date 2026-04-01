import { Application, Graphics } from "pixi.js";
import {
    createPlayer,
    resetPlayer,
    syncPlayerSprite,
    updateVelocity,
    updatePosition,
    clampToWorldBorder,
    updateCollisions
} from "./player";
import type { Rectangle } from "./utility";

const groundHeight = 100;
const surfaceColor = 0x64c864;
const bgColor = "#2288ff";

(async () => {
    const app = new Application();
    await app.init({ background: bgColor, resizeTo: window });
    document.body.appendChild(app.canvas);

    const width = app.screen.width;
    const height = app.screen.height;

    const surfaces: Rectangle[] = [
        { position: { x: 0, y: height - groundHeight }, size: { x: width, y: groundHeight } },
        { position: { x: 400, y: 600 }, size: { x: 200, y: 20 } },
        { position: { x: 800, y: 450 }, size: { x: 200, y: 20 } },
    ];

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

    const player = createPlayer();
    app.stage.addChild(player.sprite);

    surfaces.map((surface) => {
        const sprite = new Graphics();
        sprite.rect(0, 0, surface.size.x, surface.size.y).fill(surfaceColor);
        sprite.x = surface.position.x;
        sprite.y = surface.position.y;
        app.stage.addChild(sprite);
        return sprite;
    });

    app.ticker.add((time) => {
        const deltaTime = time.deltaTime / 60;
        updateVelocity(player, keys, deltaTime);
        updatePosition(player, deltaTime);
        clampToWorldBorder(player, width);
        updateCollisions(player, surfaces);

        // void
        if (player.position.y > height) {
            resetPlayer(player);
        }

        syncPlayerSprite(player);
    });
})();