/**
 * Kupi.cz HTTP client.
 * Realistic browser headers + Czech locale + bounded timeouts.
 * Returns the HTML body as text, or throws on transport / non-2xx errors.
 */

const BASE_URL = "https://www.kupi.cz";
const DEFAULT_TIMEOUT_MS = 10_000;

export class KupiFetchError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly url: string,
  ) {
    super(message);
    this.name = "KupiFetchError";
  }
}

export class KupiTimeoutError extends Error {
  constructor(public readonly url: string) {
    super(`Timeout fetching ${url}`);
    this.name = "KupiTimeoutError";
  }
}

type FetchOpts = {
  signal?: AbortSignal;
  timeoutMs?: number;
};

export async function kupiFetch(
  path: string,
  opts: FetchOpts = {},
): Promise<string> {
  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    opts.timeoutMs ?? DEFAULT_TIMEOUT_MS,
  );

  if (opts.signal) {
    opts.signal.addEventListener("abort", () => controller.abort());
  }

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "cs-CZ,cs;q=0.9,en;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
      signal: controller.signal,
      cache: "no-store",
    });

    if (!res.ok) {
      throw new KupiFetchError(
        `HTTP ${res.status} on ${path}`,
        res.status,
        url,
      );
    }

    return await res.text();
  } catch (err) {
    if (err instanceof KupiFetchError) throw err;
    if ((err as Error).name === "AbortError") throw new KupiTimeoutError(url);
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const KUPI_BASE = BASE_URL;
