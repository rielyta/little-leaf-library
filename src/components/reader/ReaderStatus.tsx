export function ReaderStatus({ message }: { message: string }) {
  return (
    <div role="status" className="flex flex-1 items-center justify-center p-10 text-center font-display text-lg text-ink-soft">
      {message}
    </div>
  );
}