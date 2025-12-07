/**
 * Tests for Mautic Authentication
 */

import { describe, test, expect } from 'bun:test';
import { MauticAuth } from '../src/api/auth';
import type { MauticConfig } from '../src/types/mautic';

describe('MauticAuth', () => {
  const mockConfig: MauticConfig = {
    baseUrl: 'https://mautic.example.com',
    clientId: 'test_client_id',
    clientSecret: 'test_client_secret',
    callbackUrl: 'http://localhost:3000/callback',
  };

  const auth = new MauticAuth(mockConfig);

  test('should generate correct authorization URL', () => {
    const url = auth.getAuthorizationUrl('test-state-123');

    expect(url).toContain('https://mautic.example.com/oauth/v2/authorize');
    expect(url).toContain('client_id=test_client_id');
    expect(url).toContain('grant_type=authorization_code');
    expect(url).toContain('response_type=code');
    expect(url).toContain('state=test-state-123');
    expect(url).toContain(encodeURIComponent('http://localhost:3000/callback'));
  });

  test('should calculate correct token expiration', () => {
    const expiresIn = 3600; // 1 hour
    const expiresAt = auth.calculateExpiresAt(expiresIn);
    const expectedExpiresAt = Date.now() + expiresIn * 1000;

    // Allow 1 second difference for test execution time
    expect(Math.abs(expiresAt - expectedExpiresAt)).toBeLessThan(1000);
  });

  test('should correctly identify expired tokens', () => {
    const pastTimestamp = Date.now() - 1000; // 1 second ago
    expect(auth.isTokenExpired(pastTimestamp)).toBe(true);

    const futureTimestamp = Date.now() + 3600000; // 1 hour from now
    expect(auth.isTokenExpired(futureTimestamp)).toBe(false);

    expect(auth.isTokenExpired(undefined)).toBe(true);
  });

  test('should consider token expired with 60 second buffer', () => {
    const almostExpired = Date.now() + 30000; // 30 seconds from now
    expect(auth.isTokenExpired(almostExpired)).toBe(true);

    const notYetExpired = Date.now() + 120000; // 2 minutes from now
    expect(auth.isTokenExpired(notYetExpired)).toBe(false);
  });
});
