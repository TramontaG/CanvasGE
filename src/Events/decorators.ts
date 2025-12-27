import type {
  GameEvent,
  KeyPressedEvent,
  MouseButtonPressedEvent,
  MouseButtonReleasedEvent,
  MouseMovedEvent,
  MouseWheelScrolledEvent,
} from ".";
import type { GameObject } from "../GameObject";
import { Vector } from "../Lib/Vector";

type HandleEventMethod<TObj extends GameObject> = (
  this: TObj,
  event: GameEvent,
  ...args: unknown[]
) => unknown;

type MethodDec<T> = (
  target: Object,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<T>
) => TypedPropertyDescriptor<T> | void;

type KeyTickHandler<TObj extends GameObject = GameObject> = (
  gameObject: TObj
) => void;

const KEY_TICK_HANDLERS = Symbol.for("canvasge.keyTickHandlers");

function registerKeyTickHandler<TObj extends GameObject>(
  target: Object,
  handler: KeyTickHandler<TObj>
) {
  const record = target as unknown as Record<symbol, KeyTickHandler<TObj>[]>;
  const existing = record[KEY_TICK_HANDLERS];

  if (existing) {
    existing.push(handler);
  } else {
    record[KEY_TICK_HANDLERS] = [handler];
  }
}

const matchesKeyState = (gameObject: GameObject, keys: string[]): boolean => {
  const context = gameObject.getContext?.();
  if (!context) return false;
  return keys.every((key) => context.isKeyPressed(key));
};

const composeMethodDecorators = <T>(
  ...decorators: Array<MethodDec<T>>
): MethodDec<T> => {
  return (target, propertyKey, descriptor) => {
    // Aplica de baixo pra cima (igual TS faz quando empilha decorators)
    return decorators.reduceRight((desc, dec) => {
      const out = dec(target, propertyKey, desc);
      return (out ?? desc) as TypedPropertyDescriptor<T>;
    }, descriptor);
  };
};

/**
 * Decorator for handling mouse clicks on hitboxes.
 */
export const onClick = <TObj extends GameObject = GameObject>(
  handler: (gameObject: TObj, event: MouseButtonPressedEvent) => void
) => {
  return function (
    _target: Object,
    _propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<HandleEventMethod<TObj>>
  ) {
    const original = descriptor.value;
    if (!original) return descriptor;

    descriptor.value = function (
      this: TObj,
      event: GameEvent,
      ...args: unknown[]
    ) {
      if (event.type === "mouseButtonPressed") {
        const hitboxes = this.getHitboxes();
        if (
          hitboxes.some((hitbox) =>
            hitbox.intersectsWithPoint(new Vector(event.x, event.y))
          )
        ) {
          handler(this, event);
        }
      }

      return original.call(this, event, ...args);
    };

    return descriptor;
  };
};

/**
 * Decorator for handling mouse clicks on hitboxes.
 */
export const onMouseRelease = <TObj extends GameObject = GameObject>(
  handler: (gameObject: TObj, event: MouseButtonReleasedEvent) => void
) => {
  return function (
    _target: Object,
    _propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<HandleEventMethod<TObj>>
  ) {
    const original = descriptor.value;
    if (!original) return descriptor;

    descriptor.value = function (
      this: TObj,
      event: GameEvent,
      ...args: unknown[]
    ) {
      if (event.type === "mouseButtonReleased") {
        const hitboxes = this.getHitboxes();
        if (
          hitboxes.some((hitbox) =>
            hitbox.intersectsWithPoint(new Vector(event.x, event.y))
          )
        ) {
          handler(this, event);
        }
      }

      return original.call(this, event, ...args);
    };

    return descriptor;
  };
};

/**
 * Decorator for handling mouse wheel scrolling anywhere on the canvas.
 */
export const onMouseWheel = <TObj extends GameObject = GameObject>(
  handler: (gameObject: TObj, event: MouseWheelScrolledEvent) => void
) => {
  return function (
    _target: Object,
    _propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<HandleEventMethod<TObj>>
  ) {
    const original = descriptor.value;
    if (!original) return descriptor;

    descriptor.value = function (
      this: TObj,
      event: GameEvent,
      ...args: unknown[]
    ) {
      if (event.type === "mouseWheelScrolled") {
        handler(this, event);
      }

      return original.call(this, event, ...args);
    };

    return descriptor;
  };
};

/**
 * Decorator for making the GameObject grabbable by the mouse
 * it will check colision with all of its hitboxes and if ANY
 * of them has the mouse inside, the gameObject will follow the
 * mouse.
 */
export const grabbable = <TObj extends GameObject = GameObject>() => {
  let offset = Vector.zero();
  const speedSamples: Vector[] = [];
  const maxSamples = 10;
  let avgSpeed = Vector.zero();

  return composeMethodDecorators(
    onHover((obj) => (obj.hovering = true)),
    onStopHovering((obj) => (obj.hovering = false)),
    onMouseRelease((obj) => {
      obj.beingGrabbed = false;
      obj.speed = avgSpeed;

      console.log(avgSpeed);
    }),
    onClick((obj, event) => {
      const { x, y } = event;
      obj.beingGrabbed = true;
      offset = obj.getPosition().toSubtracted(new Vector(x, y));
    }),
    onMouseMoved((obj, event) => {
      const { x, y } = event;
      if (obj.beingGrabbed) {
        const oldPosition = obj.getPosition();
        obj.setPosition(new Vector(x, y).add(offset));
        const newPosition = obj.getPosition();

        const delta = newPosition.toSubtracted(oldPosition);
        speedSamples.unshift(delta);
        speedSamples.length = maxSamples;

        const avgSpeedMag = speedSamples.reduce(
          (acc, v) => v.magnitude() + acc,
          0
        );
        avgSpeed = speedSamples
          .reduce((acc, v) => acc.add(v), Vector.zero())
          .normalize()
          .multiply(avgSpeedMag);

        obj.speed = Vector.zero();
      }
    })
  );
};

/**
 * Decorator for handling mouse moving over the GameObject
 */
export const onMouseMoved = <TObj extends GameObject = GameObject>(
  handler: (gameObject: TObj, event: MouseMovedEvent) => void
) => {
  return function (
    _target: Object,
    _propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<HandleEventMethod<TObj>>
  ) {
    const original = descriptor.value;
    if (!original) return descriptor;

    descriptor.value = function (
      this: TObj,
      event: GameEvent,
      ...args: unknown[]
    ) {
      if (event.type === "mouseMoved") {
        const hitboxes = this.getHitboxes();
        if (
          hitboxes.some((hitbox) =>
            hitbox.intersectsWithPoint(new Vector(event.x, event.y))
          )
        ) {
          handler(this, event);
        }
      }

      return original.call(this, event, ...args);
    };

    return descriptor;
  };
};

/**
 * Decorator for handling mouse wheel scrolling over hitboxes.
 */
export const onMouseWheelOverHitbox = <TObj extends GameObject = GameObject>(
  handler: (gameObject: TObj, event: MouseWheelScrolledEvent) => void
) => {
  return function (
    _target: Object,
    _propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<HandleEventMethod<TObj>>
  ) {
    const original = descriptor.value;
    if (!original) return descriptor;

    descriptor.value = function (
      this: TObj,
      event: GameEvent,
      ...args: unknown[]
    ) {
      if (event.type === "mouseWheelScrolled") {
        const hitboxes = this.getHitboxes();
        if (
          hitboxes.some((hitbox) =>
            hitbox.intersectsWithPoint(new Vector(event.x, event.y))
          )
        ) {
          handler(this, event);
        }
      }

      return original.call(this, event, ...args);
    };

    return descriptor;
  };
};

/**
 * Decorator that runs the handler every tick while the key is held.
 * It also suppresses the keyPressed event from invoking handleEvent.
 */
export function onKeyPressed<TObj extends GameObject = GameObject>(
  key: string,
  handler: (gameObject: TObj, event: KeyPressedEvent) => void
) {
  return onKeyComboPressed([key], handler);
}

/**
 * Decorator that runs the handler every tick while all keys in the combo are held.
 */
export function onKeyComboPressed<TObj extends GameObject = GameObject>(
  keys: string[],
  handler: (gameObject: TObj, event: KeyPressedEvent) => void
) {
  return function (
    target: Object,
    _propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<HandleEventMethod<TObj>>
  ) {
    // Register tick handler
    registerKeyTickHandler<TObj>(target, (gameObj) => {
      if (matchesKeyState(gameObj, keys)) {
        const lastKey = keys[keys.length - 1] ?? "";
        handler(gameObj as TObj, { type: "keyPressed", key: lastKey });
      }
    });

    // Wrap handleEvent so it still receives keyPressed while the tick handler handles the held state
    const original = descriptor.value;
    if (original) {
      descriptor.value = function (
        this: TObj,
        event: GameEvent,
        ...args: unknown[]
      ) {
        return original.call(this, event, ...args);
      };
    }

    return descriptor;
  };
}

export function onChildrenEvents<TObj extends GameObject = GameObject>() {
  return function (
    _target: Object,
    _propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<HandleEventMethod<TObj>>
  ) {
    const original = descriptor.value;
    if (!original) return descriptor;

    descriptor.value = function (this: TObj, event: GameEvent) {
      const result = original.call(this, event);

      if (this.children) {
        for (const child of this.children) {
          if (typeof child.handleEvent === "function") {
            child.handleEvent(event);
          }
        }
      }

      return result;
    };

    return descriptor;
  };
}

/**
 * Decorator for handling hover events on hitboxes.
 */
export const onHover = <TObj extends GameObject = GameObject>(
  handler: (gameObject: TObj, event: GameEvent) => void
) => {
  return function (
    _target: Object,
    _propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<HandleEventMethod<TObj>>
  ) {
    const original = descriptor.value;
    if (!original) return descriptor;

    descriptor.value = function (
      this: TObj,
      event: GameEvent,
      ...args: unknown[]
    ) {
      if (event.type === "mouseMoved") {
        const hitboxes = this.getHitboxes();
        const isHovering = hitboxes.some((hitbox) =>
          hitbox.intersectsWithPoint(new Vector(event.x, event.y))
        );
        const gameObject = this;
        const objectWasHovering = !!gameObject.hovering;

        if (isHovering && !objectWasHovering) {
          gameObject.hovering = true;
          handler(this, event);
        }
      }

      return original.call(this, event, ...args);
    };

    return descriptor;
  };
};

/**
 * Decorator for handling stop hovering events on hitboxes.
 */
export const onStopHovering = <TObj extends GameObject = GameObject>(
  handler: (gameObject: TObj, event: GameEvent) => void
) => {
  return function (
    _target: Object,
    _propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<HandleEventMethod<TObj>>
  ) {
    const original = descriptor.value;
    if (!original) return descriptor;

    descriptor.value = function (
      this: TObj,
      event: GameEvent,
      ...args: unknown[]
    ) {
      if (event.type === "mouseMoved") {
        const hitboxes = this.getHitboxes();

        const isHovering = hitboxes.some((hitbox) =>
          hitbox.intersectsWithPoint(new Vector(event.x, event.y))
        );

        const gameObject = this as unknown as GameObject;
        const objectWasHovering = !!gameObject.hovering;

        if (!isHovering && objectWasHovering) {
          gameObject.hovering = false;
          handler(this, event);
        }
      }

      return original.call(this, event, ...args);
    };

    return descriptor;
  };
};

export { KEY_TICK_HANDLERS, type KeyTickHandler };
