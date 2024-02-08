import React from "react";
import Button from "@mui/material/Button";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Slider from "@mui/material/Slider";

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

        <p className="input-label">distribution randomness</p>
        <div className="slider-container">
          <Slider
            size="small"
            valueLabelDisplay="auto"
            min={0}
            max={10}
            step={1}
            value={forest.distributionRandomness}
            onChange={(event, newValue) => {
              forest.setDistributionRandomness(newValue as number);
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

        <div className="info">
          <p>Forests will take a while to grow when:</p>
          <ul>
            <li>target frame is large</li>
            <li>trees are small</li>
            <li>density is high</li>
            <li>perspective scaling is high</li>
            <li>randomness is low</li>
          </ul>
        </div>
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
