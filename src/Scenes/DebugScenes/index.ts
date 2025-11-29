import { Scene } from "..";
import {
  renderArrow,
  renderChevron,
  shapeWithParams,
} from "../../Assets/Shapes/Arrow";
import { withRotation } from "../../CanvasController/Transformations";
import { Box } from "../../GameObject/Library/Box";
import { Button } from "../../GameObject/Library/Button";
import { ClickableShape } from "../../GameObject/Library/Clickableshape";
import { Vector } from "../../Vector";

const debugScene1 = new Scene("Debug Scene", "lightgray");
const debugScene2 = new Scene("Another Debug Scene");

const debugBox1 = new Box(new Vector(0, 0), new Vector(100, 100), "red");
const debugBox2 = new Box(new Vector(200, 200), new Vector(150, 150), "blue");

const debugButton1 = new Button(
  "Debug Button",
  new Vector(200, 50),
  new Vector(100, 50),
  "Click Me",
  "green",
  (obj) => {
    obj.getContext()?.pushScene("debug2");
  }
);

const arrow1 = new ClickableShape(
  new Vector(750, 300),
  new Vector(50, 50),
  withRotation(
    0,
    shapeWithParams(renderChevron, {
      color: "purple",
      strokeWidth: 6,
      lineCap: "round",
      lineJoin: "round",
    })
  ),
  (obj) => {
    const oneSceneUp = obj
      .getContext()
      ?.getSceneManager()
      .getActiveScenes()[0]!;
    const currOffset = oneSceneUp.getOffset();
    const setOffset = new Vector(currOffset.x + 10, currOffset.y);
    oneSceneUp.setOffset(setOffset);
  }
);

const arrow2 = new ClickableShape(
  new Vector(400, 550),
  new Vector(50, 50),
  withRotation(
    Math.PI / 2,
    shapeWithParams(renderChevron, {
      color: "purple",
      strokeWidth: 6,
      lineCap: "round",
      lineJoin: "round",
    })
  ),
  (obj) => {
    const oneSceneUp = obj
      .getContext()
      ?.getSceneManager()
      .getActiveScenes()[0]!;
    const currOffset = oneSceneUp.getOffset();
    const setOffset = new Vector(currOffset.x, currOffset.y + 10);
    oneSceneUp.setOffset(setOffset);
  }
);

const arrow3 = new ClickableShape(
  new Vector(0, 300),
  new Vector(50, 50),
  withRotation(
    Math.PI,
    shapeWithParams(renderChevron, {
      color: "purple",
      strokeWidth: 6,
      lineCap: "round",
      lineJoin: "round",
    })
  ),
  (obj) => {
    const oneSceneUp = obj
      .getContext()
      ?.getSceneManager()
      .getActiveScenes()[0]!;
    const currOffset = oneSceneUp.getOffset();
    const setOffset = new Vector(currOffset.x - 10, currOffset.y);
    oneSceneUp.setOffset(setOffset);
  }
);

const arrow4 = new ClickableShape(
  new Vector(400, 0),
  new Vector(50, 50),
  withRotation(
    (3 * Math.PI) / 2,
    shapeWithParams(renderChevron, {
      color: "purple",
      strokeWidth: 6,
      lineCap: "round",
      lineJoin: "round",
    })
  ),
  (obj) => {
    const oneSceneUp = obj
      .getContext()
      ?.getSceneManager()
      .getActiveScenes()[0]!;
    const currOffset = oneSceneUp.getOffset();
    const setOffset = new Vector(currOffset.x, currOffset.y - 10);
    oneSceneUp.setOffset(setOffset);
  }
);

const dedbugButton2 = new Button(
  "Back Button",
  new Vector(0, 0),
  new Vector(100, 50),
  "Go Back",
  "orange",
  (obj) => {
    obj.getContext()?.popScene();
  }
);

debugScene1.addGameObject(debugButton1);
debugScene2.addGameObject(arrow1);
debugScene2.addGameObject(arrow2);
debugScene2.addGameObject(arrow3);
debugScene2.addGameObject(arrow4);
debugScene1.addGameObject(debugBox1);
// debugScene2.addGameObject(debugBox2);
// debugScene2.addGameObject(dedbugButton2);

export { debugScene1, debugScene2 };
