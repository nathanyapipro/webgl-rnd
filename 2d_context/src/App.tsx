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
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  canvas: {
    display: "flex",
    flex: 0,
    height: 600,
    wdth: 600,
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
      console.log("create engine");
    }
  }, [drawingCanvasRef, engine]);

  useEffect(() => {
    if (engine) {
      engine.draw();
    }
  }, [engine]);

  return (
    <div className={classes.root}>
      <canvas
        id="drawing-canvas"
        height="600"
        width="600"
        className={classes.canvas}
        ref={drawingCanvasRef}
      />
    </div>
  );
}

export default App;
