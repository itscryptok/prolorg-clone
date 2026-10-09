/** Convert a stage name to a URL-safe slug */
export function toSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

/** Build a profile path from a stage name, falling back to numeric ID */
export function profilePath(stageName: string | null | undefined, id: number): string {
  if (stageName) return `/profile/${toSlug(stageName)}`;
  return `/profile/${id}`;
}
