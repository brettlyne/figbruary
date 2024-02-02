// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

// This shows the HTML page in "ui.html".
figma.showUI(__html__, { width: 320, height: 500 });

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = (msg) => {
  if (msg.type === "add-trees") {
    console.log("add-trees");
    console.log(figma.currentPage.selection);
    // const trees: Object[] = figma.currentPage.selection.map((node) => ({
    //   id: node.id,
    //   name: node.name,
    // }));
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
    if (figma.currentPage.selection.length !== 1) {
      figma.notify("Select a single frame to generate a forest in.");
      return;
    }

    if (figma.currentPage.selection[0]?.type !== "FRAME") {
      figma.notify("Selected destination must be a Frame node.");
    }

    // TODO: generate the forest!
  }

  // figma.closePlugin();
};
