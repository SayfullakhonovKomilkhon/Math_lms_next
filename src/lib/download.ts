import { AxiosError } from 'axios';
import api from '@/lib/api';

/**
 * Streams a binary response from the API and triggers a browser download.
 * Uses the shared axios instance so JWT auth + refresh-token interceptors apply.
 *
 * If the API responds with a JSON error (Content-Type: application/json), the
 * Blob is parsed and re-thrown as an Error with the original `message` so the
 * caller can show a human-readable toast instead of a generic failure.
 */
export async function downloadFromApi(
  url: string,
  filename: string,
  options?: { params?: Record<string, unknown> },
): Promise<void> {
  try {
    const res = await api.get(url, {
      params: options?.params,
      responseType: 'blob',
    });

    const contentType =
      (res.headers['content-type'] as string | undefined) ??
      'application/octet-stream';

    if (contentType.includes('application/json')) {
      const text = await (res.data as Blob).text();
      let message = 'Ошибка экспорта';
      try {
        const parsed = JSON.parse(text) as { message?: string | string[] };
        if (Array.isArray(parsed.message))
          message = parsed.message.join(', ');
        else if (typeof parsed.message === 'string') message = parsed.message;
      } catch {
        /* keep default */
      }
      throw new Error(message);
    }

    const blob = new Blob([res.data as BlobPart], { type: contentType });
    const objectUrl = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();

    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  } catch (err) {
    if (err instanceof AxiosError && err.response?.data instanceof Blob) {
      const text = await err.response.data.text();
      try {
        const parsed = JSON.parse(text) as { message?: string | string[] };
        const message = Array.isArray(parsed.message)
          ? parsed.message.join(', ')
          : parsed.message;
        if (message) throw new Error(message);
      } catch {
        /* fallthrough */
      }
    }
    throw err;
  }
}

export function extractApiErrorMessage(err: unknown, fallback = 'Ошибка'): string {
  if (err instanceof Error && err.message) return err.message;
  if (!err || typeof err !== 'object') return fallback;
  const response = (err as { response?: { data?: unknown } }).response;
  if (!response) return fallback;

  const data = response.data;
  if (data instanceof Blob) return fallback;
  if (typeof data === 'object' && data !== null && 'message' in data) {
    const msg = (data as { message?: string | string[] }).message;
    if (Array.isArray(msg)) return msg.join(', ');
    if (typeof msg === 'string') return msg;
  }
  return fallback;
}
