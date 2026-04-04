import type { Rectangle } from "./utility";

export const tileSize = 48;
export const textureScale = 32;
export const worldColumns = 30;
export const worldRows = 17;
export const worldWidth = worldColumns * tileSize;
export const worldHeight = worldRows * tileSize;

export enum TileType {
    air = 0,

    grassLeftEdge = 1,
    grass = 2,
    grassRightEdge = 3,

    dirtLeftEdge = 4,
    dirt = 5,
    dirtRightEdge = 6,

    bedrockLeftEdge = 7,
    bedrock = 8,
    bedrockRightEdge = 9
}

export const textureCoordinates: Record<TileType, { x: number, y: number } | null> = {
    [TileType.air]: null,

    [TileType.grassLeftEdge]: { x: 11, y: 0 },
    [TileType.grass]: { x: 12, y: 0 },
    [TileType.grassRightEdge]: { x: 13, y: 0 },

    [TileType.dirtLeftEdge]: { x: 11, y: 1 },
    [TileType.dirt]: { x: 12, y: 1 },
    [TileType.dirtRightEdge]: { x: 13, y: 1 },

    [TileType.bedrock]: { x: 12, y: 2 },
    [TileType.bedrockLeftEdge]: { x: 11, y: 2 },
    [TileType.bedrockRightEdge]: { x: 13, y: 2 }
};

export type TileGrid = TileType[][];

export function createWorld(columns: number, rows: number): TileGrid {
    const grid: TileGrid = Array.from({ length: rows }, () =>
        new Array(columns).fill(TileType.air)
    );

    // ground
    for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
            if (row == rows - 3) {
                if (column == 0) {
                    grid[row]![column] = TileType.grassLeftEdge;
                } else if (column == columns - 1) {
                    grid[row]![column] = TileType.grassRightEdge;
                } else {
                    grid[row]![column] = TileType.grass;
                }
            } else if (row == rows - 2) {
                if (column == 0) {
                    grid[row]![column] = TileType.dirtLeftEdge;
                } else if (column == columns - 1) {
                    grid[row]![column] = TileType.dirtRightEdge;
                } else {
                    grid[row]![column] = TileType.dirt;
                }
            } else if (row == rows - 1) {
                if (column == 0) {
                    grid[row]![column] = TileType.bedrockLeftEdge;
                } else if (column == columns - 1) {
                    grid[row]![column] = TileType.bedrockRightEdge;
                } else {
                    grid[row]![column] = TileType.bedrock;
                }
            }
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
