import React from "react";
import Button from "@mui/material/Button";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Slider from "@mui/material/Slider";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputAdornment from "@mui/material/InputAdornment";

const scalingMarks = [
  {
    value: 0.1,
    label: ".1x",
  },
  {
    value: 0.5,
    label: ".5x",
  },
  {
    value: 1,
    label: "1x",
  },
  {
    value: 2,
    label: "2x",
  },
  {
    value: 3,
    label: "3x",
  },
  {
    value: 4,
    label: "4x",
  },
];

const GenerateForest = ({ setAppState, forest, generateForest }) => {
  return (
    <>
      <div className="container">
        <Button
          size="small"
          onClick={() => {
            setAppState("adding-trees");
          }}
          startIcon={<ArrowBackIcon />}
        >
          back to selecting trees
        </Button>

        {/* <ToggleButtonGroup
          style={{ marginTop: "1rem", marginBottom: ".25rem" }}
          value={mode}
          color="primary"
          exclusive
          onChange={(event, newMode) => {
            if (newMode) {
              setMode(newMode as string);
            }
          }}
          aria-label="Mode"
          size="small"
        >
          <ToggleButton value="normal">normal</ToggleButton>
          <ToggleButton value="layered">layered</ToggleButton>
        </ToggleButtonGroup> */}

        <p className="input-label">
          min/max random scaling ({forest.scalingRange[0]}x to{" "}
          {forest.scalingRange[1]}x)
        </p>
        <div className="slider-container">
          <Slider
            aria-label="scaling range"
            step={0.1}
            valueLabelDisplay="auto"
            marks={scalingMarks}
            min={0.1}
            max={4}
            size="small"
            value={forest.scalingRange}
            onChange={(event, newValue) => {
              forest.setScalingRange(newValue as number[]);
            }}
          />
        </div>

        <p className="input-label">density</p>
        <div className="slider-container">
          <Slider
            size="small"
            value={forest.density}
            onChange={(event, newValue) => {
              forest.setDensity(newValue as number);
            }}
          />
        </div>

        <p className="input-label">
          perspective scaling (distant trees are smaller)
        </p>
        <div className="slider-container">
          <Slider
            size="small"
            value={forest.perspectiveScaling}
            onChange={(event, newValue) => {
              forest.setPerspectiveScaling(newValue as number);
            }}
          />
        </div>

        <p style={{ marginBottom: "0" }}>
          <Checkbox
            checked={forest.avoidOverlap}
            onChange={(event) => {
              forest.setAvoidOverlap(event.target.checked);
            }}
            style={{ marginLeft: "-.75rem" }}
            id="avoidOverlapCheck"
          />
          <label htmlFor="avoidOverlapCheck">avoid overlapping trees</label>
        </p>

        <p>
          <Checkbox
            checked={forest.layeredPaperMode}
            onChange={(event) => {
              forest.setLayeredPaperMode(event.target.checked);
            }}
            style={{ marginLeft: "-.75rem" }}
            id="paperCheck"
          />
          <label htmlFor="paperCheck">layered paper mode</label>
        </p>

        {forest.layeredPaperMode ? (
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <FormControl sx={{ width: "14ch", marginTop: ".5rem" }}>
              <InputLabel htmlFor="color-1">paper color</InputLabel>
              <OutlinedInput
                id="color-1"
                startAdornment={
                  <InputAdornment position="start">#</InputAdornment>
                }
                label="paper color"
                value={forest.paperColor}
                onChange={(event) => {
                  forest.setPaperColor(event.target.value);
                }}
              />
            </FormControl>
            <FormControl sx={{ width: "14ch", marginTop: ".5rem" }}>
              <InputLabel htmlFor="color-2">fog color</InputLabel>
              <OutlinedInput
                id="color-2"
                startAdornment={
                  <InputAdornment position="start">#</InputAdornment>
                }
                label="fog color"
                value={forest.fogColor}
                onChange={(event) => {
                  forest.setFogColor(event.target.value);
                }}
              />
            </FormControl>
            <FormControl sx={{ width: "8ch", marginTop: ".5rem" }}>
              <InputLabel htmlFor="outlined-adornment-amount">
                layers
              </InputLabel>
              <OutlinedInput
                type="number"
                id="outlined-adornment-amount"
                label="layers"
                value={forest.numPaperLayers}
                onChange={(event) => {
                  forest.setNumPaperLayers(
                    Math.max(1, parseInt(event.target.value))
                  );
                }}
              />
            </FormControl>
          </div>
        ) : null}
      </div>
      <footer>
        <Button
          size="small"
          variant="contained"
          onClick={() => {
            generateForest();
          }}
        >
          generate forest
        </Button>
      </footer>
    </>
  );
};

export default GenerateForest;
