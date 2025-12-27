import { Vector } from "../../Lib/Vector";

export const createClientPaths = () => {
  const entryPoint = [
    new Vector(600, 450),
    new Vector(600, 450),
    new Vector(600, 450),
    new Vector(600, 450),
  ];

  const corner = [
    new Vector(250, 450),
    new Vector(270, 450),
    new Vector(270, 450),
    new Vector(315, 450),
  ];

  const door = [
    new Vector(250, 400),
    new Vector(270, 325),
    new Vector(270, 350),
    new Vector(315, 400),
  ];

  const doorExit = [
    new Vector(250, 400),
    new Vector(230, 325),
    new Vector(230, 350),
    new Vector(295, 400),
  ];

  const cornerExit = [
    new Vector(250, 450),
    new Vector(230, 450),
    new Vector(230, 450),
    new Vector(294, 450),
  ];

  const exitPoint = [
    new Vector(0, 450),
    new Vector(0, 450),
    new Vector(0, 450),
    new Vector(0, 450),
  ];

  const createPath = (index: number) => ({
    entryPath: [
      entryPoint[index]!.clone(),
      corner[index]!.clone(),
      door[index]!.clone(),
    ],
    exitPath: [
      doorExit[index]!.clone(),
      cornerExit[index]!.clone(),
      exitPoint[index]!.clone(),
    ],
  });

  return [createPath(0), createPath(1), createPath(2), createPath(3)];
};
