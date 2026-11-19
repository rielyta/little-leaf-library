"use client";

import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type DragEvent, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { FormAlert } from "@/components/ui/FormAlert";
import { Modal, ModalCancelButton } from "@/components/ui/Modal";
import { TextField } from "@/components/ui/TextField";
import {
  BOOK_AUTHOR_MAX_LENGTH,
  BOOK_TITLE_MAX_LENGTH,
  MAX_PDF_BYTES,
  MAX_PDF_LABEL,
  SPINE_COLOR_NAMES,
  SPINE_COLOR_VALUES,
  spineWidth,
  titleFromFileName,
  type SpineColor,
} from "@/lib/books";
import { cn } from "@/lib/cn";
import { readPdfInfo } from "@/lib/pdf-info";
import { bookSchema, type BookValues } from "@/lib/validation/book";
import { toFieldErrors, type FieldErrors } from "@/lib/validation/errors";

type BookcaseOption = {
  id: string;
  name: string;
};

type AddBookDialogProps = {
  open: boolean;
  bookcases: BookcaseOption[];
  defaultBookcaseId?: string;
};

type SelectedFile = {
  file: File;
  pageCount: number;
};

const NEIGHBOR_SPINES = [
  { width: 24, height: 104, color: "#CFE3EA" },
  { width: 30, height: 96, color: "#E9C6D9" },
  { width: 20, height: 110, color: "#BFD8C2" },
  { width: 34, height: 100, color: "#F3E3C3" },
];

function formatFileSize(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AddBookDialog({ open, bookcases, defaultBookcaseId }: AddBookDialogProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<SelectedFile | null>(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [bookcaseId, setBookcaseId] = useState(defaultBookcaseId ?? bookcases[0]?.id ?? "");
  const [spineColor, setSpineColor] = useState<SpineColor>(SPINE_COLOR_VALUES[0]);
  const [errors, setErrors] = useState<FieldErrors<BookValues>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "reading" | "uploading">("idle");
  const [isDragging, setIsDragging] = useState(false);

  async function pickFile(file: File | undefined) {
    if (!file) {
      return;
    }

    setFormError(null);

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setFormError("Please choose a PDF file.");
      return;
    }

    if (file.size > MAX_PDF_BYTES) {
      setFormError(`This PDF is ${formatFileSize(file.size)}. Files can be up to ${MAX_PDF_LABEL}.`);
      return;
    }

    setStatus("reading");

    try {
      const info = await readPdfInfo(new Uint8Array(await file.arrayBuffer()));
      setSelected({ file, pageCount: info.pageCount });
      setTitle((info.title ?? titleFromFileName(file.name)).slice(0, BOOK_TITLE_MAX_LENGTH));
      setAuthor((info.author ?? "").slice(0, BOOK_AUTHOR_MAX_LENGTH));
    } catch {
      setFormError("We could not read this PDF. It may be damaged or protected with a password.");
    } finally {
      setStatus("idle");
    }
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    void pickFile(event.target.files?.[0]);
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    void pickFile(event.dataTransfer.files[0]);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selected) {
      setFormError("Choose a PDF file first.");
      return;
    }

    const parsed = bookSchema.safeParse({ title, author, bookcaseId, spineColor });

    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error));
      return;
    }

    setErrors({});
    setFormError(null);
    setStatus("uploading");

    const body = new FormData();
    body.append("file", selected.file);
    Object.entries(parsed.data).forEach(([key, value]) => body.append(key, value));

    const response = await fetch("/api/books", { method: "POST", body });

    if (!response.ok) {
      const result = (await response.json().catch(() => null)) as { error?: string; fieldErrors?: FieldErrors<BookValues> } | null;
      setErrors(result?.fieldErrors ?? {});
      setFormError(result?.error ?? "We could not upload this book. Please try again.");
      setStatus("idle");
      return;
    }

    router.replace("/library", { scroll: false });
    router.refresh();
  }

  const isBusy = status !== "idle";

  return (
    <Modal
      open={open}
      title="Add a new book"
      titleId="add-book-title"
      onClose={() => router.replace("/library", { scroll: false })}
      className="w-[min(52rem,calc(100%-2rem))]"
    >
      {bookcases.length === 0 ? (
        <div className="flex flex-col gap-4">
          <FormAlert message="Create a bookcase first, then you can shelve books on it." />
          <div className="flex justify-end">
            <ModalCancelButton />
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <p className="-mt-3 text-ink-soft">Upload a PDF, then shelve it in the bookcase you like.</p>

          <FormAlert message={formError} />

          <div className="grid gap-7 md:grid-cols-2">
            <div className="flex flex-col gap-4">
              <label
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={cn(
                  "flex cursor-pointer flex-col gap-3 rounded-[1.375rem] border-2 border-dashed p-4.5 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-sage-600",
                  isDragging ? "border-sage-600 bg-sage-50" : "border-mist-200 bg-mist-50",
                )}
              >
                <input type="file" accept="application/pdf,.pdf" onChange={handleInputChange} className="sr-only" disabled={isBusy} />

                {selected ? (
                  <div className="flex items-center gap-3.5">
                    <span className="flex h-15.5 w-13 flex-none items-end justify-center rounded-lg border-[1.5px] border-ink bg-white pb-2 font-display text-xs font-semibold text-blush-700">
                      PDF
                    </span>
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <strong className="truncate text-[15px]">{selected.file.name}</strong>
                      <span className="text-[13px] text-ink-soft">
                        {selected.pageCount} pages, {formatFileSize(selected.file.size)}
                      </span>
                      <span className="text-[13px] font-extrabold text-sage-700">Ready to shelve. Click to choose another.</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 py-6 text-center">
                    <span className="flex size-13 items-center justify-center rounded-2xl border-[1.5px] border-ink bg-white font-display text-xs font-semibold text-blush-700">
                      PDF
                    </span>
                    <strong className="text-[15px]">{status === "reading" ? "Reading your PDF..." : "Drop a PDF here or click to choose"}</strong>
                    <span className="text-[13px] text-mist-700">Up to {MAX_PDF_LABEL}</span>
                  </div>
                )}
              </label>

              <div className="flex flex-col gap-2.5">
                <span className="text-sm font-extrabold">Preview on the shelf</span>
                <div aria-hidden="true" className="flex h-42 items-end gap-[3px] rounded-md border-[1.5px] border-b-[10px] border-ink border-b-wood-300 bg-wood-200 px-4.5">
                  {NEIGHBOR_SPINES.slice(0, 2).map((spine, index) => (
                    <span key={index} className="rounded-t-[4px] border-[1.5px] border-ink opacity-70" style={{ width: spine.width, height: spine.height, backgroundColor: spine.color }} />
                  ))}
                  <span
                    className="flex -translate-y-1.5 flex-col items-center justify-between rounded-t-[4px] border-2 border-ink py-2 shadow-[0_0_0_4px_#FFFDF8]"
                    style={{ width: spineWidth(selected?.pageCount ?? 180), height: 130, backgroundColor: spineColor }}
                  >
                    <span className="h-[3px] w-full bg-white/60" />
                    <span className="max-h-24 overflow-hidden whitespace-nowrap font-display text-xs font-medium text-ink-strong [writing-mode:vertical-rl]">
                      {title || "Your book"}
                    </span>
                    <span className="h-[3px] w-full bg-white/60" />
                  </span>
                  {NEIGHBOR_SPINES.slice(2).map((spine, index) => (
                    <span key={index} className="rounded-t-[4px] border-[1.5px] border-ink opacity-70" style={{ width: spine.width, height: spine.height, backgroundColor: spine.color }} />
                  ))}
                </div>
                <span className="text-[13px] leading-normal text-ink-soft">
                  {selected
                    ? `Thickness follows the page count (${selected.pageCount} pages).`
                    : "Thickness follows the page count of your PDF."}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <TextField
                label="Title"
                name="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={BOOK_TITLE_MAX_LENGTH}
                error={errors.title}
                labelAside={
                  selected && (
                    <span className="rounded-full bg-sage-100 px-2.5 py-0.5 text-xs font-extrabold text-sage-700">
                      Filled in from the PDF
                    </span>
                  )
                }
              />

              <TextField
                label="Author"
                name="author"
                value={author}
                onChange={(event) => setAuthor(event.target.value)}
                maxLength={BOOK_AUTHOR_MAX_LENGTH}
                placeholder="Optional"
                error={errors.author}
              />

              <div className="flex flex-col gap-1.5">
                <label htmlFor="bookcaseId" className="text-sm font-bold">
                  Bookcase
                </label>
                <select
                  id="bookcaseId"
                  name="bookcaseId"
                  value={bookcaseId}
                  onChange={(event) => setBookcaseId(event.target.value)}
                  className="min-h-12 rounded-2xl border-[1.5px] border-line bg-white px-3.5 text-[15px] text-ink outline-none focus:border-sage-600"
                >
                  {bookcases.map((bookcase) => (
                    <option key={bookcase.id} value={bookcase.id}>
                      {bookcase.name}
                    </option>
                  ))}
                </select>
                {errors.bookcaseId && <p className="text-[13px] font-semibold text-danger">{errors.bookcaseId}</p>}
              </div>

              <fieldset className="flex flex-col gap-2.5">
                <legend className="mb-2.5 text-sm font-bold">Spine color</legend>
                <div className="grid grid-cols-8 gap-2">
                  {SPINE_COLOR_VALUES.map((color) => (
                    <label
                      key={color}
                      className={cn(
                        "h-11 cursor-pointer rounded-xl border-[1.5px] border-ink has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-sage-600",
                        spineColor === color && "shadow-[0_0_0_3px_#FFFDF8,0_0_0_5.5px_#5A4636]",
                      )}
                      style={{ backgroundColor: color }}
                    >
                      <input
                        type="radio"
                        name="spineColor"
                        value={color}
                        checked={spineColor === color}
                        onChange={() => setSpineColor(color)}
                        aria-label={SPINE_COLOR_NAMES[color]}
                        className="sr-only"
                      />
                    </label>
                  ))}
                </div>
                <span className="text-[13px] text-ink-soft">Selected: {SPINE_COLOR_NAMES[spineColor]}</span>
              </fieldset>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t-[1.5px] border-[#F0E6DA] pt-4.5">
            <ModalCancelButton disabled={isBusy} />
            <Button type="submit" disabled={isBusy || !selected}>
              {status === "uploading" ? "Shelving..." : "Put on shelf"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}