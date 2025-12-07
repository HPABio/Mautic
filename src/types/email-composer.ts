/**
 * Email Composer Type Definitions
 * Based on the modular email system architecture
 */

export interface EmailBlock {
  id: string;
  category: BlockCategory;
  tags: string[];
  tone?: EmailTone;
  variants: BlockVariant[];
}

export interface BlockVariant {
  id: string;
  text: string;
  placeholders?: string[];
  use_case?: string;
}

export type BlockCategory =
  | 'greeting'
  | 'opener'
  | 'intention'
  | 'event-info'
  | 'value-proposition'
  | 'cta'
  | 'closing';

export type EmailTone = 'formal' | 'casual' | 'personal';

export type IntentionType =
  | 'invite-attend'
  | 'invite-participate'
  | 'invite-mentor'
  | 'ask-share'
  | 'forward-request';

export type CTAType =
  | 'buy-ticket'
  | 'apply-contest'
  | 'share-social'
  | 'forward-internal'
  | 'respond-interest'
  | 'press-rsvp';

export interface AudienceConfig {
  name: string;
  tone: EmailTone;
  intention: string;
  valueProps: string[];
  cta: string;
  eventInfo: string;
  tags: string[];
  subjectTemplate?: string;
}

export interface AudienceConfigs {
  [audienceType: string]: AudienceConfig;
}

export interface EventDetails {
  event: {
    name: string;
    tagline: string;
    date: string;
    time: string;
    location: string;
    sectors: string[];
    focus: string;
    organizer: string;
    website: string;
    press_kit_url?: string;
    ticket_url?: string;
    contest_url?: string;
  };
  features?: {
    pitch_contest?: {
      name: string;
      description: string;
      benefits: string[];
    };
    networking?: {
      description: string;
    };
    recognition_program?: {
      connector_listing: string;
      special_supporter: string;
      requirements: string;
    };
  };
  nonprofit_context?: {
    limitation: string;
    community_reliance: string;
  };
}

export interface ContactData {
  // Required
  audience_type: string;
  email: string;

  // Identity
  first_name?: string;
  last_name?: string;
  title?: string;

  // Organizational
  organization_name?: string;
  company_name?: string;
  sector?: string;

  // Sender (can be global or per-contact)
  sender_name?: string;
  sender_title?: string;
  sender_email?: string;
  sender_organization?: string;

  // Optional
  contact_email?: string;
  event_date?: string;

  // Custom fields
  [key: string]: any;
}

export interface EmailCompositionOptions {
  tone?: EmailTone;
  customVariables?: Record<string, string>;
  blockOverrides?: {
    greeting?: string;
    opener?: string;
    intention?: string;
    eventInfo?: string;
    valueProps?: string[];
    cta?: string;
    closing?: string;
  };
  variantPreferences?: {
    [blockId: string]: string; // variantId
  };
  strict?: boolean; // Throw error on missing variables
  keepPlaceholders?: boolean; // Keep {{var}} if not found
}

export interface ComposedEmail {
  subject: string;
  body: string;
  metadata: {
    audience_type: string;
    tone: EmailTone;
    blocks_used: {
      greeting?: string;
      opener?: string;
      intention?: string;
      eventInfo?: string;
      valueProps?: string[];
      cta?: string;
      closing?: string;
    };
    variables_used: string[];
  };
}

export interface BatchEmailResult {
  contact: ContactData;
  email: ComposedEmail;
  error?: Error;
}

export interface BlockSelector {
  category: BlockCategory;
  selector: string; // Tag, filename, or tone
  variantId?: string;
}

export interface SubstitutionOptions {
  strict?: boolean;
  keepPlaceholders?: boolean;
  warnOnMissing?: boolean;
}
