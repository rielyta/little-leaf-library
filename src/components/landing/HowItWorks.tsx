import { SectionHeading } from "@/components/ui/SectionHeading";

const steps = [
  {
    title: "Create a bookcase",
    description: "Name the category and pick its wood color.",
    badge: "bg-blush-100",
  },
  {
    title: "Upload a PDF",
    description: "The title fills in from the file. Just pick a bookcase and a spine color.",
    badge: "bg-mist-100",
  },
  {
    title: "Start reading",
    description: "Click the book on the shelf and its pages are ready to turn.",
    badge: "bg-sage-100",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-title"
      className="border-y-[1.5px] border-blush-200 bg-blush-50"
    >
      <div className="page-container flex flex-col gap-10 py-22">
        <SectionHeading id="how-title" title="Three steps to your first shelf" align="center" />

        <ol className="grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="flex flex-col gap-3 rounded-[1.75rem] border-[1.5px] border-blush-200 bg-white p-7.5"
            >
              <span
                className={`flex size-11 items-center justify-center rounded-full border-[1.5px] border-ink font-display text-xl font-semibold ${step.badge}`}
              >
                {index + 1}
              </span>
              <h3 className="font-display text-[21px] font-semibold text-ink-strong">{step.title}</h3>
              <p className="leading-relaxed text-ink-soft">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}