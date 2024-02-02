import React from "react";
import Button from "@mui/material/Button";

const SelectTrees = ({ setAppState, trees, setTrees }) => {
  return (
    <>
      <div className="container">
        <p style={{ marginTop: ".5rem" }}>
          Forestify creates a forest from a set of trees.
        </p>
        <p style={{ marginTop: ".5rem" }}>
          Or more generically, it distributes copies of nodes randomly inside a
          selected Frame, with options to specify randomized scaling,
          perspective scaling, density, and more.
        </p>

        <p className="input-label">selected trees</p>
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
        <div style={{ textAlign: "right" }}>
          <Button
            size="small"
            onClick={() => {
              setTrees({});
            }}
          >
            reset
          </Button>{" "}
          <Button
            size="small"
            variant="outlined"
            onClick={() => {
              parent.postMessage({ pluginMessage: { type: "add-trees" } }, "*");
            }}
          >
            add selected as trees
          </Button>
        </div>
      </div>
      <footer>
        <Button
          disabled={Object.keys(trees).length === 0}
          size="small"
          variant="contained"
          onClick={() => {
            setAppState("generating-forest");
          }}
        >
          next
        </Button>
      </footer>
    </>
  );
};

export default SelectTrees;
