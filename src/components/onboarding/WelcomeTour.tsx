"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { finishOnboarding } from "@/app/(app)/library/onboarding-actions";
import { TourArt, type TourArtKind } from "@/components/onboarding/TourArt";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { parseAvatar } from "@/lib/avatars";
import { cn } from "@/lib/cn";
import { formatBytes, MAX_BOOK_FILE_BYTES, STORAGE_QUOTA_BYTES } from "@/lib/storage-quota";

type WelcomeTourProps = {
  name: string;
  libraryName: string;
  avatar: string;
  hasBookcases: boolean;
};

type Step = {
  art: TourArtKind;
  title: string;
  body: ReactNode;
};

function Key({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded-md border-[1.5px] border-line bg-white px-1.5 py-px font-sans text-[13px] font-extrabold text-ink-strong">
      {children}
    </kbd>
  );
}

function buildSteps({ name, libraryName, avatar, hasBookcases }: WelcomeTourProps): Step[] {
  const petName = parseAvatar(avatar).palette.name.toLowerCase();

  return [
    {
      art: "welcome",
      title: `Welcome to ${libraryName}`,
      body: (
        <p>
          Hi {name}! This cozy room is your own little library. Here is a quick look around. It only takes a minute.
        </p>
      ),
    },
    {
      art: "bookcase",
      title: "A bookcase for every kind of book",
      body: (
        <p>
          Make a bookcase for each category you like, such as novels, classes or recipes. Click the name plate on top of a
          bookcase to rename it, change its wood, manage its books or remove it.
        </p>
      ),
    },
    {
      art: "upload",
      title: "Shelve your PDFs",
      body: (
        <p>
          Press <strong>Add book</strong> to upload a PDF. The title and author fill in on their own, and the spine grows
          thicker as the page count grows. Each book can be up to {formatBytes(MAX_BOOK_FILE_BYTES)}, and your shelves hold{" "}
          {formatBytes(STORAGE_QUOTA_BYTES)} in total.
        </p>
      ),
    },
    {
      art: "reading",
      title: "Turn real pages",
      body: (
        <p>
          Click a book to open it. Drag the corner of a page, use the arrow buttons, or press <Key>←</Key> and <Key>→</Key> to
          turn pages. Tap the ribbon at the top of a page to bookmark it. Your place is saved on its own, so you can always pick
          up where you left off.
        </p>
      ),
    },
    {
      art: "notes",
      title: "Highlight, note and translate",
      body: (
        <p>
          Select any text to highlight it, add a comment, or translate it. Save new words to build your own word list. You can
          find all of it in the Notes panel, which opens with <Key>N</Key>.
        </p>
      ),
    },
    {
      art: "pet",
      title: "Meet your little friend",
      body: (
        <p>
          Your {petName} lives here too. Click to pet it, and try a few quick pets in a row. Click the ball on the floor to
          play fetch. You can choose a different friend on your Profile anytime.
        </p>
      ),
    },
    hasBookcases
      ? {
          art: "sprout",
          title: "You are all set",
          body: <p>Your shelves are ready and waiting. Happy reading!</p>,
        }
      : {
          art: "sprout",
          title: "Let us build your first bookcase",
          body: <p>Every library starts with a single bookcase. Give it a name and a wood color, then add your first book.</p>,
        },
  ];
}

export function WelcomeTour(props: WelcomeTourProps) {
  const router = useRouter();
  const steps = buildSteps(props);
  const [index, setIndex] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const finishedRef = useRef(false);

  const step = steps[index];
  const isFirst = index === 0;
  const isLast = index === steps.length - 1;

  function finish() {
    if (finishedRef.current) {
      return Promise.resolve();
    }

    finishedRef.current = true;
    setIsDone(true);
    return finishOnboarding();
  }

  async function complete() {
    await finish();

    if (!props.hasBookcases) {
      router.replace("/library?new=bookcase", { scroll: false });
    }
  }

  function goTo(nextIndex: number) {
    setIndex(Math.min(steps.length - 1, Math.max(0, nextIndex)));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight" && !isLast) {
      event.preventDefault();
      goTo(index + 1);
    } else if (event.key === "ArrowLeft" && !isFirst) {
      event.preventDefault();
      goTo(index - 1);
    }
  }

  if (isDone) {
    return null;
  }

  return (
    <Modal
      open
      title={step.title}
      titleId="welcome-tour-title"
      onClose={() => void finish()}
      className="w-[min(34rem,calc(100%-2rem))]"
    >
      <div onKeyDown={handleKeyDown} className="flex flex-col gap-5">
        <div
          aria-hidden="true"
          className="flex h-40 items-center justify-center rounded-[1.375rem] border-[1.5px] border-[#EADFD2] bg-blush-50 py-3"
        >
          <TourArt kind={step.art} avatar={props.avatar} />
        </div>

        <div aria-live="polite" className="min-h-[7.5rem] text-[15px] leading-relaxed text-ink [&_strong]:text-ink-strong">
          {step.body}
        </div>

        <div className="flex items-center justify-center gap-1.5" aria-label={`Step ${index + 1} of ${steps.length}`} role="img">
          {steps.map((item, dotIndex) => (
            <span
              key={item.title}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                dotIndex === index ? "w-5 bg-sage-400" : "w-2 bg-wood-100",
              )}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t-[1.5px] border-[#F0E6DA] pt-4.5">
          {isLast ? (
            <span />
          ) : (
            <button
              type="button"
              onClick={() => void finish()}
              className="min-h-11 rounded-full px-2 text-sm font-extrabold text-ink-soft hover:text-ink-strong"
            >
              Skip tour
            </button>
          )}

          <div className="flex gap-2.5">
            {!isFirst && (
              <Button variant="outline" onClick={() => goTo(index - 1)}>
                Back
              </Button>
            )}

            {isLast ? (
              <Button onClick={() => void complete()}>{props.hasBookcases ? "Start reading" : "Build my first bookcase"}</Button>
            ) : (
              <Button onClick={() => goTo(index + 1)}>{isFirst ? "Show me around" : "Next"}</Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}