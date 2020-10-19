import {
  Button,
  Grid as MaterialGrid,
  Link,
  Slider,
  Snackbar,
  Typography,
} from "@material-ui/core";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import useInterval from "@use-it/interval";
import copy from "copy-to-clipboard";
import React, { useEffect, useRef, useState } from "react";
import {
  HorizontalGridLines,
  LineSeries,
  XAxis,
  XYPlot,
  YAxis,
} from "react-vis";
import "./App.scss";
import {
  countLiving,
  decodeGrid,
  depopulateGrid,
  encodeGrid,
  generateGrid,
  Grid,
  Settings,
  takeTurn,
} from "./game-of-life";

type MouseHold = "alive" | "dead" | null;

const DEFAULT_WIDTH = 60;
const DEFAULT_HEIGHT = 20;
const DEFAULT_DELAY = 300;
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
  const [populationHistory, setPopulationHistory] = useState<number[]>([
    countLiving(grid),
  ]);
  const [delay, setDelay] = useState<number>(DEFAULT_DELAY);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [mouseHold, setMouseHold] = useState<MouseHold>(null);
  const [toast, setToast] = useState<boolean>(false);

  const firstUpdate = useRef(true);
  const chartData = populationHistory.map((count, index) => ({
    x: index,
    y: count,
  }));

  const settings: Settings = {
    width,
    height,
    gridString: encodeGrid(history[0]),
  };

  useInterval(() => {
    if (isActive) {
      const nextGrid = takeTurn(grid);
      setHistory([...history, nextGrid]);
      setPopulationHistory([...populationHistory, countLiving(nextGrid)]);
      setGrid(nextGrid);
      setTurn(turn + 1);
    }
  }, delay);

  const encodedSettings = encodeURIComponent(JSON.stringify(settings));

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

    const settings: Settings = JSON.parse(decodeURIComponent(url));
    const grid = decodeGrid(settings);

    setHeight(settings.height);
    setWidth(settings.width);
    setGrid(grid);
    setPopulationHistory([countLiving(grid)]);
    setHistory([grid]);
  }, []);

  const onChangeCell = (
    rowIndex: number,
    colIndex: number,
    value: "alive" | "dead"
  ) => {
    grid[rowIndex][colIndex] = value === "alive" ? true : false;
    setGrid([...grid]);
    setHistory([grid]);
    setPopulationHistory([countLiving(grid)]);
  };

  const randomDistribution = (height: number, width: number) => {
    const grid = generateGrid(width, height);
    setGrid(grid);
    setHistory([grid]);
    setPopulationHistory([countLiving(grid)]);
  };

  const onDepopulateGrid = () => {
    const depopulatedGrid = depopulateGrid(grid);
    setGrid(depopulatedGrid);
    setHistory([depopulatedGrid]);
    setPopulationHistory([countLiving(depopulatedGrid)]);
  };

  const onResetGrid = () => {
    const grid = history[0];
    setGrid(grid);
    setHistory([grid]);
    setPopulationHistory([countLiving(grid)]);
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
    setPopulationHistory(populationHistory.slice(0, turn + 1));
  };

  const onStop = () => {
    setIsActive(false);
  };

  const isInitialState = history.length === 1;

  return (
    <div
      onMouseUp={() => {
        setMouseHold(null);
      }}
    >
      <Snackbar
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={toast}
        autoHideDuration={3000}
        onClose={() => setToast(false)}
        message="Grid link copied to clipboard"
      />
      <div className="mobile-only">
        This is better viewed on a large screen. Sorry!
      </div>
      <MaterialGrid container spacing={5}>
        <MaterialGrid item xs={3}>
          <h1>Conway's Game of Life</h1>
          <div>
            <Link href="https://tomontheinternet.com">Tom on the Internet</Link>
          </div>
        </MaterialGrid>
        <MaterialGrid item xs={2}>
          <Button
            variant="contained"
            color="primary"
            disabled={isActive}
            onClick={onStart}
          >
            Start
          </Button>
          <Button disabled={!isActive} onClick={onStop}>
            Stop
          </Button>
          <Button disabled={turn === 0 || isActive} onClick={onResetGrid}>
            Reset
          </Button>
          <Button
            disabled={turn !== 0}
            onClick={() => randomDistribution(height, width)}
          >
            Random
          </Button>
          <Button disabled={turn !== 0} onClick={onDepopulateGrid}>
            Depopulate
          </Button>
          {window.location.pathname.replace(/\//, "") && (
            <Button
              onClick={() => {
                copy(window.location.href);
                setToast(true);
              }}
            >
              Share this grid
            </Button>
          )}
        </MaterialGrid>
        <MaterialGrid item xs={2}>
          <Typography gutterBottom>Turn Delay (ms)</Typography>
          <Slider
            aria-labelledby="discrete-slider"
            valueLabelDisplay="auto"
            min={50}
            max={1000}
            step={50}
            onChange={(_, newDelay) => {
              if (Array.isArray(newDelay)) {
                return;
              }
              setDelay(newDelay);
            }}
            value={delay}
          />
          <Typography gutterBottom>Width</Typography>
          <Slider
            disabled={!isInitialState}
            aria-labelledby="discrete-slider"
            valueLabelDisplay="auto"
            min={MIN_WIDTH}
            max={MAX_WIDTH}
            step={1}
            onChange={(_, newWidth) => {
              if (Array.isArray(newWidth)) {
                return;
              }
              setWidth(newWidth);
              randomDistribution(height, newWidth);
            }}
            value={width}
          />
          <Typography gutterBottom>Height</Typography>
          <Slider
            disabled={!isInitialState}
            aria-labelledby="discrete-slider"
            valueLabelDisplay="auto"
            min={MIN_HEIGHT}
            max={MAX_HEIGHT}
            step={1}
            onChange={(_, newHeight) => {
              if (Array.isArray(newHeight)) {
                return;
              }
              setHeight(newHeight);
              randomDistribution(newHeight, width);
            }}
            value={height}
          />
        </MaterialGrid>
        <MaterialGrid item xs={5}>
          <XYPlot width={325} height={150}>
            <HorizontalGridLines />
            <LineSeries color="green" data={chartData} />
            <XAxis title="Turn" />
            <YAxis title="Population" />
          </XYPlot>
          <div>
            <Button
              disabled={isActive || turn === 0}
              onClick={() => jumpToTurn(turn - 1)}
              startIcon={<ArrowBackIcon />}
            >
              Prev
            </Button>
            {turn}
            <Button
              disabled={isActive || turn === history.length - 1}
              onClick={() => jumpToTurn(turn + 1)}
              endIcon={<ArrowForwardIcon />}
            >
              Next
            </Button>
          </div>
        </MaterialGrid>
      </MaterialGrid>
      <MaterialGrid container>
        <MaterialGrid item xs>
          <div
            style={{ userSelect: "none" }}
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

              const rowIndex = parseInt(dataset.rowIndex);
              const colIndex = parseInt(dataset.colIndex);

              const value = grid[rowIndex][colIndex] ? "dead" : "alive";
              setMouseHold(value);
              onChangeCell(rowIndex, colIndex, value);
            }}
          >
            {grid.map((row, rowIndex) => (
              <div key={rowIndex} style={{ display: "flex" }}>
                {row.map((isAlive, colIndex) => (
                  <div
                    style={{
                      border: "solid 1px grey",
                      height: "20px",
                      width: "20px",
                      backgroundColor: isAlive ? "green" : "inherit",
                    }}
                    key={colIndex}
                    data-row-index={rowIndex}
                    data-col-index={colIndex}
                    onMouseEnter={() => {
                      if (turn !== 0 || mouseHold === null) {
                        return;
                      }

                      onChangeCell(rowIndex, colIndex, mouseHold);
                    }}
                  ></div>
                ))}
              </div>
            ))}
          </div>
        </MaterialGrid>
      </MaterialGrid>
    </div>
  );
}

export default App;
