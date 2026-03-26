export type PhysicsOptions = {
	immovable?: boolean;
	affectedByGravity?: boolean;
	restitution?: number;
	friction?: number;
	mass?: number;
};

type ColorPhysicsOptions = {
cyan: PhysicsOptions;
rose: PhysicsOptions;
};

export const createColorPhysicsOptions = (): ColorPhysicsOptions => {
	// Edit this section only.
	const cyanPhysicsOptions = {
		immovable: false,
		affectedByGravity: true,
		restitution: 0.35,
		friction: 0.8,
		mass: 1.2,
	};

    const rosePhysicsOptions = {
    	immovable: false,
    	affectedByGravity: true,
    	restitution: 0.8,
    	friction: 0.15,
    	mass: 0.9,
    };

    return {
    	cyan: cyanPhysicsOptions,
    	rose: rosePhysicsOptions,
    };

};
