/**
 * Mautic Segments API
 */

import type { MauticSegment, MauticApiResponse } from '../types/mautic';
import { MauticClient } from './client';

export class MauticSegments {
  constructor(private client: MauticClient) {}

  /**
   * Get a single segment by ID
   */
  async get(id: number): Promise<MauticSegment> {
    const response = await this.client.get<MauticSegment>(`/segments/${id}`);
    return response.list as MauticSegment;
  }

  /**
   * List segments
   */
  async list(params?: {
    start?: number;
    limit?: number;
    search?: string;
  }): Promise<{ total: number; segments: Record<string, MauticSegment> }> {
    const response = await this.client.get<Record<string, MauticSegment>>(
      '/segments',
      params
    );
    return {
      total: response.total as number,
      segments: response.lists as Record<string, MauticSegment>,
    };
  }

  /**
   * Create a new segment
   */
  async create(data: MauticSegment): Promise<MauticSegment> {
    const response = await this.client.post<MauticSegment>('/segments/new', data);
    return response.list as MauticSegment;
  }

  /**
   * Update a segment
   */
  async update(id: number, data: Partial<MauticSegment>): Promise<MauticSegment> {
    const response = await this.client.patch<MauticSegment>(
      `/segments/${id}/edit`,
      data
    );
    return response.list as MauticSegment;
  }

  /**
   * Delete a segment
   */
  async delete(id: number): Promise<{ id: number }> {
    const response = await this.client.delete<{ id: number }>(`/segments/${id}/delete`);
    return response.list as { id: number };
  }

  /**
   * Add a contact to a segment
   */
  async addContact(segmentId: number, contactId: number): Promise<any> {
    const response = await this.client.post<any>(
      `/segments/${segmentId}/contact/${contactId}/add`
    );
    return response;
  }

  /**
   * Remove a contact from a segment
   */
  async removeContact(segmentId: number, contactId: number): Promise<any> {
    const response = await this.client.post<any>(
      `/segments/${segmentId}/contact/${contactId}/remove`
    );
    return response;
  }
}
