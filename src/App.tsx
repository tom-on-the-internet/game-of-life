import React, { useState, useEffect, useRef } from "react";
import useInterval from "@use-it/interval";
import Emoji from "a11y-react-emoji";

import "./App.scss";
import { generateGrid, Grid, takeTurn, depopulateGrid } from "./game-of-life";

type Settings = { width: number; height: number; grid: Grid };

const DEFAULT_WIDTH = 30;
const DEFAULT_HEIGHT = 15;
const DEFAULT_DELAY = 100;
const MIN_HEIGHT = 3;
const MIN_WIDTH = 3;
const MAX_HEIGHT = 100;
const MAX_WIDTH = 200;

function App() {
  const [width, setWidth] = useState<number>(DEFAULT_WIDTH);
  const [height, setHeight] = useState<number>(DEFAULT_HEIGHT);
  const [grid, setGrid] = useState<Grid>(generateGrid(width, height));
  const [turn, setTurn] = useState<number>(0);
  const [history, setHistory] = useState<Grid[]>([grid]);
  const [delay, setDelay] = useState<number>(DEFAULT_DELAY);
  const [isActive, setIsActive] = useState<boolean>(false);
  const firstUpdate = useRef(true);

  const settings: Settings = { width, height, grid: history[0] };
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
    setHeight(settings.height);
    setWidth(settings.width);
    setGrid(settings.grid);
    setHistory([settings.grid]);
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

  const onClickCell = (rowIndex: number, colIndex: number) => {
    grid[rowIndex][colIndex] = !grid[rowIndex][colIndex];
    setGrid([...grid]);
  };

  const randomDistribution = (height: number, width: number) => {
    const grid = generateGrid(width, height);
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
    <>
      <h1>Conway's Game of Life</h1>
      <h2>Implemented by Tom on the Internet</h2>
      <div>
        <div>
          <button disabled={isActive} onClick={onStart}>
            Start
          </button>
          <button disabled={!isActive} onClick={onStop}>
            Stop
          </button>
        </div>
        <div>
          <button
            disabled={isActive}
            onClick={() => {
              const depopulatedGrid = depopulateGrid(grid);
              setGrid(depopulatedGrid);
              setHistory([depopulatedGrid]);
            }}
          >
            Depopulate
          </button>
          <button
            disabled={isActive}
            onClick={() => randomDistribution(height, width)}
          >
            Random Distribution
          </button>
        </div>
        <div>
          <label>
            Delay (ms):
            <input
              value={delay.toString()}
              onChange={(event) =>
                setDelay(parseInt(event.target.value.replace(/\D/, "")))
              }
              type="number"
            />
          </label>
        </div>
        <div>
          <label>
            Height:
            <input
              disabled={!isInitialState}
              value={height.toString()}
              onChange={(event) => {
                let height = parseInt(event.target.value.replace(/\D/, ""));

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
                let width = parseInt(event.target.value.replace(/\D/, ""));

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

      <div
        className="grid"
        onClick={(event: any) => {
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

          onClickCell(parseInt(dataset.rowIndex), parseInt(dataset.colIndex));
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
              ></div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

export default App;
