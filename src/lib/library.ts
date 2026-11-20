export const LIBRARY_NAME_MAX_LENGTH = 40;

export function defaultLibraryName(ownerName: string) {
  const firstName = ownerName.trim().split(/\s+/)[0];
  return firstName ? `${firstName}'s Little Library` : "My Little Library";
}

export function displayLibraryName(savedName: string | null, ownerName: string) {
  return savedName?.trim() || defaultLibraryName(ownerName);
}