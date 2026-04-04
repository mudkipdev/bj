import type { Rectangle } from "./utility";

export const tileSize = 48;
export const textureScale = 32;
export const worldColumns = 30;
export const worldRows = 17;
export const worldWidth = worldColumns * tileSize;
export const worldHeight = worldRows * tileSize;

export enum TileType {
    air = 0,
    solid = 1
}

export type TileGrid = TileType[][];

export function createWorld(columns: number, rows: number): TileGrid {
    const grid: TileGrid = Array.from({ length: rows }, () =>
        new Array(columns).fill(TileType.air)
    );

    // ground
    for (let row = rows - 3; row < rows; row++) {
        grid[row]!.fill(TileType.solid);
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