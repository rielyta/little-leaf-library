export function FormAlert({ message }: { message: string | null }) {
  if (!message) {
    return null;
  }

  return (
    <p role="alert" className="rounded-2xl border-[1.5px] border-blush-300 bg-blush-50 px-4 py-3 text-sm font-semibold text-danger">
      {message}
    </p>
  );
}