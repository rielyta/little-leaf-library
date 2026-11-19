import type { CSSProperties } from "react";
import { PaperPage, type PageSide } from "@/components/reader/PaperPage";
import type { Highlight } from "@/lib/highlights";
import type { Leaf } from "@/lib/reader";

const TURN_TRANSITION = "transform 650ms cubic-bezier(0.45, 0.05, 0.35, 1)";

type TurningLeafProps = {
  leaf: Leaf;
  images: ReadonlyMap<number, string>;
  highlightsByPage: ReadonlyMap<number, Highlight[]>;
  width: number;
  height: number;
  progress: number;
  settling: boolean;
  onTransitionEnd: () => void;
};

export function TurningLeaf({ leaf, images, highlightsByPage, width, height, progress, settling, onTransitionEnd }: TurningLeafProps) {
  const frontSide: PageSide = leaf.side === "left" ? "left" : leaf.side === "right" ? "right" : "single";
  const backSide: PageSide = leaf.side === "left" ? "right" : "left";
  const shade = Math.sin(progress * Math.PI) * 0.22;

  const style: CSSProperties = {
    width,
    height,
    left: leaf.side === "right" ? width : 0,
    transformOrigin: `${leaf.origin} center`,
    transform: `rotateY(${leaf.angle}deg)`,
    transition: settling ? TURN_TRANSITION : "none",
  };

  function face(pageNumber: number | null, side: PageSide) {
    return (
      <PaperPage
        pageNumber={pageNumber}
        image={pageNumber ? images.get(pageNumber) : undefined}
        highlights={pageNumber ? highlightsByPage.get(pageNumber) : undefined}
        width={width}
        height={height}
        side={side}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      onTransitionEnd={onTransitionEnd}
      className="pointer-events-none absolute top-0 z-10 [transform-style:preserve-3d] [will-change:transform]"
      style={style}
    >
      <div className="absolute inset-0 [backface-visibility:hidden]">
        {face(leaf.front, frontSide)}
        <div className="absolute inset-0 bg-gradient-to-l from-ink-strong to-transparent" style={{ opacity: shade }} />
      </div>
      <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
        {face(leaf.back, backSide)}
      </div>
    </div>
  );
}