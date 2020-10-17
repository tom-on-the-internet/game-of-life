import {
  Button,
  ButtonGroup,
  Container,
  Grid as MaterialGrid,
  Slider,
  Typography,
  Link,
} from "@material-ui/core";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import useInterval from "@use-it/interval";
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
  depopulateGrid,
  generateGrid,
  Grid,
  takeTurn,
  encodeGrid,
  decodeGrid,
  Settings,
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

  const encodedSettings = btoa(JSON.stringify(settings));

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
  };

  const onStop = () => {
    setIsActive(false);
  };

  const isInitialState = history.length === 1;

  return (
    <Container
      maxWidth="xl"
      onMouseUp={() => {
        setMouseHold(null);
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1>Conway's Game of Life</h1>
        <Link href="https://tomontheinternet.com">Tom on the Internet</Link>
      </div>
      <MaterialGrid container spacing={3} direction="row" justify="center">
        <MaterialGrid item xs={4}>
          <MaterialGrid container spacing={3} direction="row" justify="center">
            <MaterialGrid item xs={6}>
              <ButtonGroup
                variant="contained"
                color="default"
                aria-label="contained primary button group"
              >
                <Button
                  disabled={turn !== 0}
                  onClick={() => randomDistribution(height, width)}
                >
                  Random
                </Button>
                <Button disabled={turn !== 0} onClick={onDepopulateGrid}>
                  Depopulate
                </Button>
              </ButtonGroup>
            </MaterialGrid>
            <MaterialGrid item xs={6}>
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
                <Button disabled={turn === 0 || isActive} onClick={onResetGrid}>
                  Reset
                </Button>
              </ButtonGroup>
            </MaterialGrid>
          </MaterialGrid>
          <div>
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
          </div>
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
        <MaterialGrid item xs={4}>
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
        <MaterialGrid item xs={4}>
          <XYPlot width={225} height={150}>
            <HorizontalGridLines />
            <LineSeries color="green" data={chartData} />
            <XAxis title="Turn" />
            <YAxis title="Population" />
          </XYPlot>
        </MaterialGrid>
      </MaterialGrid>
      <MaterialGrid container direction="row" justify="center">
        <MaterialGrid item xs className="grid">
          <div
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
              const cellIndex = parseInt(dataset.colIndex);

              const value = grid[rowIndex][cellIndex] ? "dead" : "alive";
              setMouseHold(value);
              onChangeCell(rowIndex, cellIndex, value);
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
                      if (turn !== 0 || mouseHold === null) {
                        return;
                      }

                      onChangeCell(rowIndex, cellIndex, mouseHold);
                    }}
                  ></div>
                ))}
              </div>
            ))}
          </div>
        </MaterialGrid>
      </MaterialGrid>
    </Container>
  );
}

export default App;
