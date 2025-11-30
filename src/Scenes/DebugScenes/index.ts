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
import { SceneTranslator } from "../../GameObject/Library/SceneTranslator";
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
debugScene2.addGameObject(new SceneTranslator(debugScene1));
debugScene1.addGameObject(debugBox1);
// debugScene2.addGameObject(debugBox2);
// debugScene2.addGameObject(dedbugButton2);

export { debugScene1, debugScene2 };
