import { Scene } from "..";
import { Box } from "../../GameObject/Library/Box";
import { Button } from "../../GameObject/Library/Button";

const debugScene1 = new Scene("Debug Scene");
const debugScene2 = new Scene("Another Debug Scene");

const debugBox1 = new Box(50, 50, 100, 100, "red");
const debugBox2 = new Box(200, 200, 150, 150, "blue");

const debugButton1 = new Button(
  300,
  100,
  120,
  50,
  "Click Me",
  "green",
  (obj) => {
    obj.getContext()?.setCurrentScene("debug2");
  }
);

const dedbugButton2 = new Button(
  300,
  200,
  120,
  50,
  "Go Back",
  "orange",
  (obj) => {
    obj.getContext()?.setCurrentScene("debug");
  }
);

debugScene1.addGameObject(debugButton1);
debugScene1.addGameObject(debugBox1);
debugScene2.addGameObject(debugBox2);
debugScene2.addGameObject(dedbugButton2);

export { debugScene1, debugScene2 };
