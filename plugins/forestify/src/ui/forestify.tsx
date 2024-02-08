import React, { useState } from "react";
import ReactDOM from "react-dom";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import { green, orange } from "@mui/material/colors";

import randomGrid from "../randomGrid";
import "./index.css";

import SelectTrees from "./SelectTrees";
import GenerateForest from "./GenerateForest";

const theme = createTheme({
  palette: {
    primary: green,
    secondary: orange,
  },
});

const App = () => {
  const [appState, setAppState] = useState("adding-trees");
  const [trees, setTrees] = useState({});
  const [layeredPaperMode, setLayeredPaperMode] = React.useState(false);
  const [scalingRange, setScalingRange] = React.useState<number[]>([0.8, 1.2]);
  const [density, setDensity] = React.useState(50);
  const [perspectiveScaling, setPerspectiveScaling] = React.useState(0);
  const [distributionRandomness, setDistributionRandomness] = React.useState(9);
  const [paperColor, setPaperColor] = React.useState("44561F");
  const [fogColor, setFogColor] = React.useState("FFFFFF");
  const [numPaperLayers, setNumPaperLayers] = React.useState(3);

  const forest = {
    trees,
    setTrees,
    scalingRange,
    setScalingRange,
    layeredPaperMode,
    setLayeredPaperMode,
    density,
    setDensity,
    perspectiveScaling,
    setPerspectiveScaling,
    distributionRandomness,
    setDistributionRandomness,
    paperColor,
    setPaperColor,
    fogColor,
    setFogColor,
    numPaperLayers,
    setNumPaperLayers,
  };

  onmessage = (event) => {
    const message = JSON.parse(event.data.pluginMessage);

    if (message.msgType === "add-these-trees") {
      setTrees({ ...trees, ...message.trees });
    }

    // doing this in UI bc d3 doesn't work in figma code environment
    if (message.msgType === "calculate-tree-locations") {
      const { treeCount, width, height } = message;
      const locations = randomGrid(
        width,
        height,
        treeCount,
        10 - distributionRandomness
      );
      parent.postMessage(
        { pluginMessage: { type: "use-these-locations", locations } },
        "*"
      );
    }
  };

  const generateForest = () => {
    parent.postMessage(
      {
        pluginMessage: {
          type: "generate-forest",
          forest: {
            trees,
            scalingRange,
            layeredPaperMode,
            density,
            perspectiveScaling,
            distributionRandomness,
            paperColor,
            fogColor,
            numPaperLayers,
          },
        },
      },
      "*"
    );
  };

  return (
    <>
      {appState === "adding-trees" ? (
        <SelectTrees
          setAppState={setAppState}
          trees={trees}
          setTrees={setTrees}
        />
      ) : null}

      {appState === "generating-forest" ? (
        <GenerateForest
          setAppState={setAppState}
          forest={forest}
          generateForest={generateForest}
        />
      ) : null}
    </>
  );
};

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <App />
  </ThemeProvider>,
  document.getElementById("root")
);
