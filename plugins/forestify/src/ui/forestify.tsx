import React, { useState } from "react";
import ReactDOM from "react-dom";
import "./index.css";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import { cyan, orange } from "@mui/material/colors";

import SelectTrees from "./SelectTrees";
import GenerateForest from "./GenerateForest";

const theme = createTheme({
  palette: {
    primary: cyan,
    secondary: orange,
  },
});

const App = () => {
  const [appState, setAppState] = useState("adding-trees");
  const [trees, setTrees] = useState({});
  const [layeredPaperMode, setLayeredPaperMode] = React.useState(false);
  const [scalingRange, setScalingRange] = React.useState<number[]>([1, 1.2]);
  const [density, setDensity] = React.useState(50);
  const [perspectiveScaling, setPerspectiveScaling] = React.useState(50);
  const [avoidOverlap, setAvoidOverlap] = React.useState(true);
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
    avoidOverlap,
    setAvoidOverlap,
    paperColor,
    setPaperColor,
    fogColor,
    setFogColor,
    numPaperLayers,
    setNumPaperLayers,
  };

  onmessage = (event) => {
    const message = JSON.parse(event.data.pluginMessage);
    console.log("message:", message);

    if (message.msgType === "add-these-trees") {
      setTrees({ ...trees, ...message.trees });
    }
  };

  const generateForest = () => {
    // TODO: pass all forest settings to the plugin

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
            avoidOverlap,
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
