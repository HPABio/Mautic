/**
 * Mautic OAuth2 Authentication Module
 */

import type { MauticConfig, OAuth2TokenResponse } from '../types/mautic';

export class MauticAuth {
  private config: MauticConfig;

  constructor(config: MauticConfig) {
    this.config = config;
  }

  /**
   * Generate authorization URL for OAuth2 flow
   */
  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      grant_type: 'authorization_code',
      redirect_uri: this.config.callbackUrl,
      response_type: 'code',
      ...(state && { state }),
    });

    return `${this.config.baseUrl}/oauth/v2/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async getAccessToken(code: string): Promise<OAuth2TokenResponse> {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      grant_type: 'authorization_code',
      redirect_uri: this.config.callbackUrl,
      code,
    });

    const response = await fetch(`${this.config.baseUrl}/oauth/v2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to get access token: ${JSON.stringify(error)}`);
    }

    return response.json();
  }

  /**
   * Refresh the access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<OAuth2TokenResponse> {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });

    const response = await fetch(`${this.config.baseUrl}/oauth/v2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to refresh token: ${JSON.stringify(error)}`);
    }

    return response.json();
  }

  /**
   * Get client credentials token (for server-to-server)
   */
  async getClientCredentialsToken(): Promise<OAuth2TokenResponse> {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      grant_type: 'client_credentials',
    });

    const response = await fetch(`${this.config.baseUrl}/oauth/v2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to get client credentials token: ${JSON.stringify(error)}`);
    }

    return response.json();
  }

  /**
   * Check if access token is expired
   */
  isTokenExpired(expiresAt?: number): boolean {
    if (!expiresAt) return true;
    // Add 60 second buffer to refresh before actual expiration
    return Date.now() >= expiresAt - 60000;
  }

  /**
   * Calculate token expiration timestamp
   */
  calculateExpiresAt(expiresIn: number): number {
    return Date.now() + expiresIn * 1000;
  }
}
