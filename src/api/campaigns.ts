/**
 * Mautic Campaigns API
 */

import type { MauticCampaign, MauticApiResponse } from '../types/mautic';
import { MauticClient } from './client';

export class MauticCampaigns {
  constructor(private client: MauticClient) {}

  /**
   * Get a single campaign by ID
   */
  async get(id: number): Promise<MauticCampaign> {
    const response = await this.client.get<MauticCampaign>(`/campaigns/${id}`);
    return response.campaign as MauticCampaign;
  }

  /**
   * List campaigns
   */
  async list(params?: {
    start?: number;
    limit?: number;
    search?: string;
  }): Promise<{ total: number; campaigns: Record<string, MauticCampaign> }> {
    const response = await this.client.get<Record<string, MauticCampaign>>(
      '/campaigns',
      params
    );
    return {
      total: response.total as number,
      campaigns: response.campaigns as Record<string, MauticCampaign>,
    };
  }

  /**
   * Create a new campaign
   */
  async create(data: MauticCampaign): Promise<MauticCampaign> {
    const response = await this.client.post<MauticCampaign>('/campaigns/new', data);
    return response.campaign as MauticCampaign;
  }

  /**
   * Update a campaign
   */
  async update(id: number, data: Partial<MauticCampaign>): Promise<MauticCampaign> {
    const response = await this.client.patch<MauticCampaign>(
      `/campaigns/${id}/edit`,
      data
    );
    return response.campaign as MauticCampaign;
  }

  /**
   * Delete a campaign
   */
  async delete(id: number): Promise<{ id: number }> {
    const response = await this.client.delete<{ id: number }>(
      `/campaigns/${id}/delete`
    );
    return response.campaign as { id: number };
  }

  /**
   * Add a contact to a campaign
   */
  async addContact(campaignId: number, contactId: number): Promise<any> {
    const response = await this.client.post<any>(
      `/campaigns/${campaignId}/contact/${contactId}/add`
    );
    return response;
  }

  /**
   * Remove a contact from a campaign
   */
  async removeContact(campaignId: number, contactId: number): Promise<any> {
    const response = await this.client.post<any>(
      `/campaigns/${campaignId}/contact/${contactId}/remove`
    );
    return response;
  }
}
