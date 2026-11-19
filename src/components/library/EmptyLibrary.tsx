import { NewBookcaseSlot } from "@/components/library/NewBookcaseSlot";
import { RoomBackdrop } from "@/components/library/RoomBackdrop";
import { ButtonLink } from "@/components/ui/ButtonLink";

export function EmptyLibrary({ name }: { name: string }) {
  return (
    <main className="relative flex min-h-[calc(100vh-4.75rem)] flex-col justify-end overflow-hidden bg-blush-100">
      <RoomBackdrop />

      <div className="relative flex flex-wrap items-end justify-center gap-14 px-12 pb-21 pt-10">
        <div className="mb-30 flex max-w-110 flex-col gap-3.5 rounded-[1.75rem] border-[1.5px] border-ink bg-paper p-8 shadow-[0_6px_0_#EBB4C0]">
          <span className="self-start rounded-full bg-sage-100 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.08em] text-sage-700">
            Welcome, {name}
          </span>
          <h1 className="font-display text-[32px] font-semibold leading-tight text-ink-strong">Your room is still roomy.</h1>
          <p className="leading-relaxed text-ink-soft">
            Start by creating your first bookcase, like Novels or Classes. Then you can shelve your PDF books on it.
          </p>
          <ButtonLink href="/library?new=bookcase" className="mt-1 self-start">
            Create my first bookcase
          </ButtonLink>
        </div>

        <NewBookcaseSlot className="h-117.5" description="One bookcase for each category of books" />
      </div>
    </main>
  );
}