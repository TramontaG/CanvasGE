import { Vector } from "sliver-engine";

export const createGravity = () => {
	// Edit this section only.
	const gravityX = 0;
	const gravityY = 16.8;

	return new Vector(gravityX, gravityY);
};
