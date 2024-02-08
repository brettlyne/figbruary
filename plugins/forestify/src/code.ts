type TreeNode =
  | BooleanOperationNode
  | ComponentNode
  | EllipseNode
  | FrameNode
  | GroupNode
  | InstanceNode
  | LineNode
  | PolygonNode
  | RectangleNode
  | ShapeWithTextNode
  | TextNode
  | VectorNode;

figma.showUI(__html__, { width: 320, height: 500 });

const getNodeArea = (node: any) => {
  return node.absoluteBoundingBox.width * node.absoluteBoundingBox.height;
};

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = (msg) => {
  if (msg.type === "add-trees") {
    const trees: Object = figma.currentPage.selection.reduce(
      (obj, item) => ({ ...obj, [item.id]: item.name }),
      {}
    );

    figma.ui.postMessage(
      JSON.stringify({
        msgType: "add-these-trees",
        trees: trees,
      })
    );
  }

  if (msg.type === "generate-forest") {
    const forest = msg.forest;

    if (figma.currentPage.selection.length !== 1) {
      figma.notify("Select a single frame to generate a forest in.");
      return;
    }

    if (figma.currentPage.selection[0]?.type !== "FRAME") {
      figma.notify("Selected destination must be a Frame node.");
      return;
    }

    if (forest.layeredPaperMode) {
      const hexTestReg = /^#([0-9a-f]{3}){1,2}$/i;
      if (!hexTestReg.test("#" + forest.paperColor)) {
        figma.notify("Invalid paper color: " + forest.paperColor);
        return;
      }
      if (!hexTestReg.test("#" + forest.fogColor)) {
        figma.notify("Invalid fog color: " + forest.fogColor);
        return;
      }
    }

    const nodes: TreeNode[] = [];
    for (const [key, value] of Object.entries(forest.trees)) {
      const node = figma.root.findOne((n) => n.id === key);
      if (
        node !== null &&
        (node.type === "COMPONENT" ||
          node.type === "ELLIPSE" ||
          node.type === "FRAME" ||
          node.type === "GROUP" ||
          node.type === "INSTANCE" ||
          node.type === "LINE" ||
          node.type === "POLYGON" ||
          node.type === "RECTANGLE" ||
          node.type === "SHAPE_WITH_TEXT" ||
          node.type === "TEXT" ||
          node.type === "VECTOR")
      ) {
        nodes.push(node);
      }
    }

    const frame = figma.currentPage.selection[0];
    const frameArea = getNodeArea(frame);
    const treeArea = nodes.reduce((acc, node) => acc + getNodeArea(node), 0);

    const minTreeCount = Object.keys(forest.trees).length;
    const maxTreeCount = Math.max(
      minTreeCount,
      6 * Math.floor(frameArea / treeArea)
    );
    let treeCount = Math.floor(
      (forest.density / 100) * (maxTreeCount - minTreeCount) + minTreeCount
    );

    // add more trees for perspective scaling
    treeCount = Math.floor(
      treeCount * Math.pow(1 + forest.perspectiveScaling / 100, 2)
    );

    const treeNodes = [];
    for (let i = 0; i < treeCount; i++) {
      const node = nodes[Math.floor(Math.random() * nodes.length)];
      // const clone = node.clone();
      let clone;
      if (node.type === "COMPONENT") {
        clone = node.createInstance();
      } else {
        clone = node.clone();
      }
      const [minScale, maxScale] = forest.scalingRange;
      const scale = minScale + Math.random() * (maxScale - minScale);
      clone.resize(clone.width * scale, clone.height * scale);
      const x = Math.random() * frame.width - clone.width / 2;
      const y = 0.2 + Math.random() * 0.8 * frame.height - clone.height / 2;
      clone.x = x;
      clone.y = y;
      treeNodes.push(clone);
    }

    if (forest.reduceOverlap) {
      const newNodes = [];
      for (let i = 0; i < treeNodes.length; i++) {
        const node = treeNodes[i];

        // split the frame into a 3x3 grid and place the node in the least overlapped cell
        // this is a compromise between performance and avoiding overlap
        // I looked into some packing algorithms, but the results are very inorganic looking
        const gridWidth = frame.width / 3;
        const gridHeight = frame.height / 3;
        const posWithinCell = {
          x: Math.random() * gridWidth - node.width / 2,
          y: Math.random() * gridHeight - node.height / 2,
        };

        // use a circle approximation of nodes for overlap avoidance
        const r1 = (node.width + node.height) / 4;

        const grid = Array(9).fill(0);
        for (let j = 0; j < 9; j++) {
          const row = Math.floor(j / 3);
          const col = j % 3;
          const dx = col * gridWidth + posWithinCell.x;
          const dy = row * gridHeight + posWithinCell.y;

          let overlap = 0;

          for (let k = 0; k < newNodes.length; k++) {
            const p2 = newNodes[k];
            const r2 = (p2.width + p2.height) / 4;
            const d = Math.abs(dx - p2.x) + Math.abs(dy - p2.y);
            if (d < r1 + r2) {
              overlap += r1 + r2 - d;
            }
          }
          grid[j] = overlap;
        }

        // where the 3x3 grid is indexed as follows:
        // 0 1 2
        // 3 4 5
        // 6 7 8
        // let's try the cells in this order: 4,5,6,1,0,3,8,7,2 so it looks more natural if very few trees
        const placementOrder = [4, 5, 6, 1, 0, 3, 8, 7, 2];
        let minOverlap = Infinity;
        let minIndex = 0;
        for (let j = 0; j < placementOrder.length; j++) {
          if (grid[placementOrder[j]] < minOverlap) {
            minOverlap = grid[placementOrder[j]];
            minIndex = placementOrder[j];
          }
        }

        const row = Math.floor(minIndex / 3);
        const col = minIndex % 3;
        const dx = col * gridWidth + posWithinCell.x;
        const dy = row * gridHeight + posWithinCell.y;

        node.x = dx;
        node.y = dy;

        newNodes.push(node);
      }
    }

    if (forest.perspectiveScaling > 1) {
      const minScale = forest.perspectiveScaling / 100;

      // perspective scaling is based on the y position
      for (let i = 0; i < treeNodes.length; i++) {
        const node = treeNodes[i];
        const yAsPercent = (node.y + node.height / 2) / frame.height;
        const redistributionExponent = 1 + forest.perspectiveScaling / 50;
        const newY =
          yAsPercent ** redistributionExponent * frame.height - node.height / 2;
        node.y = newY;

        const scale = 1 - minScale * (1 - yAsPercent);

        node.y += (node.height - scale * node.height) / 2;
        node.x += (node.width - scale * node.width) / 2;
        node.rescale(scale);
      }
    }

    treeNodes.sort((a, b) => a.y - b.y);
    for (let i = 0; i < treeNodes.length; i++) {
      frame.appendChild(treeNodes[i]);
    }
  }

  // figma.closePlugin();
};
