export type Grid = boolean[][];
export type Coordinate = [number, number];
export type Settings = { width: number; height: number; gridString: string };

export function generateGrid(width: number, height: number): Grid {
  return Array.from(Array(height)).map((_) =>
    Array.from(Array(width)).map((_) => randomBoolean())
  );
}

function randomBoolean() {
  return Math.random() > 0.5;
}

export function takeTurn(grid: Grid): Grid {
  return grid.map((row, rowIndex) => {
    return row.map((_, cellIndex) => shouldLive(rowIndex, cellIndex, grid));
  });
}

export function depopulateGrid(grid: Grid): Grid {
  return grid.map((row) => row.map(() => false));
}

export function countLiving(grid: Grid): number {
  return grid.reduce(
    (acc: number, current: boolean[]): number =>
      current.reduce(
        (acc: number, current: boolean): number => (current ? acc + 1 : acc),
        0
      ) + acc,
    0
  );
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
    cellIndex >= grid[0].length
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
export function encodeGrid(grid: Grid): string {
  return grid.reduce(
    (acc: string, row: boolean[]) =>
      acc + row.map((cell) => (cell ? 1 : 0)).join(""),
    ""
  );
}

export function decodeGrid({ width, gridString }: Settings): Grid {
  const stringRowGrid = gridString.match(
    new RegExp(".{1," + width + "}", "g")
  ) as string[];

  return stringRowGrid
    .map((stringRow) => stringRow.split(""))
    .map((row) => row.map((cell) => (cell === "1" ? true : false)));
}
