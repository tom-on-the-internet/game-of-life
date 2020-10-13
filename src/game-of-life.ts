export type Grid = boolean[][];
export type Coordinate = [number, number];

export function generateGrid(size: number): Grid {
  return Array.from(Array(size)).map((_) =>
    Array.from(Array(size)).map((_) => randomBoolean())
  );
}

function randomBoolean() {
  return Math.random() > 0.9;
}

export function takeTurn(grid: Grid): Grid {
  return grid.map((row, rowIndex) => {
    return row.map((_, cellIndex) => shouldLive(rowIndex, cellIndex, grid));
  });
}

function isOutOfBounds(
  rowIndex: number,
  cellIndex: number,
  grid: Grid
): boolean {
  return (
    rowIndex < 0 ||
    cellIndex < 0 ||
    rowIndex >= grid.length ||
    cellIndex >= grid.length
  );
}

function isLiving(rowIndex: number, cellIndex: number, grid: Grid): boolean {
  if (isOutOfBounds(rowIndex, cellIndex, grid)) {
    return false;
  }

  return grid[rowIndex][cellIndex];
}

function shouldLive(rowIndex: number, cellIndex: number, grid: Grid): boolean {
  const neighborCoordinates: Coordinate[] = [
    [rowIndex - 1, cellIndex - 1],
    [rowIndex - 1, cellIndex],
    [rowIndex - 1, cellIndex + 1],
    [rowIndex, cellIndex - 1],
    [rowIndex, cellIndex + 1],
    [rowIndex + 1, cellIndex - 1],
    [rowIndex + 1, cellIndex],
    [rowIndex + 1, cellIndex + 1],
  ];

  const countNeighborsLiving = neighborCoordinates.reduce(
    (accumulator: number, coordinate: Coordinate): number => {
      const [rowIndex, cellIndex] = coordinate;

      if (isLiving(rowIndex, cellIndex, grid)) {
        return accumulator + 1;
      }

      return accumulator;
    },
    0
  );

  if (countNeighborsLiving === 3) {
    return true;
  }

  return isLiving(rowIndex, cellIndex, grid) && countNeighborsLiving === 2;
}
