import { useState } from "react";
import type { Turn, TurnDirection } from "@/lib/reader";

type UsePageTurnOptions = {
  canTurn: (direction: TurnDirection) => boolean;
  onTurned: (direction: TurnDirection) => void;
};

export function usePageTurn({ canTurn, onTurned }: UsePageTurnOptions) {
  const [turn, setTurn] = useState<Turn | null>(null);

  function finish(finished: Turn) {
    if (finished.progress === 1) {
      onTurned(finished.direction);
    }

    setTurn(null);
  }

  function animate(direction: TurnDirection) {
    if (turn || !canTurn(direction)) {
      return;
    }

    setTurn({ direction, progress: 0, settling: false });
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setTurn({ direction, progress: 1, settling: true }));
    });
  }

  function drag(direction: TurnDirection, progress: number) {
    if (!canTurn(direction)) {
      return;
    }

    setTurn({ direction, progress, settling: false });
  }

  function release(complete: boolean) {
    if (!turn) {
      return;
    }

    const target = complete ? 1 : 0;

    if (turn.progress === target) {
      finish({ ...turn, progress: target });
      return;
    }

    setTurn({ ...turn, progress: target, settling: true });
  }

  function handleTransitionEnd() {
    if (turn?.settling) {
      finish(turn);
    }
  }

  return { turn, animate, drag, release, handleTransitionEnd };
}