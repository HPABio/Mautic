/**
 * Email Composer
 * Orchestrates email generation from modular blocks
 */

import type {
  ContactData,
  EmailCompositionOptions,
  ComposedEmail,
  BatchEmailResult,
  AudienceConfigs,
  EventDetails,
} from '../types/email-composer';
import { BlockSelector } from './block-selector';
import { VariableSubstitution } from './variable-substitution';
import { promises as fs } from 'fs';
import { join } from 'path';

export class EmailComposer {
  private blockSelector: BlockSelector;
  private variableSubstitution: VariableSubstitution;
  private audienceConfigs: AudienceConfigs;
  private eventDetails: EventDetails;
  private configDir: string;

  constructor(configDir?: string, blocksDir?: string) {
    this.configDir = configDir || join(process.cwd(), 'src/email-composer/config');
    this.blockSelector = new BlockSelector(blocksDir);
    this.variableSubstitution = new VariableSubstitution();
    this.audienceConfigs = {};
    this.eventDetails = { event: {} as any };
  }

  /**
   * Initialize composer by loading configurations
   */
  async initialize(): Promise<void> {
    await this.loadAudienceConfigs();
    await this.loadEventDetails();
    await this.blockSelector.loadAllBlocks();
  }

  /**
   * Load audience configurations
   */
  private async loadAudienceConfigs(): Promise<void> {
    try {
      const configPath = join(this.configDir, 'audiences.json');
      const content = await fs.readFile(configPath, 'utf-8');
      const data = JSON.parse(content);
      this.audienceConfigs = data.audiences || data;
    } catch (error) {
      console.warn('Could not load audience configs, using defaults');
      this.audienceConfigs = this.getDefaultAudienceConfigs();
    }
  }

  /**
   * Load event details
   */
  private async loadEventDetails(): Promise<void> {
    try {
      const configPath = join(this.configDir, 'event-details.json');
      const content = await fs.readFile(configPath, 'utf-8');
      this.eventDetails = JSON.parse(content);
    } catch (error) {
      console.warn('Could not load event details');
      this.eventDetails = { event: {} as any };
    }
  }

  /**
   * Prepare variables for substitution
   */
  private prepareVariables(contact: ContactData, options: EmailCompositionOptions = {}): Record<string, any> {
    const variables: Record<string, any> = {
      // Contact fields
      first_name: contact.first_name || '',
      last_name: contact.last_name || '',
      title: contact.title || '',
      email: contact.email,
      organization_name: contact.organization_name || '',
      company_name: contact.company_name || contact.organization_name || '',
      sector: contact.sector || 'biotech',

      // Sender fields
      sender_name: contact.sender_name || '',
      sender_title: contact.sender_title || '',
      sender_email: contact.sender_email || '',
      sender_organization: contact.sender_organization || '',

      // Event fields
      event_name: this.eventDetails.event?.name || '',
      event_date: contact.event_date || this.eventDetails.event?.date || '',
      event_time: this.eventDetails.event?.time || '',
      event_location: this.eventDetails.event?.location || '',
      event_website: this.eventDetails.event?.website || '',
      ticket_url: this.eventDetails.event?.ticket_url || '',
      contest_url: this.eventDetails.event?.contest_url || '',
      press_kit_url: this.eventDetails.event?.press_kit_url || '',

      // Optional contact fields
      contact_email: contact.contact_email || contact.email,

      // Custom variables
      ...(options.customVariables || {}),

      // Any additional contact fields
      ...Object.keys(contact)
        .filter(k => !['audience_type', 'email', 'first_name', 'last_name'].includes(k))
        .reduce((acc, k) => ({ ...acc, [k]: contact[k] }), {}),
    };

    return variables;
  }

  /**
   * Generate subject line for email
   */
  private generateSubject(audienceType: string, contact: ContactData): string {
    const config = this.audienceConfigs[audienceType];
    const eventName = this.eventDetails.event?.name || 'Event';

    if (config?.subjectTemplate) {
      const variables = this.prepareVariables(contact);
      return this.variableSubstitution.substitute(config.subjectTemplate, variables);
    }

    // Default subject templates by audience type
    const subjectTemplates: Record<string, string> = {
      nonprofits: `Partnership Opportunity: ${eventName}`,
      vcs: `Invitation: ${eventName} - Biotech Startup Showcase`,
      'startups-pitch': `Pitch Your Startup at ${eventName}`,
      'startups-share': `Help Us Spread the Word: ${eventName}`,
      gradschools: `Student Opportunity: ${eventName}`,
      mentors: `Invitation to Judge: ${eventName} Pitch Contest`,
      'startup-factories': `Connect with Biotech Ecosystem: ${eventName}`,
      vips: `Personal Invitation: ${eventName}`,
      journalists: `Press Invitation: ${eventName}`,
    };

    return subjectTemplates[audienceType] || `Invitation: ${eventName}`;
  }

  /**
   * Compose a single email
   */
  async composeEmail(
    contact: ContactData,
    options: EmailCompositionOptions = {}
  ): Promise<ComposedEmail> {
    const audienceType = contact.audience_type;
    const audienceConfig = this.audienceConfigs[audienceType];

    if (!audienceConfig) {
      throw new Error(`Unknown audience type: ${audienceType}`);
    }

    const tone = options.tone || audienceConfig.tone;
    const variables = this.prepareVariables(contact, options);

    // Select blocks
    const greeting = await this.blockSelector.selectBlock(
      'greeting',
      options.blockOverrides?.greeting || tone
    );

    const opener = await this.blockSelector.selectBlock(
      'opener',
      options.blockOverrides?.opener || audienceConfig.intention
    );

    const intention = await this.blockSelector.selectBlock(
      'intention',
      options.blockOverrides?.intention || audienceConfig.intention
    );

    const eventInfo = await this.blockSelector.selectBlock(
      'event-info',
      options.blockOverrides?.eventInfo || audienceConfig.eventInfo || 'brief'
    );

    // Value propositions (can be multiple)
    const valuePropsSelectors = options.blockOverrides?.valueProps || audienceConfig.valueProps || [];
    const valueProps = await Promise.all(
      valuePropsSelectors.map(selector =>
        this.blockSelector.selectBlock('value-proposition', selector)
      )
    );

    const cta = await this.blockSelector.selectBlock(
      'cta',
      options.blockOverrides?.cta || audienceConfig.cta
    );

    const closing = await this.blockSelector.selectBlock(
      'closing',
      options.blockOverrides?.closing || tone
    );

    // Assemble email blocks
    const blocks: string[] = [];
    const blocksUsed: any = {};

    if (greeting?.variant) {
      const text = this.variableSubstitution.substitute(
        greeting.variant.text,
        variables,
        options
      );
      blocks.push(text);
      blocksUsed.greeting = greeting.block.id;
    }

    if (opener?.variant) {
      const text = this.variableSubstitution.substitute(
        opener.variant.text,
        variables,
        options
      );
      blocks.push(text);
      blocksUsed.opener = opener.block.id;
    }

    if (intention?.variant) {
      const text = this.variableSubstitution.substitute(
        intention.variant.text,
        variables,
        options
      );
      blocks.push(text);
      blocksUsed.intention = intention.block.id;
    }

    if (eventInfo?.variant) {
      const text = this.variableSubstitution.substitute(
        eventInfo.variant.text,
        variables,
        options
      );
      blocks.push(text);
      blocksUsed.eventInfo = eventInfo.block.id;
    }

    // Add value propositions
    const valuePropsUsed: string[] = [];
    for (const vp of valueProps) {
      if (vp?.variant) {
        const text = this.variableSubstitution.substitute(
          vp.variant.text,
          variables,
          options
        );
        blocks.push(text);
        valuePropsUsed.push(vp.block.id);
      }
    }
    if (valuePropsUsed.length > 0) {
      blocksUsed.valueProps = valuePropsUsed;
    }

    if (cta?.variant) {
      const text = this.variableSubstitution.substitute(
        cta.variant.text,
        variables,
        options
      );
      blocks.push(text);
      blocksUsed.cta = cta.block.id;
    }

    if (closing?.variant) {
      const text = this.variableSubstitution.substitute(
        closing.variant.text,
        variables,
        options
      );
      blocks.push(text);
      blocksUsed.closing = closing.block.id;
    }

    // Generate subject
    const subject = this.generateSubject(audienceType, contact);

    // Assemble final email
    const body = blocks.join('\n\n');

    return {
      subject,
      body,
      metadata: {
        audience_type: audienceType,
        tone,
        blocks_used: blocksUsed,
        variables_used: this.variableSubstitution.extractPlaceholders(body),
      },
    };
  }

  /**
   * Compose emails for a batch of contacts
   */
  async composeBatch(
    contacts: ContactData[],
    globalOptions: EmailCompositionOptions = {},
    perContactOptions?: Map<string, EmailCompositionOptions>
  ): Promise<BatchEmailResult[]> {
    const results: BatchEmailResult[] = [];

    for (const contact of contacts) {
      try {
        const options = perContactOptions?.get(contact.email) || globalOptions;
        const email = await this.composeEmail(contact, options);

        results.push({
          contact,
          email,
        });
      } catch (error) {
        console.error(`Error composing email for ${contact.email}:`, error);
        results.push({
          contact,
          email: {
            subject: '',
            body: '',
            metadata: {
              audience_type: contact.audience_type,
              tone: 'casual',
              blocks_used: {},
              variables_used: [],
            },
          },
          error: error as Error,
        });
      }
    }

    return results;
  }

  /**
   * Get default audience configurations
   */
  private getDefaultAudienceConfigs(): AudienceConfigs {
    return {
      nonprofits: {
        name: 'Nonprofit Organizations',
        tone: 'casual',
        intention: 'ask-share',
        valueProps: ['recognition', 'community'],
        cta: 'share-social',
        eventInfo: 'brief',
        tags: ['partnership', 'community'],
      },
      vcs: {
        name: 'Venture Capitalists & Investors',
        tone: 'formal',
        intention: 'invite-attend',
        valueProps: ['deal-flow', 'networking'],
        cta: 'buy-ticket',
        eventInfo: 'detailed',
        tags: ['investor', 'formal'],
      },
      'startups-pitch': {
        name: 'Startups (Pitch Contest)',
        tone: 'casual',
        intention: 'invite-participate',
        valueProps: ['exposure', 'networking'],
        cta: 'apply-contest',
        eventInfo: 'contest',
        tags: ['startup', 'competition'],
      },
      'startups-share': {
        name: 'Startups (Share Event)',
        tone: 'casual',
        intention: 'ask-share',
        valueProps: ['recognition', 'community'],
        cta: 'share-social',
        eventInfo: 'brief',
        tags: ['startup', 'community'],
      },
      gradschools: {
        name: 'Graduate Schools & Universities',
        tone: 'formal',
        intention: 'forward-request',
        valueProps: ['community', 'networking'],
        cta: 'forward-internal',
        eventInfo: 'detailed',
        tags: ['academic', 'students'],
      },
      mentors: {
        name: 'Mentors & Judges',
        tone: 'casual',
        intention: 'invite-mentor',
        valueProps: ['recognition', 'networking', 'community'],
        cta: 'respond-interest',
        eventInfo: 'contest',
        tags: ['mentor', 'expert'],
      },
      'startup-factories': {
        name: 'Incubators & Accelerators',
        tone: 'formal',
        intention: 'invite-attend',
        valueProps: ['community', 'networking', 'recognition'],
        cta: 'respond-interest',
        eventInfo: 'detailed',
        tags: ['ecosystem', 'partner'],
      },
      vips: {
        name: 'VIPs & Speakers',
        tone: 'personal',
        intention: 'invite-attend',
        valueProps: ['networking', 'recognition'],
        cta: 'respond-interest',
        eventInfo: 'brief',
        tags: ['vip', 'personal'],
      },
      journalists: {
        name: 'Journalists & Media',
        tone: 'casual',
        intention: 'invite-attend',
        valueProps: ['press-access', 'media-story'],
        cta: 'press-rsvp',
        eventInfo: 'brief',
        tags: ['press', 'media'],
      },
    };
  }

  /**
   * Get available audience types
   */
  getAudienceTypes(): string[] {
    return Object.keys(this.audienceConfigs);
  }

  /**
   * Get audience configuration
   */
  getAudienceConfig(audienceType: string) {
    return this.audienceConfigs[audienceType];
  }
}

export default EmailComposer;
