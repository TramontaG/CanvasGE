import type { GameEvent, MouseButtonPressedEvent } from ".";
import type { GameObject } from "../GameObject";

type EventPredicate = <T extends GameObject = GameObject>(
  gameObject: T,
  event: GameEvent
) => boolean;

type HandleEventMethod<TObj extends GameObject> = (
  this: TObj,
  event: GameEvent,
  ...args: unknown[]
) => unknown;

function createEventDecorator<TObj extends GameObject>(
  eventPredicate: EventPredicate,
  handler: (gameObject: TObj, event: GameEvent) => void
) {
  return function (
    _target: Object,
    _propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<HandleEventMethod<TObj>>
  ): TypedPropertyDescriptor<HandleEventMethod<TObj>> | void {
    const originalMethod = descriptor.value;

    if (!originalMethod) {
      throw new Error(
        "createHitboxEventDecorator só pode ser usado em métodos."
      );
    }

    const wrapped: HandleEventMethod<TObj> = function (
      this: TObj,
      event: GameEvent,
      ...args: unknown[]
    ) {
      if (event && eventPredicate(this, event)) {
        handler(this, event);
      }

      return originalMethod.call(this, event, ...args);
    };

    descriptor.value = wrapped as HandleEventMethod<TObj>;
    return descriptor;
  };
}

/**
 * Decorator factory that creates a method decorator for handling click events.
 *
 * @template TObj - The type of the game object that will handle the click event.
 * @param handler - The function to be called when a click event occurs.
 * @returns A method decorator that adds click event handling to the decorated method.
 *
 * @example
 * class MyGameObject extends GameObject {
 *   @onClick((gameObject, event) => {
 *     console.log("Clicked!", gameObject, event);
 *   })
 *   handleEvent(event: GameEvent) {
 *     // Original event handling logic
 *   }
 * }
 */
export const onClick = <TObj extends GameObject = GameObject>(
  handler: (gameObject: TObj, event: GameEvent) => void
) => {
  const eventPredicate: EventPredicate = (gameObject, event) => {
    if (event.type === "mouseButtonPressed") {
      const hitboxes = gameObject.getHitboxes();
      for (const hitbox of hitboxes) {
        if (hitbox.intersectsWithPoint({ x: event.x, y: event.y })) {
          return true;
        }
      }
    }
    return false;
  };

  return createEventDecorator(eventPredicate, handler);
};
