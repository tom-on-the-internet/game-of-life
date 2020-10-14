import React, { useState } from "react";
import useInterval from "@use-it/interval";

import "./App.scss";
import { generateGrid, Grid, takeTurn } from "./game-of-life";

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

  useInterval(() => {
    if (isActive) {
      const nextGrid = takeTurn(grid);
      setHistory([...history, nextGrid]);
      setGrid(nextGrid);
      setTurn(turn + 1);
    }
  }, delay);

  const onSetHeight = (height: number) => {
    let newHeight = height;

    if (newHeight < MIN_HEIGHT) {
      newHeight = MIN_HEIGHT;
    }

    if (newHeight > MAX_HEIGHT) {
      newHeight = MAX_HEIGHT;
    }

    setHeight(newHeight);
    reinitialize(newHeight, width);
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
    reinitialize(height, newWidth);
  };

  const reinitialize = (height: number, width: number) => {
    const grid = generateGrid(width, height);
    setGrid(grid);
    setHistory([grid]);
    setTurn(0);
    setIsActive(false);
  };

  const isInitialState = history.length === 1;

  return (
    <>
      <h1>Conway's Game of Life</h1>
      <h2>Implemented by Tom on the Internet</h2>
      <div>
        <div>
          <button onClick={() => setIsActive(true)}>Start</button>
          <button onClick={() => setIsActive(false)}>Stop</button>
          <button onClick={() => reinitialize(height, width)}>
            Reinitialize
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
        <div>Turn #: {turn} </div>
      </div>

      <div className="grid">
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="row">
            {row.map((isAlive, cellIndex) => (
              <div
                key={cellIndex}
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
