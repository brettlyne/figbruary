import React, { useState } from "react";
import ReactDOM from "react-dom";
import "./index.css";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import { cyan, orange } from "@mui/material/colors";

import Button from "@mui/material/Button";

import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

const theme = createTheme({
  palette: {
    primary: cyan,
    secondary: orange,
  },
});

const App = () => {
  const [appState, setAppState] = useState("adding-trees");

  const [mode, setMode] = useState("normal");
  const [trees, setTrees] = useState({});

  onmessage = (event) => {
    const message = JSON.parse(event.data.pluginMessage);
    console.log("message:", message);

    if (message.msgType === "add-these-trees") {
      setTrees({ ...trees, ...message.trees });
    }
  };

  const changeMode = (
    event: React.MouseEvent<HTMLElement>,
    newPlatform: string
  ) => {
    console.log(newPlatform);
    setMode(newPlatform);
  };

  return (
    <>
      <p>Forestify creates a forest from a set of trees. </p>
      <ul className="trees">
        {Object.keys(trees).length === 0 ? (
          <li className="info">
            <p>Start by adding one more trees to continue.</p>
            <p>
              Select the desired layers then click the "add selected as trees"
              button.
            </p>
          </li>
        ) : (
          Object.keys(trees).map((id) => <li>{trees[id]}</li>)
        )}
      </ul>
      <Button
        size="small"
        variant="outlined"
        onClick={() => {
          parent.postMessage({ pluginMessage: { type: "add-trees" } }, "*");
        }}
      >
        add selected as trees
      </Button>{" "}
      <Button
        size="small"
        onClick={() => {
          setTrees({});
        }}
      >
        reset
      </Button>
      <ToggleButtonGroup
        value={mode}
        color="primary"
        exclusive
        onChange={changeMode}
        aria-label="Mode"
        size="small"
      >
        <ToggleButton value="normal">normal</ToggleButton>
        <ToggleButton value="layered">layered</ToggleButton>
      </ToggleButtonGroup>
    </>
  );
};

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <App />
  </ThemeProvider>,
  document.getElementById("root")
);
