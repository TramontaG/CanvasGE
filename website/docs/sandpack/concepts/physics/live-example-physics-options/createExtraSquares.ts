import {
GameObject,
SquareHitbox,
Vector,
grabbable,
type GameEvent,
} from "sliver-engine";
import {
createColorPhysicsOptions,
type PhysicsOptions,
} from "./createColorPhysicsOptions";

type SquareConfig = {
name: string;
position: Vector;
size: Vector;
color: string;
initialSpeed: Vector;
};

const CYAN_SQUARES: SquareConfig[] = [
{ name: "cyan-1", position: new Vector(68, 44), size: new Vector(14, 14), color: "#22d3ee", initialSpeed: new Vector(0.35, 0) },
{ name: "cyan-2", position: new Vector(106, 58), size: new Vector(18, 18), color: "#22d3ee", initialSpeed: new Vector(0, 0) },
{ name: "cyan-3", position: new Vector(154, 50), size: new Vector(16, 16), color: "#22d3ee", initialSpeed: new Vector(0, 0) },
{ name: "cyan-4", position: new Vector(194, 64), size: new Vector(20, 20), color: "#22d3ee", initialSpeed: new Vector(-0.25, 0) },
];

const ROSE_SQUARES: SquareConfig[] = [
{ name: "rose-1", position: new Vector(280, 48), size: new Vector(15, 15), color: "#fb7185", initialSpeed: new Vector(-0.3, 0) },
{ name: "rose-2", position: new Vector(322, 60), size: new Vector(22, 22), color: "#fb7185", initialSpeed: new Vector(0, 0) },
{ name: "rose-3", position: new Vector(368, 54), size: new Vector(17, 17), color: "#fb7185", initialSpeed: new Vector(0, 0) },
{ name: "rose-4", position: new Vector(404, 66), size: new Vector(13, 13), color: "#fb7185", initialSpeed: new Vector(0.2, 0) },
];

class ExtraSquare extends GameObject {
private readonly size: Vector;

constructor(config: SquareConfig, physicsOptions: PhysicsOptions) {
super(config.name, config.position.clone());
this.size = config.size.clone();
this.addHitbox(
new SquareHitbox(Vector.zero(), this.size.clone(), this, {
solid: true,
debug: false,
}),
);
this.setPhisics(physicsOptions);
this.speed = config.initialSpeed.clone();
this.setRenderFunction((obj, canvas) => {
const pos = obj.getPosition();
canvas
.getShapeDrawer()
.drawRectangle(pos.x, pos.y, this.size.x, this.size.y, config.color, true);
});
}

@grabbable()
override handleEvent(event: GameEvent): void {
super.handleEvent(event);
}
}

const buildSquares = (
configs: SquareConfig[],
physicsOptions: PhysicsOptions,
): ExtraSquare[] => {
return configs.map((config) => new ExtraSquare(config, physicsOptions));
};

export const createExtraSquares = () => {
	const colorPhysicsOptions = createColorPhysicsOptions();
	return {
		cyan: buildSquares(CYAN_SQUARES, colorPhysicsOptions.cyan),
		rose: buildSquares(ROSE_SQUARES, colorPhysicsOptions.rose),
	};
};
