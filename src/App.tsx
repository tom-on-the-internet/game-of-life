import useInterval from "@use-it/interval";
import {
  XYPlot,
  XAxis,
  YAxis,
  HorizontalGridLines,
  LineSeries,
} from "react-vis";

import Emoji from "a11y-react-emoji";
import React, { useEffect, useRef, useState } from "react";
import "./App.scss";
import {
  depopulateGrid,
  generateGrid,
  Grid,
  takeTurn,
  countLiving,
} from "./game-of-life";
import {
  Button,
  Container,
  Grid as MaterialGrid,
  ButtonGroup,
  Slider,
} from "@material-ui/core";

type Settings = { width: number; height: number; gridString: string };

const DEFAULT_WIDTH = 30;
const DEFAULT_HEIGHT = 15;
const DEFAULT_DELAY = 100;
const MIN_HEIGHT = 3;
const MIN_WIDTH = 3;
const MAX_HEIGHT = 50;
const MAX_WIDTH = 100;

function App() {
  const [width, setWidth] = useState<number>(DEFAULT_WIDTH);
  const [height, setHeight] = useState<number>(DEFAULT_HEIGHT);
  const [grid, setGrid] = useState<Grid>(generateGrid(width, height));
  const [turn, setTurn] = useState<number>(0);
  const [history, setHistory] = useState<Grid[]>([grid]);
  const [delay, setDelay] = useState<number>(DEFAULT_DELAY);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [mouseHold, setMouseHold] = useState<boolean>(false);
  const firstUpdate = useRef(true);
  const chartData = history.map((grid, index) => {
    return { x: index, y: countLiving(grid) };
  });

  const encodeGrid = (grid: Grid): string =>
    grid.reduce(
      (acc: string, row: boolean[]) =>
        acc + row.map((cell) => (cell ? 1 : 0)).join(""),
      ""
    );

  const decodeGrid = ({ width, gridString }: Settings): Grid => {
    const stringRowGrid = gridString.match(
      new RegExp(".{1," + width + "}", "g")
    ) as string[];

    return stringRowGrid
      .map((stringRow) => stringRow.split(""))
      .map((row) => row.map((cell) => (cell === "1" ? true : false)));
  };

  const settings: Settings = {
    width,
    height,
    gridString: encodeGrid(history[0]),
  };

  const encodedSettings = btoa(JSON.stringify(settings));

  useInterval(() => {
    if (isActive) {
      const nextGrid = takeTurn(grid);
      setHistory([...history, nextGrid]);
      setGrid(nextGrid);
      setTurn(turn + 1);
    }
  }, delay);

  useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }

    window.history.pushState({}, "", encodedSettings);
  }, [encodedSettings]);

  useEffect(() => {
    const url = window.location.pathname.replace(/\//, "");
    if (!url) {
      return;
    }

    const settings: Settings = JSON.parse(atob(url));
    const grid = decodeGrid(settings);

    setHeight(settings.height);
    setWidth(settings.width);
    setGrid(grid);
    setHistory([grid]);
  }, []);

  const onSetHeight = (height: number) => {
    let newHeight = height;

    if (newHeight < MIN_HEIGHT) {
      newHeight = MIN_HEIGHT;
    }

    if (newHeight > MAX_HEIGHT) {
      newHeight = MAX_HEIGHT;
    }

    setHeight(newHeight);
    randomDistribution(newHeight, width);
  };

  const onSetWidth = (width: number) => {
    let newWidth = width;

    if (newWidth < MIN_WIDTH) {
      newWidth = MIN_WIDTH;
    }

    if (newWidth > MAX_WIDTH) {
      newWidth = MAX_WIDTH;
    }

    setWidth(newWidth);
    randomDistribution(height, newWidth);
  };

  const onChangeCell = (rowIndex: number, colIndex: number) => {
    grid[rowIndex][colIndex] = !grid[rowIndex][colIndex];
    setGrid([...grid]);
  };

  const randomDistribution = (height: number, width: number) => {
    const grid = generateGrid(width, height);
    setGrid(grid);
    setHistory([grid]);
  };

  const onDepopulateGrid = () => {
    const depopulatedGrid = depopulateGrid(grid);
    setGrid(depopulatedGrid);
    setHistory([depopulatedGrid]);
  };

  const onResetGrid = () => {
    const grid = history[0];
    setGrid(grid);
    setHistory([grid]);
    setTurn(0);
    setIsActive(false);
  };

  const jumpToTurn = (turn: number) => {
    setTurn(turn);
    setGrid(history[turn]);
  };

  const onStart = () => {
    setIsActive(true);
    setHistory(history.slice(0, turn + 1));
  };

  const onStop = () => {
    setIsActive(false);
  };

  const isInitialState = history.length === 1;

  return (
    <Container>
      <MaterialGrid container spacing={3}>
        <MaterialGrid item xs={12}>
          <div onMouseUp={() => setMouseHold(false)}>
            <h1>Conway's Game of Life</h1>
            <h2>Implemented by Tom on the Internet</h2>
            <div style={{ marginBottom: 20 }}>
              <div>
                <ButtonGroup
                  variant="contained"
                  color="primary"
                  aria-label="contained primary button group"
                >
                  <Button disabled={isActive} onClick={onStart}>
                    Start
                  </Button>
                  <Button disabled={!isActive} onClick={onStop}>
                    Stop
                  </Button>
                  <Button
                    disabled={turn === 0 || isActive}
                    onClick={onResetGrid}
                  >
                    Reset
                  </Button>
                </ButtonGroup>
              </div>
              <div>
                <ButtonGroup
                  color="primary"
                  aria-label="contained primary button group"
                >
                  <Button disabled={turn !== 0} onClick={onDepopulateGrid}>
                    Depopulate
                  </Button>
                  <Button
                    disabled={turn !== 0}
                    onClick={() => randomDistribution(height, width)}
                  >
                    Random Distribution
                  </Button>
                </ButtonGroup>
              </div>
              <div>
                <label>
                  Delay (ms):
                  <Slider
                    aria-labelledby="discrete-slider"
                    valueLabelDisplay="on"
                    min={50}
                    max={1000}
                    step={null}
                    marks={[
                      {
                        value: 50,
                      },
                      {
                        value: 100,
                      },
                      {
                        value: 200,
                      },
                      {
                        value: 500,
                      },
                      {
                        value: 1000,
                      },
                    ]}
                    onChange={(_, newDelay) => {
                      if (Array.isArray(newDelay)) {
                        return;
                      }
                      setDelay(newDelay);
                    }}
                    value={delay}
                  />
                  {/* <input */}
                  {/*   value={delay.toString()} */}
                  {/*   onChange={(event) => */}
                  {/*     setDelay(parseInt(event.target.value.replace(/\D/, ""))) */}
                  {/*   } */}
                  {/*   type="number" */}
                  {/* /> */}
                </label>
              </div>
              <div>
                <label>
                  Height:
                  <input
                    disabled={!isInitialState}
                    value={height.toString()}
                    onChange={(event) => {
                      let height = parseInt(
                        event.target.value.replace(/\D/, "")
                      );

                      if (Number.isNaN(height)) {
                        height = MIN_HEIGHT;
                      }

                      onSetHeight(height);
                    }}
                    type="number"
                  />
                </label>
                <label>
                  Width:
                  <input
                    disabled={!isInitialState}
                    value={width.toString()}
                    onChange={(event) => {
                      let width = parseInt(
                        event.target.value.replace(/\D/, "")
                      );

                      if (Number.isNaN(width)) {
                        width = MIN_WIDTH;
                      }

                      onSetWidth(width);
                    }}
                    type="number"
                  />
                </label>
              </div>
              <div>
                <button
                  disabled={isActive || turn === 0}
                  onClick={() => jumpToTurn(turn - 1)}
                >
                  <Emoji symbol="👈" label="back" />
                </button>
                Turn #: {turn}
                <button
                  disabled={isActive || turn === history.length - 1}
                  onClick={() => jumpToTurn(turn + 1)}
                >
                  <Emoji symbol="👉" label="forward" />
                </button>
              </div>
            </div>
          </div>
        </MaterialGrid>
        <MaterialGrid item xs={6}>
          <div
            className="grid"
            onMouseDown={(event: any) => {
              if (turn !== 0) {
                return;
              }

              const dataset: DOMStringMap = event.target.dataset;

              if (
                dataset.rowIndex === undefined ||
                dataset.colIndex === undefined
              ) {
                return;
              }

              setMouseHold(true);
              onChangeCell(
                parseInt(dataset.rowIndex),
                parseInt(dataset.colIndex)
              );
            }}
          >
            {grid.map((row, rowIndex) => (
              <div key={rowIndex} className="row">
                {row.map((isAlive, cellIndex) => (
                  <div
                    key={cellIndex}
                    data-row-index={rowIndex}
                    data-col-index={cellIndex}
                    className={`cell ${isAlive ? "alive" : ""}`}
                    onMouseEnter={() => {
                      if (turn !== 0 || !mouseHold) {
                        return;
                      }

                      onChangeCell(rowIndex, cellIndex);
                    }}
                  ></div>
                ))}
              </div>
            ))}
          </div>
        </MaterialGrid>
        <MaterialGrid item xs={6}>
          <div>
            <XYPlot width={700} height={300}>
              <HorizontalGridLines />
              <LineSeries color="green" data={chartData} />
              <XAxis title="Turn" />
              <YAxis title="Population" />
            </XYPlot>
          </div>
        </MaterialGrid>
      </MaterialGrid>
    </Container>
  );
}

export default App;
