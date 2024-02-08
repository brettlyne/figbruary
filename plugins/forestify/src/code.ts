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

figma.showUI(__html__, { width: 320, height: 540 });

const getNodeArea = (node: any) => {
  return node.absoluteBoundingBox.width * node.absoluteBoundingBox.height;
};

// will need access to these after we get the locations from the UI
let treeNodes: TreeNode[] = [];
let targetFrame: FrameNode;
let forest: any = {};

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
    forest = msg.forest;

    if (figma.currentPage.selection.length !== 1) {
      figma.notify("Select a single frame to generate a forest in.");
      return;
    }

    if (figma.currentPage.selection[0]?.type !== "FRAME") {
      figma.notify("Selected destination must be a Frame node.");
      return;
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

    targetFrame = figma.currentPage.selection[0];
    const frameArea = getNodeArea(targetFrame);
    const treeArea = nodes.reduce((acc, node) => acc + getNodeArea(node), 0);
    const [minScale, maxScale] = forest.scalingRange;

    const minTreeCount = Object.keys(forest.trees).length;
    const averageScaling = (minScale + maxScale) / 2;
    const maxTreeCount = Math.max(
      minTreeCount,
      2 * Math.floor(frameArea / (treeArea * averageScaling))
    );
    let treeCount = Math.floor(
      (forest.density / 100) * (maxTreeCount - minTreeCount) + minTreeCount
    );

    // add more trees for perspective scaling
    treeCount = Math.floor(
      treeCount * Math.pow(1 + forest.perspectiveScaling / 100, 2)
    );

    treeNodes = [];
    for (let i = 0; i < treeCount; i++) {
      const node = nodes[Math.floor(Math.random() * nodes.length)];
      let clone;
      if (node.type === "COMPONENT") {
        clone = node.createInstance();
      } else {
        clone = node.clone();
      }
      const scale = minScale + Math.random() * (maxScale - minScale);
      clone.resize(clone.width * scale, clone.height * scale);

      const x = Math.random() * targetFrame.width - clone.width / 2;
      const y =
        0.2 + Math.random() * 0.8 * targetFrame.height - clone.height / 2;
      clone.x = x;
      clone.y = y;

      treeNodes.push(clone);
    }

    figma.ui.postMessage(
      JSON.stringify({
        msgType: "calculate-tree-locations",
        treeCount,
        width: targetFrame.width,
        height: targetFrame.height,
      })
    );
  }

  if (msg.type === "use-these-locations") {
    const locations = msg.locations;
    if (locations.length !== treeNodes.length) {
      figma.notify(
        `Expected ${treeNodes.length} locations, but got ${locations.length}.`
      );
      return;
    }

    for (let i = 0; i < treeNodes.length; i++) {
      const node = treeNodes[i];
      const [x, y] = locations[i];
      node.x = x - node.width / 2;
      node.y = y - node.height / 2;
    }

    if (forest.perspectiveScaling > 1) {
      const minScale = forest.perspectiveScaling / 100;

      // perspective scaling is based on the y position
      for (let i = 0; i < treeNodes.length; i++) {
        const node = treeNodes[i];
        const yAsPercent = (node.y + node.height / 2) / targetFrame.height;
        const redistributionExponent = 1 + forest.perspectiveScaling / 100;
        const newY =
          yAsPercent ** redistributionExponent * targetFrame.height -
          node.height / 2;
        node.y = newY;

        const scale = 1 - minScale * (1 - yAsPercent);

        node.y += (node.height - scale * node.height) / 2;
        node.x += (node.width - scale * node.width) / 2;
        node.resize(
          Math.max(0.01, node.width * scale),
          Math.max(0.01, node.height * scale)
        );
      }
    }

    treeNodes.sort((a, b) => a.y - b.y);
    for (let i = 0; i < treeNodes.length; i++) {
      targetFrame.appendChild(treeNodes[i]);
    }
  }

  // figma.closePlugin();
};
