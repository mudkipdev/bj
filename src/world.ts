import type { Rectangle } from "./utility";

export const tileSize = 48;
export const textureScale = 32;
export const worldColumns = 30;
export const worldRows = 17;
export const worldWidth = worldColumns * tileSize;
export const worldHeight = worldRows * tileSize;

export enum TileType {
    air = 0,
    grass = 1,
    dirt = 2
}

export type TileGrid = TileType[][];

export function createWorld(columns: number, rows: number): TileGrid {
    const grid: TileGrid = Array.from({ length: rows }, () =>
        new Array(columns).fill(TileType.air)
    );

    // ground
    for (let row = 0; row < rows; row++) {
        if (row == rows - 3) {
            grid[row]!.fill(TileType.grass);
        } else if (row >= rows - 3) {
            grid[row]!.fill(TileType.dirt);
        }
    }

    return grid;
}

export function getBoundingBoxes(grid: TileGrid): Rectangle[] {
    const boundingBoxes: Rectangle[] = [];

    for (const [row, tilesInRow] of grid.entries()) {
        for (const [column, tileType] of tilesInRow.entries()) {
            if (tileType !== TileType.air) {
                boundingBoxes.push({
                    position: { x: column * tileSize, y: row * tileSize },
                    size: { x: tileSize, y: tileSize }
                });
            }
        }
    }

    return boundingBoxes;
}