import * as go from "gojs";
import { Inspector } from "./DataInspector.js";
export class EditorHelper {
  constructor(diagramsCount, palettesCount, diagramsType, JQUERY) {
    if (diagramsType === null || !diagramsType) {
      diagramsType = go.Diagram;
    }
    JQUERY = JQUERY;
    // build diagrams
    const $ = go.GraphObject.make; // for conciseness in defining templates
    this.diagrams = [];
    this.overviews = [];
    const editorHelper = this;
    for (let i = 0; i < diagramsCount; i++) {
      const diagram = new diagramsType("ge-diagram-" + i); // create a Diagram for the DIV HTML element
      diagram.undoManager.isEnabled = true;
      // When diagram is modified, change title to include a *
      diagram.addChangedListener(function (e) {
        // maybe update the file header
        const currentFile = document.getElementById("ge-filename");
        if (currentFile) {
          const idx = currentFile.textContent.indexOf("*");
          if (e.diagram.isModified) {
            if (idx < 0)
              currentFile.textContent = currentFile.textContent + "*";
          } else {
            if (idx >= 0)
              currentFile.textContent = currentFile.textContent.slice(0, idx);
          }
        }
      });
      this.diagrams[i] = diagram;
      // make an overview for each diagram
      const overview = new go.Overview("ge-overview-" + i, {
        observed: diagram,
      });
      this.overviews[i] = overview;
    }
    // if there are no diagrams, there will be no overviews, so do not list that option in View menu
    if (diagramsCount < 1) {
      const viewOverviewsOption = document.getElementById(
        "ge-viewoption-overviews"
      );
      viewOverviewsOption.parentNode.removeChild(viewOverviewsOption);
    }
    // build palette(s)
    this.palettes = [];
    for (let i = 0; i < palettesCount; i++) {
      const palette = new go.Palette("ge-palette-" + i);
      this.palettes[i] = palette;
    }
    // Format the inspector for your specific needs. You may need to edit the DataInspector class
    this.inspector = new Inspector("ge-inspector", this.diagrams[0], {
      includesOwnProperties: true,
    });
  }
  // Small, generic helper functions
  refreshDraggableWindows() {
    this.JQUERY(".gt-menu").draggable({
      handle: ".gt-handle",
      stack: ".gt-menu",
      containment: "window",
      scroll: false,
    });
  }
  geHideShowWindow(id, doShow) {
    const geWindow = document.getElementById(id);
    let vis = null;
    if (doShow === undefined)
      vis = geWindow.style.visibility === "visible" ? "hidden" : "visible";
    else if (doShow) vis = "visible";
    else vis = "hidden";
    let pn = null;
    if (geWindow.parentNode.classList.contains("ge-menu")) {
      pn = geWindow.parentNode;
    }
    if (pn) {
      pn.style.visibility = vis;
    }
    geWindow.style.visibility = vis;
  }
}
