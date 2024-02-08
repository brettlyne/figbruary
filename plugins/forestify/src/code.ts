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

figma.showUI(__html__, { width: 320, height: 420 });

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
      //   const newLocations = getRandomGrid(frame.width, frame.height, treeCount);
      //   console.log("treeCount: ", treeCount);
      //   console.log("newLocations: ", newLocations);
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
