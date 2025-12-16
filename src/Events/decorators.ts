import type { GameEvent, KeyPressedEvent, MouseWheelScrolledEvent } from ".";
import type { GameObject } from "../GameObject";
import { Vector } from "../Vector";

type HandleEventMethod<TObj extends GameObject> = (
  this: TObj,
  event: GameEvent,
  ...args: unknown[]
) => unknown;

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

/**
 * Decorator for handling mouse clicks on hitboxes.
 */
export const onClick = <TObj extends GameObject = GameObject>(
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
        const gameObject = this as unknown as GameObject;
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
