/**
 * Mautic Emails API
 */

import type {
  MauticEmail,
  MauticApiResponse,
  EmailSendParams,
} from '../types/mautic';
import { MauticClient } from './client';

export class MauticEmails {
  constructor(private client: MauticClient) {}

  /**
   * Get a single email by ID
   */
  async get(id: number): Promise<MauticEmail> {
    const response = await this.client.get<MauticEmail>(`/emails/${id}`);
    return response.email as MauticEmail;
  }

  /**
   * List emails
   */
  async list(params?: {
    start?: number;
    limit?: number;
    search?: string;
    published?: boolean;
  }): Promise<{ total: number; emails: Record<string, MauticEmail> }> {
    const response = await this.client.get<Record<string, MauticEmail>>(
      '/emails',
      params
    );
    return {
      total: response.total as number,
      emails: response.emails as Record<string, MauticEmail>,
    };
  }

  /**
   * Create a new email
   */
  async create(data: MauticEmail): Promise<MauticEmail> {
    const response = await this.client.post<MauticEmail>('/emails/new', data);
    return response.email as MauticEmail;
  }

  /**
   * Update an email
   */
  async update(id: number, data: Partial<MauticEmail>): Promise<MauticEmail> {
    const response = await this.client.patch<MauticEmail>(
      `/emails/${id}/edit`,
      data
    );
    return response.email as MauticEmail;
  }

  /**
   * Delete an email
   */
  async delete(id: number): Promise<{ id: number }> {
    const response = await this.client.delete<{ id: number }>(`/emails/${id}/delete`);
    return response.email as { id: number };
  }

  /**
   * Send email to a contact
   */
  async sendToContact(emailId: number, contactId: number, tokens?: Record<string, string>): Promise<any> {
    const response = await this.client.post<any>(
      `/emails/${emailId}/contact/${contactId}/send`,
      tokens ? { tokens } : undefined
    );
    return response;
  }

  /**
   * Send email to a segment
   */
  async sendToSegment(emailId: number, segmentId?: number): Promise<any> {
    const endpoint = segmentId
      ? `/emails/${emailId}/send/list/${segmentId}`
      : `/emails/${emailId}/send`;
    const response = await this.client.post<any>(endpoint);
    return response;
  }

  /**
   * Send email to specific email addresses
   */
  async sendToEmails(emailId: number, params: EmailSendParams): Promise<any> {
    const response = await this.client.post<any>(
      `/emails/${emailId}/send`,
      params
    );
    return response;
  }

  /**
   * Get email statistics
   */
  async getStats(emailId: number): Promise<any> {
    const response = await this.client.get<any>(`/emails/${emailId}/stats`);
    return response;
  }
}
