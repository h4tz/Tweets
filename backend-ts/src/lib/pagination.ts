/**
 * Cursor pagination mirroring Django REST Framework's CursorPagination:
 * ordering by -created_at, page size 20, opaque base64 cursors, and
 * { next, previous, results } responses.
 */

export const PAGE_SIZE = 20;

type Dir = 'n' | 'p';

export interface Cursor {
  /** created_at of the boundary item */
  t: string;
  /** id of the boundary item (tie-breaker) */
  id: number;
  /** 'n' = fetch older items (default), 'p' = fetch newer items */
  d: Dir;
}

export interface Page<T> {
  next: string | null;
  previous: string | null;
  results: T[];
}

export function encodeCursor(createdAt: Date | string, id: number, d: Dir = 'n'): string {
  const t = createdAt instanceof Date ? createdAt.toISOString() : createdAt;
  return Buffer.from(JSON.stringify({ t, id, d })).toString('base64');
}

export function decodeCursor(raw?: string): Cursor | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(Buffer.from(raw, 'base64').toString('utf8')) as Cursor;
    if (typeof parsed.t !== 'string' || typeof parsed.id !== 'number') return null;
    return { t: parsed.t, id: parsed.id, d: parsed.d === 'p' ? 'p' : 'n' };
  } catch {
    return null;
  }
}

interface PaginateArgs<T, W> {
  cursor: Cursor | null;
  /** filter applied on every page (ANDed with cursor conditions) */
  baseWhere?: W;
  /** "older than cursor" filter for the default direction */
  whereOlder: (c: Cursor) => W;
  /** "newer than cursor" filter for the reverse direction */
  whereNewer: (c: Cursor) => W;
  findMany: (args: { where?: W; orderBy: Record<string, 'asc' | 'desc'>[]; take: number }) => Promise<T[]>;
  /** base path used to build next/previous URLs, e.g. "/api/tweets/" */
  baseUrl: string;
  /** extra query params to keep on next/previous links */
  query?: Record<string, string | undefined>;
}

function buildUrl(baseUrl: string, cursor: string, query?: Record<string, string | undefined>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) params.set(key, value);
  }
  params.set('cursor', cursor);
  return `${baseUrl}?${params.toString()}`;
}

/**
 * Runs a page query in either direction. Results are always returned newest
 * first, like the Django API.
 */
export async function paginate<T extends { id: number; createdAt: Date }, W>(
  args: PaginateArgs<T, W>,
): Promise<Page<T>> {
  const dir: Dir = args.cursor?.d ?? 'n';
  const orderBy: Record<string, 'asc' | 'desc'>[] = [
    { createdAt: dir === 'p' ? 'asc' : 'desc' },
    { id: dir === 'p' ? 'asc' : 'desc' },
  ];

  const findArgs: { where?: W; orderBy: typeof orderBy; take: number } = {
    take: PAGE_SIZE + 1,
    orderBy,
  };
  const cursorWhere = args.cursor
    ? dir === 'p'
      ? args.whereNewer(args.cursor)
      : args.whereOlder(args.cursor)
    : undefined;
  if (args.baseWhere && cursorWhere) {
    findArgs.where = { AND: [args.baseWhere, cursorWhere] } as W;
  } else if (args.baseWhere || cursorWhere) {
    findArgs.where = (args.baseWhere ?? cursorWhere) as W;
  }

  let rows = await args.findMany(findArgs);
  const moreInFetchDirection = rows.length > PAGE_SIZE;
  if (moreInFetchDirection) rows = rows.slice(0, PAGE_SIZE);
  if (rows.length === 0) return { next: null, previous: null, results: [] };
  if (dir === 'p') rows.reverse();

  // rows are newest-first here; oldest boundary drives "next"
  const oldest = rows[rows.length - 1];
  const newest = rows[0];

  const next =
    dir === 'n'
      ? moreInFetchDirection
        ? encodeCursor(oldest.createdAt, oldest.id, 'n')
        : null
      : // in reverse mode the original cursor item is older than the page, so
        // "next" is guaranteed non-empty
        encodeCursor(oldest.createdAt, oldest.id, 'n');

  const previous = args.cursor ? encodeCursor(newest.createdAt, newest.id, 'p') : null;

  return {
    next: next ? buildUrl(args.baseUrl, next, args.query) : null,
    previous: previous ? buildUrl(args.baseUrl, previous, args.query) : null,
    results: rows,
  };
}
