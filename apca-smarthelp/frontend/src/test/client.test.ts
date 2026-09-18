import { describe, expect, it } from 'vitest';
import { getApiBaseUrl } from '../api/client';

describe('getApiBaseUrl', () => {
  it('returns the default local API URL when VITE_API_URL is unset', () => {
    expect(getApiBaseUrl()).toBe('http://127.0.0.1:8798');
  });
});

describe('ApiError', () => {
  it('exposes status and message', async () => {
    const { ApiError } = await import('../api/client');
    const err = new ApiError('Not found', 404);
    expect(err.message).toBe('Not found');
    expect(err.status).toBe(404);
    expect(err.name).toBe('ApiError');
  });
});
