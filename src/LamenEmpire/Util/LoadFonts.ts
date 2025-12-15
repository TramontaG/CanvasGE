import type { ShapeDrawer } from "../../CanvasController";

const fontURL = "";

const loadFont = async (shapeDrawer: ShapeDrawer) => {
  await shapeDrawer.loadFont(
    "Tiny5",
    "https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400..700&family=Raleway:ital,wght@0,100..900;1,100..900&family=Tiny5&display=swap"
  );

  return shapeDrawer.setDefaultFont("Tiny5");
};

export { loadFont };
