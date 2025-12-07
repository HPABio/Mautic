/**
 * Mautic API Client
 */

import type { MauticConfig, MauticApiResponse, MauticError } from '../types/mautic';
import { MauticAuth } from './auth';

export class MauticClient {
  private config: MauticConfig;
  private auth: MauticAuth;

  constructor(config: MauticConfig) {
    this.config = config;
    this.auth = new MauticAuth(config);
  }

  /**
   * Ensure we have a valid access token
   */
  private async ensureValidToken(): Promise<string> {
    // If we have a valid token, use it
    if (
      this.config.accessToken &&
      !this.auth.isTokenExpired(this.config.tokenExpiresAt)
    ) {
      return this.config.accessToken;
    }

    // If we have a refresh token, refresh the access token
    if (this.config.refreshToken) {
      const tokenResponse = await this.auth.refreshAccessToken(
        this.config.refreshToken
      );
      this.config.accessToken = tokenResponse.access_token;
      this.config.tokenExpiresAt = this.auth.calculateExpiresAt(
        tokenResponse.expires_in
      );
      if (tokenResponse.refresh_token) {
        this.config.refreshToken = tokenResponse.refresh_token;
      }
      return this.config.accessToken;
    }

    // Otherwise, use client credentials
    const tokenResponse = await this.auth.getClientCredentialsToken();
    this.config.accessToken = tokenResponse.access_token;
    this.config.tokenExpiresAt = this.auth.calculateExpiresAt(
      tokenResponse.expires_in
    );
    return this.config.accessToken;
  }

  /**
   * Make an authenticated API request
   */
  private async request<T>(
    method: string,
    endpoint: string,
    data?: any
  ): Promise<MauticApiResponse<T>> {
    const accessToken = await this.ensureValidToken();

    const url = `${this.config.baseUrl}/api${endpoint}`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (data) {
      if (method === 'GET') {
        const params = new URLSearchParams(data);
        const urlWithParams = `${url}?${params.toString()}`;
        const response = await fetch(urlWithParams, options);
        return this.handleResponse<T>(response);
      } else {
        headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(data);
      }
    }

    const response = await fetch(url, options);
    return this.handleResponse<T>(response);
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<MauticApiResponse<T>> {
    const data = await response.json();

    if (!response.ok) {
      const error: MauticError = {
        code: response.status,
        message: data.errors?.[0]?.message || 'Unknown error',
        details: data.errors,
      };
      throw error;
    }

    return data;
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: any): Promise<MauticApiResponse<T>> {
    return this.request<T>('GET', endpoint, params);
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any): Promise<MauticApiResponse<T>> {
    return this.request<T>('POST', endpoint, data);
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: any): Promise<MauticApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, data);
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any): Promise<MauticApiResponse<T>> {
    return this.request<T>('PUT', endpoint, data);
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<MauticApiResponse<T>> {
    return this.request<T>('DELETE', endpoint);
  }

  /**
   * Get the auth instance for manual token management
   */
  getAuth(): MauticAuth {
    return this.auth;
  }

  /**
   * Update config (useful for updating tokens)
   */
  updateConfig(updates: Partial<MauticConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Get current config (useful for persisting tokens)
   */
  getConfig(): MauticConfig {
    return { ...this.config };
  }
}
