import React, { useRef, useEffect, useState } from "react";

import { makeStyles } from "@material-ui/core";
import { Engine } from "./engine/Engine";

const useGlobalStyles = makeStyles({
  "@global": {
    html: {
      height: "100%",
      width: "100%",
      display: "flex",
      flex: 1,
    },
    body: {
      display: "flex",
      flex: 1,
      padding: 0,
      margin: 0,
    },
    "#root": {
      display: "flex",
      height: "100%",
      width: "100%",
    },
  },
});

const useStyles = makeStyles({
  root: {
    display: "flex",
    flex: 1,
  },
  canvas: {
    display: "block",
    height: "100vh",
    width: "100vw",
    border: `2px solid black`,
    borderRadius: 4,
  },
});

function App() {
  useGlobalStyles();
  const classes = useStyles();
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const [engine, setEngine] = useState<Engine | undefined>();

  useEffect(() => {
    if (drawingCanvasRef && drawingCanvasRef.current && !engine) {
      setEngine(new Engine(drawingCanvasRef.current));
    }
  }, [drawingCanvasRef, engine]);

  return (
    <div className={classes.root}>
      <canvas
        id="drawing-canvas"
        className={classes.canvas}
        ref={drawingCanvasRef}
      />
    </div>
  );
}

export default App;
