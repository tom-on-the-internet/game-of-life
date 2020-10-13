import React, { useState, useEffect } from "react";
import useInterval from "@use-it/interval";

import "./App.scss";
import { generateGrid, Grid, takeTurn } from "./game-of-life";

const GRID_SIZE = 50;
const initialGrid = generateGrid(GRID_SIZE);

function App() {
  const [grid, setGrid] = useState<Grid>(initialGrid);
  const [turn, setTurn] = useState<number>(1);

  useInterval(() => {
    setGrid(takeTurn(grid));
    setTurn(turn + 1);
  }, 100);

  console.log("rendering");

  return (
    <>
      <h2>Turn #: {turn}</h2>
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
