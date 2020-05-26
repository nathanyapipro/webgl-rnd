import React, { useEffect, useState } from "react";
import { TextField } from "@material-ui/core";
import "./App.css";

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 500;

function App() {
  const [wasmLoaded, setWasmLoaded] = useState(false);
  const [position, setPosition] = useState([200, 200]);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState([100, 100]);

  const width = scale[0];
  const height = scale[1];

  useEffect(() => {
    window.addEventListener("wasmLoaded", () => {
      console.log("WASM LOADED");
      setWasmLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (wasmLoaded) {
      window.Module.ccall(
        "init",
        null,
        ["number", "number"],
        [CANVAS_WIDTH, CANVAS_HEIGHT]
      );
    }
  }, [wasmLoaded]);

  const handlePositionXChange = (e) => {
    let value = parseFloat(e.target.value, 10) || 0;
    if (value < 0) {
      value = 0;
    }
    if (value > CANVAS_WIDTH) {
      value = 500;
    }
    setPosition([value, position[1]]);
    window.Module.ccall(
      "updateTranslation",
      null,
      ["number", "number"],
      [value, position[1]]
    );
  };

  const handlePositionYChange = (e) => {
    let value = parseFloat(e.target.value, 10) || 0;
    if (value < 0) {
      value = 0;
    }
    if (value > CANVAS_HEIGHT) {
      value = 500;
    }
    setPosition([position[0], value]);
    window.Module.ccall(
      "updateTranslation",
      null,
      ["number", "number"],
      [position[0], value]
    );
  };

  const handleRotationChange = (e) => {
    let value = parseInt(e.target.value, 10) || 0;
    if (value < 0) {
      value = 0;
    }
    if (value > 360) {
      value = 360;
    }
    setRotation(value);
    window.Module.ccall("updateRotation", null, ["number"], [value]);
  };

  const handleScaleXChange = (e) => {
    let value = parseInt(e.target.value, 10) || 0;
    if (isNaN(value)) {
      value = 0;
    }
    if (value < 0) {
      value = 0;
    }
    if (value > CANVAS_WIDTH) {
      value = 500;
    }
    const scaleX = value;

    setScale([scaleX, scale[1]]);
    window.Module.ccall(
      "updateScale",
      null,
      ["number", "number"],
      [scaleX, scale[1]]
    );
  };

  const handleScaleYChange = (e) => {
    let value = parseInt(e.target.value, 10);
    if (isNaN(value)) {
      value = 0;
    }

    if (value < 0) {
      value = 0;
    }
    if (value > CANVAS_WIDTH) {
      value = 500;
    }
    const scaleY = value;
    setScale([scale[0], scaleY]);
    window.Module.ccall(
      "updateScale",
      null,
      ["number", "number"],
      [scale[0], scaleY]
    );
  };

  if (!wasmLoaded) {
    return <noscript />;
  }

  return (
    <div className="App">
      <div className="content">
        <canvas id="scene" />
        <div className="controls">
          <TextField
            type="number"
            label="X"
            margin="normal"
            value={position[0]}
            onChange={handlePositionXChange}
          />
          <TextField
            type="number"
            label="Y"
            margin="normal"
            value={position[1]}
            onChange={handlePositionYChange}
          />

          <TextField
            type="number"
            label="Width"
            margin="normal"
            value={width}
            onChange={handleScaleXChange}
          />
          <TextField
            type="number"
            label="Height"
            margin="normal"
            value={height}
            onChange={handleScaleYChange}
          />

          <TextField
            type="number"
            label="Rotation (deg)"
            margin="normal"
            value={rotation}
            onChange={handleRotationChange}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
