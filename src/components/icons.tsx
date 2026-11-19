import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function IconBase({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function BookcaseIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M4 9.5h16M4 15.5h16" />
      <path d="M7.5 9.5v-4M10 9.5v-3M12.5 9.5V5M8 15.5V12M10.5 15.5v-3" />
      <path d="M7 21v1.5M17 21v1.5" />
    </IconBase>
  );
}

export function UploadIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M6.5 2.5h8l5 5V20a1.5 1.5 0 0 1-1.5 1.5H6.5A1.5 1.5 0 0 1 5 20V4a1.5 1.5 0 0 1 1.5-1.5z" />
      <path d="M14.5 2.5v5h5" />
      <path d="M12 18v-6.5M9 14.5l3-3 3 3" />
    </IconBase>
  );
}

export function OpenBookIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 6c-2.2-1.9-5.2-2.3-9-2.3v15c3.8 0 6.8.4 9 2.3 2.2-1.9 5.2-2.3 9-2.3v-15c-3.8 0-6.8.4-9 2.3z" />
      <path d="M12 6v15" />
      <path d="M16.5 3.9v6l1.5-1.1 1.5 1.1V3.9" />
    </IconBase>
  );
}

export function BookmarkIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M7 3h10v18l-5-4-5 4z" />
    </IconBase>
  );
}

export function HighlightIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M14.5 4.5l5 5L10 19H5v-5z" />
      <path d="M12 7l5 5" />
      <path d="M4 22h16" />
    </IconBase>
  );
}

export function CommentIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-7l-4 3v-3H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />
      <path d="M8 9h8M8 12h5" />
    </IconBase>
  );
}

export function ResumeIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 12a8 8 0 1 0 2.4-5.7" />
      <path d="M4 4v4h4" />
      <path d="M12 8v4l3 2" />
    </IconBase>
  );
}