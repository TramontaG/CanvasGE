import { Vector } from "sliver-engine";

export type HitboxType = "square" | "circle";

export type HitboxConfig = {
	type: HitboxType;
	offset: Vector;
	squareSize: Vector;
	circleRadius: number;
	solid: boolean;
	debug: boolean;
};

export type HitboxDemoObjectConfig = {
	position: Vector;
	shapeSize: Vector;
	shapeColor: string;
	hitboxes: HitboxConfig[];
};

type HitboxDemoConfigs = {
	objectA: HitboxDemoObjectConfig;
	objectB: HitboxDemoObjectConfig;
};

export const createHitboxConfigs = (): HitboxDemoConfigs => {
	// Edit this section only.
	return {
		objectA: {
			position: new Vector(136, 138),
			shapeSize: new Vector(54, 30),
			shapeColor: "#22d3ee",
			hitboxes: [
				{
					type: "square",
					offset: new Vector(18, -10),
					squareSize: new Vector(22, 22),
					circleRadius: 11,
					solid: true,
					debug: true,
				},
				{
					type: "circle",
					offset: new Vector(-8, 8),
					squareSize: new Vector(18, 18),
					circleRadius: 10,
					solid: true,
					debug: true,
				},
			],
		},
		objectB: {
			position: new Vector(308, 144),
			shapeSize: new Vector(48, 44),
			shapeColor: "#fb7185",
			hitboxes: [
				{
					type: "circle",
					offset: new Vector(-12, 12),
					squareSize: new Vector(26, 18),
					circleRadius: 14,
					solid: true,
					debug: true,
				},
				{
					type: "square",
					offset: new Vector(14, -6),
					squareSize: new Vector(16, 24),
					circleRadius: 8,
					solid: true,
					debug: true,
				},
			],
		},
	};
};
