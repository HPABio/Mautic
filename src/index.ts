/**
 * Mautic API Integration
 * Main entry point and SDK export
 */

import type { MauticConfig } from './types/mautic';
import { MauticClient } from './api/client';
import { MauticAuth } from './api/auth';
import { MauticContacts } from './api/contacts';
import { MauticEmails } from './api/emails';
import { MauticSegments } from './api/segments';
import { MauticCampaigns } from './api/campaigns';

export class MauticSDK {
  private client: MauticClient;
  public auth: MauticAuth;
  public contacts: MauticContacts;
  public emails: MauticEmails;
  public segments: MauticSegments;
  public campaigns: MauticCampaigns;

  constructor(config: MauticConfig) {
    this.client = new MauticClient(config);
    this.auth = this.client.getAuth();
    this.contacts = new MauticContacts(this.client);
    this.emails = new MauticEmails(this.client);
    this.segments = new MauticSegments(this.client);
    this.campaigns = new MauticCampaigns(this.client);
  }

  /**
   * Get the underlying client for advanced usage
   */
  getClient(): MauticClient {
    return this.client;
  }

  /**
   * Update SDK configuration (useful for updating tokens)
   */
  updateConfig(updates: Partial<MauticConfig>): void {
    this.client.updateConfig(updates);
  }

  /**
   * Get current configuration
   */
  getConfig(): MauticConfig {
    return this.client.getConfig();
  }
}

// Re-export types
export * from './types/mautic';
export { MauticClient } from './api/client';
export { MauticAuth } from './api/auth';
export { MauticContacts } from './api/contacts';
export { MauticEmails } from './api/emails';
export { MauticSegments } from './api/segments';
export { MauticCampaigns } from './api/campaigns';

// Default export
export default MauticSDK;
