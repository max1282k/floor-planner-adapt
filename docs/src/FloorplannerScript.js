/*
 * Copyright (C) 1998-2024 by Northwoods Software Corporation
 * All Rights Reserved.
 */
import * as go from "gojs";
import { tweakInspectorForFloorplanner } from "./DataInspectorOverrides.js";
import { EditorHelper } from "./EditorHelper.js";
import { Floorplan } from "./Floorplan.js";
import { FloorplanPalette } from "./FloorplanPalette.js";
/**
 * Script to set up the Floorplanner editor
 * @param JQUERY jQuery passed to this script in floorplannerTS/index.html via requireJS
 * @hidden @internal
 */
export function init(JQUERY) {
  const editorHelper = new EditorHelper(1, 2, Floorplan, JQUERY);
  window.editorHelper = editorHelper;
  // replace generic palettes with FloorplanPalettes
  const myFloorplan = editorHelper.diagrams[0];
  editorHelper.palettes[0].div = null;
  editorHelper.palettes[1].div = null;
  const furniturePalette = new FloorplanPalette("ge-palette-0", myFloorplan);
  furniturePalette.model = new go.GraphLinksModel(
    myFloorplan.makeDefaultFurniturePaletteNodeData()
  );
  editorHelper.palettes[0] = furniturePalette;
  const wallPartsPalette = new FloorplanPalette("ge-palette-1", myFloorplan);
  wallPartsPalette.model = new go.GraphLinksModel(
    myFloorplan.makeDefaultWallpartsPaletteNodeData()
  );
  editorHelper.palettes[1] = wallPartsPalette;
  // listen if the model of the Floorplan changes completely -- if so, there has been a load event, and we must update walls / rooms
  myFloorplan.addDiagramListener("InitialLayoutCompleted", function (e) {
    // update units, grid size, units / px, showGrid, and preferences from the loading model's modelData
    const unitsForm = document.getElementById("unitsForm");
    const gridSizeInput = document.getElementById("gridSizeInput");
    const showGridCheckbox = document.getElementById("showGridCheckbox");
    const gridSnapCheckbox = document.getElementById("gridSnapCheckbox");
    const showWallGuidelinesCheckbox = document.getElementById(
      "wallGuidelinesCheckbox"
    );
    const showWallLengthsCheckbox = document.getElementById(
      "wallLengthsCheckbox"
    );
    const showWallAnglesCheckbox =
      document.getElementById("wallAnglesCheckbox");
    const showOnlySmallWallAnglesCheckbox = document.getElementById(
      "onlySmallWallAnglesCheckbox"
    );
    const unitsConversionFactorInput = document.getElementById(
      "unitsConversionFactorInput"
    );
    const fp = e.diagram;
    const md = fp.model.modelData;
    const units = md.units;
    const unitsRadioChecked = document.getElementById(units);
    unitsRadioChecked.checked = true;
    let gridSize = md.gridSize;
    gridSize = fp.convertPixelsToUnits(gridSize);
    gridSizeInput.value = gridSize;
    fp.changeGridSize(gridSizeInput);
    const unitsConversionFactor = md.unitsConversionFactor;
    unitsConversionFactorInput.value = unitsConversionFactor;
    fp.changeUnitsConversionFactor(unitsConversionFactorInput, gridSizeInput);
    fp.changeUnits(unitsForm);
    const showGrid = md.preferences.showGrid;
    const gridSnap = md.preferences.gridSnap;
    const showWallGuidelines = md.preferences.showWallGuidelines;
    const showWallLengths = md.preferences.showWallLengths;
    const showWallAngles = md.preferences.showWallAngles;
    const showOnlySmallWallAngles = md.preferences.showOnlySmallWallAngles;
    showGridCheckbox.checked = showGrid;
    gridSnapCheckbox.checked = gridSnap;
    showWallGuidelinesCheckbox.checked = showWallGuidelines;
    showWallLengthsCheckbox.checked = showWallLengths;
    showWallAnglesCheckbox.checked = showWallAngles;
    showOnlySmallWallAnglesCheckbox.checked = showOnlySmallWallAngles;
    fp.checkboxChanged("showGridCheckbox");
    fp.checkboxChanged("gridSnapCheckbox");
    fp.checkboxChanged("wallGuidelinesCheckbox");
    fp.checkboxChanged("wallLengthsCheckbox");
    fp.checkboxChanged("wallAnglesCheckbox");
    fp.checkboxChanged("onlySmallWallAnglesCheckbox");
    // update walls and rooms geometries
    fp.nodes.iterator.each(function (n) {
      if (n.category === "WallGroup") {
        fp.updateWall(n);
      }
      if (n.category === "RoomNode") {
        fp.updateRoom(n);
      }
    });
  });
  /**
   * Update the tools buttons so the tool in use is highlighted
   */
  window.updateButtons = function (func, el) {
    func.call(myFloorplan);
    const toolButtons = document.getElementsByClassName("toolButtons");
    for (let i = 0; i < toolButtons.length; i++) {
      const tb = toolButtons[i];
      if (tb === el) {
        tb.style.background = "#4b545f";
        tb.style.color = "white";
      } else {
        tb.style.background = "rgb(221, 221, 221)";
        tb.style.color = "black";
      }
    }
  };
  JQUERY(function () {
    JQUERY("#ge-palettes-container").accordion({
      heightStyle: "content",
      activate: function () {
        for (let i = 0; i < editorHelper.palettes.length; i++) {
          const palette = editorHelper.palettes[i];
          palette.requestUpdate();
        }
      },
    });
    // JQUERY("#ge-overviews-container").accordion();
    const draggables = document.getElementsByClassName("ge-draggable");
    for (let i = 0; i < draggables.length; i++) {
      const draggable = draggables[i];
      const id = "#" + draggable.id;
      const hid = id + "-handle";
      // When a window is dragged, its height is set. this is bad. unset height / maybe width after dragging
      JQUERY(id).draggable({
        handle: hid,
        stack: ".ge-draggable",
        containment: "parent",
        scroll: false,
        stop: function (event) {
          this.style.height = "unset";
          const did = event.target.id;
          // only unset width for inspector and options menu, whose widths are dependent on contents
          if (did === "ge-inspector-window" || did === "optionsWindow") {
            this.style.width = "unset";
          }
        },
      });
    }
  }); // end jQuery
  // add options window hotkey (other hotkeys are defined in goeditor-setup.js)
  document.body.addEventListener("keydown", function (e) {
    const keynum = e.which;
    if (e.ctrlKey) {
      e.preventDefault();
      switch (keynum) {
        case 66:
          editorHelper.geHideShowWindow("optionsWindow");
          break; // ctrl + b
      }
    }
  });
  // function to tweak inspector for app-specific stuff is in floorplanner-datainspector-overrides.js
  tweakInspectorForFloorplanner(
    editorHelper.inspector,
    myFloorplan,
    editorHelper
  );
  const defaultModelTextarea = document.getElementById("defaultModelTextarea");
  const defaultModelString = defaultModelTextarea.value;
  const defaultModelJson = JSON.parse(defaultModelString);
  myFloorplan.model = go.Model.fromJson(defaultModelJson);
  window.myFloorplan = myFloorplan;
  window.furniturePalette = furniturePalette;
  window.wallPartsPalette = wallPartsPalette;
  document
    .getElementById("saveFloorPlanBtn")
    .addEventListener("onclick", saveFloorPlan);
  function saveFloorPlan() {
    console.log(myFloorplan.model.De);
  }
}
