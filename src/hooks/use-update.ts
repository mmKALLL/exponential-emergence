import { useEffect, useState } from "react";

type Callback = () => void;
const subscribers = new Set<Callback>();

let gameUILoopStarted = false;
const gameUILoop = () => {
  subscribers.forEach((fn) => fn());
  setTimeout(gameUILoop, 100);
};

const ensureLoopStarted = () => {
  if (!gameUILoopStarted) {
    gameUILoopStarted = true;
    gameUILoop();
  }
};

export function useUpdate<T>(callback: () => T) {
  const [value, setValue] = useState<T>(() => callback());

  useEffect(() => {
    ensureLoopStarted();

    const update = () => {
      setValue((prev) => {
        const next = callback();
        return Object.is(prev, next) ? prev : next;
      });
    };
    subscribers.add(update);
    return () => {
      subscribers.delete(update)
    }
  }, [callback])

  return value
}

export function useGameState() {
  return useUpdate(() => Game.state)
}
