/** Reduce an href/pathname to a bare comparable path: strip query + hash + trailing slash (keep root '/'). */
export function normalizePath(input: string): string {
  const path = input.split('?')[0].split('#')[0]
  if (path.length > 1 && path.endsWith('/')) return path.slice(0, -1)
  return path
}
