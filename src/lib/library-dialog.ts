export const LIBRARY_PATH = "/library";

export function openLibraryDialog(href: string, options: { replace?: boolean } = {}) {
  if (options.replace) {
    window.history.replaceState(null, "", href);
  } else {
    window.history.pushState(null, "", href);
  }
}

export function closeLibraryDialog() {
  window.history.replaceState(null, "", LIBRARY_PATH);
}