/**
 * Mautic Contacts API
 */

import type {
  MauticContact,
  MauticApiResponse,
  ContactCreateParams,
} from '../types/mautic';
import { MauticClient } from './client';

export class MauticContacts {
  constructor(private client: MauticClient) {}

  /**
   * Get a single contact by ID
   */
  async get(id: number): Promise<MauticContact> {
    const response = await this.client.get<MauticContact>(`/contacts/${id}`);
    return response.contact as MauticContact;
  }

  /**
   * List contacts with optional filters
   */
  async list(params?: {
    start?: number;
    limit?: number;
    where?: Array<{ col: string; expr: string; val: string }>;
    order?: Array<{ col: string; dir: 'asc' | 'desc' }>;
    search?: string;
  }): Promise<{ total: number; contacts: Record<string, MauticContact> }> {
    const response = await this.client.get<Record<string, MauticContact>>(
      '/contacts',
      params
    );
    return {
      total: response.total as number,
      contacts: response.contacts as Record<string, MauticContact>,
    };
  }

  /**
   * Create a new contact
   */
  async create(data: ContactCreateParams): Promise<MauticContact> {
    const response = await this.client.post<MauticContact>('/contacts/new', data);
    return response.contact as MauticContact;
  }

  /**
   * Update an existing contact
   */
  async update(id: number, data: Partial<ContactCreateParams>): Promise<MauticContact> {
    const response = await this.client.patch<MauticContact>(
      `/contacts/${id}/edit`,
      data
    );
    return response.contact as MauticContact;
  }

  /**
   * Delete a contact
   */
  async delete(id: number): Promise<{ id: number }> {
    const response = await this.client.delete<{ id: number }>(`/contacts/${id}/delete`);
    return response.contact as { id: number };
  }

  /**
   * Add contact to a segment
   */
  async addToSegment(contactId: number, segmentId: number): Promise<MauticContact> {
    const response = await this.client.post<MauticContact>(
      `/segments/${segmentId}/contact/${contactId}/add`
    );
    return response.contact as MauticContact;
  }

  /**
   * Remove contact from a segment
   */
  async removeFromSegment(contactId: number, segmentId: number): Promise<MauticContact> {
    const response = await this.client.post<MauticContact>(
      `/segments/${segmentId}/contact/${contactId}/remove`
    );
    return response.contact as MauticContact;
  }

  /**
   * Get contact's segments
   */
  async getSegments(contactId: number): Promise<any> {
    const response = await this.client.get<any>(`/contacts/${contactId}/segments`);
    return response;
  }

  /**
   * Add points to a contact
   */
  async addPoints(contactId: number, points: number, eventName?: string): Promise<any> {
    const response = await this.client.post<any>(
      `/contacts/${contactId}/points/plus/${points}`,
      eventName ? { eventName } : undefined
    );
    return response;
  }

  /**
   * Subtract points from a contact
   */
  async subtractPoints(
    contactId: number,
    points: number,
    eventName?: string
  ): Promise<any> {
    const response = await this.client.post<any>(
      `/contacts/${contactId}/points/minus/${points}`,
      eventName ? { eventName } : undefined
    );
    return response;
  }

  /**
   * Get contact activity/events
   */
  async getActivity(
    contactId: number,
    params?: { search?: string; includeEvents?: string[]; excludeEvents?: string[] }
  ): Promise<any> {
    const response = await this.client.get<any>(
      `/contacts/${contactId}/activity`,
      params
    );
    return response;
  }

  /**
   * Batch create or update contacts
   */
  async batchCreateOrUpdate(contacts: ContactCreateParams[]): Promise<any> {
    const response = await this.client.post<any>('/contacts/batch/new', contacts);
    return response;
  }
}
