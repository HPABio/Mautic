/**
 * Environment Configuration
 * Load and validate environment variables
 */

import type { MauticConfig } from '../types/mautic';

export function loadConfig(): MauticConfig {
  const baseUrl = process.env.MAUTIC_BASE_URL;
  const clientId = process.env.MAUTIC_CLIENT_ID;
  const clientSecret = process.env.MAUTIC_CLIENT_SECRET;
  const callbackUrl = process.env.MAUTIC_CALLBACK_URL;

  if (!baseUrl || !clientId || !clientSecret || !callbackUrl) {
    throw new Error(
      'Missing required environment variables: MAUTIC_BASE_URL, MAUTIC_CLIENT_ID, MAUTIC_CLIENT_SECRET, MAUTIC_CALLBACK_URL'
    );
  }

  return {
    baseUrl,
    clientId,
    clientSecret,
    callbackUrl,
    accessToken: process.env.MAUTIC_ACCESS_TOKEN,
    refreshToken: process.env.MAUTIC_REFRESH_TOKEN,
    tokenExpiresAt: process.env.MAUTIC_TOKEN_EXPIRES_AT
      ? parseInt(process.env.MAUTIC_TOKEN_EXPIRES_AT, 10)
      : undefined,
  };
}

export function validateConfig(config: MauticConfig): boolean {
  if (!config.baseUrl || !config.clientId || !config.clientSecret || !config.callbackUrl) {
    return false;
  }

  // Validate URL format
  try {
    new URL(config.baseUrl);
    new URL(config.callbackUrl);
  } catch {
    return false;
  }

  return true;
}
