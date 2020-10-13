import React, { useState } from "react";
import useInterval from "@use-it/interval";

import "./App.scss";
import { generateGrid, Grid, takeTurn } from "./game-of-life";

const GRID_WIDTH = 100;
const GRID_HEIGHT = 50;
const DELAY = 100;

function App() {
  const [grid, setGrid] = useState<Grid>(generateGrid(GRID_HEIGHT, GRID_WIDTH));
  const [turn, setTurn] = useState<number>(1);
  const [delay, setDelay] = useState<number>(DELAY);
  const [isActive, setIsActive] = useState<boolean>(false);

  useInterval(() => {
    if (isActive) {
      setGrid(takeTurn(grid));
      setTurn(turn + 1);
    }
  }, delay);

  return (
    <>
      <div>
        Turn #: {turn} <button onClick={() => setIsActive(true)}>Start</button>
        <button onClick={() => setIsActive(false)}>Stop</button>
        <input
          value={delay.toString()}
          onChange={(event) =>
            setDelay(parseInt(event.target.value.replace(/\D/, "")))
          }
          type="number"
        />
      </div>

      <div className="grid">
        {grid.map((row) => (
          <div className="row">
            {row.map((isAlive) => (
              <div className={`cell ${isAlive ? "alive" : ""}`}></div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

export default App;
